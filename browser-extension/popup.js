// Popup script for Portify extension
class PortifyPopup {
  constructor() {
    this.port = null;
    this.sessionId = null;
    this.isConnected = false;
    this.pendingReconnect = false;
    
    this.init();
  }
  
  async init() {
    // Restore session and UI state from storage
    await this.restoreSession();
    try {
      const { portifyPopupState } = await chrome.storage.local.get(['portifyPopupState']);
      if (portifyPopupState) {
        const offerInput = document.getElementById('offerInput');
        const answerOutput = document.getElementById('answerOutput');
        if (offerInput && portifyPopupState.offerInputValue) offerInput.value = portifyPopupState.offerInputValue;
        if (answerOutput && portifyPopupState.answerOutputValue) answerOutput.value = portifyPopupState.answerOutputValue;
      }
    } catch (e) {
      // ignore
    }
    this.setupEventListeners();
    window.addEventListener('beforeunload', () => {
      this.saveSession();
    });
    this.updateUI();
  }
  
  async restoreSession() {
    try {
      const result = await chrome.storage.local.get(['portifySession']);
      if (result.portifySession) {
        const session = result.portifySession;
        if (session.sessionId) {
          this.sessionId = session.sessionId;
          this.isConnected = session.isConnected ?? true;
          await this.connect(true);
        }
      }
    } catch (error) {
      console.log('No previous session to restore');
    }
  }
  
  async saveSession() {
    try {
      await chrome.storage.local.set({
        portifySession: {
          sessionId: this.sessionId,
          isConnected: this.isConnected,
          timestamp: Date.now()
        }
      });
    } catch (error) {
      console.error('Failed to save session:', error);
    }
  }
  
  setupEventListeners() {
    document.getElementById('connectBtn').addEventListener('click', () => {
      this.toggleConnection();
    });
    
    document.getElementById('copyBtn').addEventListener('click', () => {
      this.copySessionId();
    });
    
    const sendOfferBtn = document.getElementById('sendOfferBtn');
    if (sendOfferBtn) {
      sendOfferBtn.addEventListener('click', () => this.sendOfferToExtension());
    }
    const copyAnswerBtn = document.getElementById('copyAnswerBtn');
    if (copyAnswerBtn) {
      copyAnswerBtn.addEventListener('click', () => this.copyAnswer());
    }

    // Persist offer/answer fields so popup close doesn't lose them
    const offerInput = document.getElementById('offerInput');
    const answerOutput = document.getElementById('answerOutput');
    if (offerInput) {
      offerInput.addEventListener('input', async () => {
        const ans = document.getElementById('answerOutput');
        await chrome.storage.local.set({
          portifyPopupState: {
            offerInputValue: offerInput.value,
            answerOutputValue: ans ? ans.value : ''
          }
        });
      });
    }
    if (answerOutput) {
      answerOutput.addEventListener('input', async () => {
        const off = document.getElementById('offerInput');
        await chrome.storage.local.set({
          portifyPopupState: {
            offerInputValue: off ? off.value : '',
            answerOutputValue: answerOutput.value
          }
        });
      });
    }
    
    // Update UI every second
    setInterval(() => {
      this.updateUI();
    }, 1000);
  }
  
  async toggleConnection() {
    if (this.isConnected && this.port) {
      this.disconnect();
    } else {
      await this.connect(this.sessionId ? true : false);
    }
  }
  
  async connect(isReconnecting = false) {
    try {
      // Connect to background script
      this.port = chrome.runtime.connect({ name: 'portify-automation' });
      this.pendingReconnect = isReconnecting;
      
      this.port.onMessage.addListener((message) => {
        this.handleMessage(message);
      });
      
      this.port.onDisconnect.addListener(() => {
        this.handleDisconnect();
      });

      // Inform background whether this is a reconnect with an existing session
      this.port.postMessage({
        type: 'INIT',
        reconnect: isReconnecting && !!this.sessionId,
        sessionId: this.sessionId
      });
      
      document.getElementById('connectBtn').textContent = 'Connecting...';
      document.getElementById('connectBtn').disabled = true;
      
    } catch (error) {
      console.error('Connection failed:', error);
      this.showError('Failed to connect: ' + error.message);
    }
  }
  
  async disconnect() {
    if (this.port) {
      this.port.disconnect();
    }
    await this.clearSession();
  }
  
  handleMessage(message) {
    switch (message.type) {
      case 'SESSION_CREATED':
        if (this.pendingReconnect && this.sessionId) {
          // Ignore stray creation during reconnect
          return;
        }
        this.sessionId = message.sessionId;
        this.isConnected = true;
        this.pendingReconnect = false;
        this.saveSession();
        this.updateUI();
        this.copyToClipboard(this.sessionId);
        break;
        
      case 'SESSION_RECONNECTED':
        this.sessionId = message.sessionId;
        this.isConnected = true;
        this.pendingReconnect = false;
        this.saveSession();
        this.updateUI();
        break;
        
      case 'WEBRTC_CONNECTED':
        this.showSuccess('Connected to web app!');
        break;
        
      case 'AUTOMATION_STARTED':
        this.showInfo('Automation started');
        break;
      
      case 'WEBRTC_ANSWER':
        try {
          const answerOutput = document.getElementById('answerOutput');
          if (answerOutput) {
            const answerJson = JSON.stringify(message.answer);
            answerOutput.value = answerJson;
            this.copyToClipboard(answerJson);
            // Persist for when popup closes
            const offerInput = document.getElementById('offerInput');
            chrome.storage.local.set({
              portifyPopupState: {
                offerInputValue: offerInput ? offerInput.value : '',
                answerOutputValue: answerJson
              }
            });
            this.showSuccess('Answer generated and copied! Paste into the web app.');
          }
        } catch (e) {
          this.showError('Failed to process answer');
        }
        break;
      
      case 'ERROR':
        this.showError(message.error);
        break;
    }
  }
  
  handleDisconnect() {
    this.port = null;
    // Don't clear session info - keep it for reconnection
    this.updateUI();
  }
  
  async clearSession() {
    this.sessionId = null;
    this.isConnected = false;
    await chrome.storage.local.remove(['portifySession']);
    this.updateUI();
  }
  
  updateUI() {
    const statusIndicator = document.getElementById('statusIndicator');
    const statusText = document.getElementById('statusText');
    const connectBtn = document.getElementById('connectBtn');
    const sessionInfo = document.getElementById('sessionInfo');
    const sessionIdSpan = document.getElementById('sessionId');
    const connectionStatus = document.getElementById('connectionStatus');
    
    if (this.isConnected && this.sessionId && this.port) {
      statusIndicator.className = 'status-indicator connected';
      statusText.textContent = 'Connected - Ready for automation';
      connectBtn.textContent = 'Disconnect';
      connectBtn.disabled = false;
      
      sessionInfo.style.display = 'block';
      sessionIdSpan.textContent = this.sessionId;
      connectionStatus.textContent = 'Active';
      
    } else if (this.isConnected && this.sessionId && !this.port) {
      statusIndicator.className = 'status-indicator saved';
      statusText.textContent = 'Session saved - Click to reconnect';
      connectBtn.textContent = 'Reconnect';
      connectBtn.disabled = false;
      
      sessionInfo.style.display = 'block';
      sessionIdSpan.textContent = this.sessionId;
      connectionStatus.textContent = 'Saved (ready to reconnect)';
      
    } else if (this.port && !this.sessionId) {
      statusIndicator.className = 'status-indicator disconnected';
      statusText.textContent = 'Connecting...';
      connectBtn.textContent = 'Connecting...';
      connectBtn.disabled = true;
      
      sessionInfo.style.display = 'none';
      
    } else {
      statusIndicator.className = 'status-indicator disconnected';
      statusText.textContent = 'Ready to connect';
      connectBtn.textContent = 'Connect to Web App';
      connectBtn.disabled = false;
      
      sessionInfo.style.display = 'none';
    }
  }
  
  copySessionId() {
    if (this.sessionId) {
      navigator.clipboard.writeText(this.sessionId).then(() => {
        this.showSuccess('Session ID copied to clipboard!');
      }).catch((error) => {
        console.error('Failed to copy to clipboard:', error);
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = this.sessionId;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        this.showSuccess('Session ID copied to clipboard!');
      });
    }
  }

  async copyToClipboard(text) {
    try {
      await navigator.clipboard.writeText(text);
      this.showSuccess(`Session ID copied to clipboard!`);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  }
  
  sendOfferToExtension() {
    try {
      const offerInput = document.getElementById('offerInput');
      if (!offerInput || !this.port) throw new Error('Not connected or missing offer');
      const raw = offerInput.value.trim();
      const offer = JSON.parse(raw);
      this.port.postMessage({ type: 'WEBRTC_OFFER', offer });
      this.showInfo('Offer sent to extension');
    } catch (e) {
      this.showError('Invalid Offer JSON');
    }
  }

  copyAnswer() {
    const answerOutput = document.getElementById('answerOutput');
    if (answerOutput && answerOutput.value) {
      navigator.clipboard.writeText(answerOutput.value).then(() => {
        this.showSuccess('Answer copied! Paste into the web app.');
      });
    }
  }
  
  showSuccess(message) {
    this.showNotification(message, 'success');
  }
  
  showError(message) {
    this.showNotification(message, 'error');
  }
  
  showInfo(message) {
    this.showNotification(message, 'info');
  }
  
  showNotification(message, type) {
    const messageContainer = document.getElementById('messageContainer');
    const messageDiv = document.createElement('div');
    messageDiv.className = type === 'error' ? 'error-message' : 'success-message';
    messageDiv.textContent = message;
    
    messageContainer.appendChild(messageDiv);
    
    setTimeout(() => {
      if (messageContainer.contains(messageDiv)) {
        messageContainer.removeChild(messageDiv);
      }
    }, 3000);
  }
}

// Initialize popup when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new PortifyPopup();
});