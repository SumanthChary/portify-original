// Popup script for Portify extension
class PortifyPopup {
  constructor() {
    this.port = null;
    this.sessionId = null;
    this.isConnected = false;
    
    this.init();
  }
  
  init() {
    this.setupEventListeners();
    this.updateUI();
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
    
    // Update UI every second
    setInterval(() => {
      this.updateUI();
    }, 1000);
  }
  
  async toggleConnection() {
    if (this.isConnected) {
      this.disconnect();
    } else {
      await this.connect();
    }
  }
  
  async connect() {
    try {
      // Connect to background script
      this.port = chrome.runtime.connect({ name: 'portify-automation' });
      
      this.port.onMessage.addListener((message) => {
        this.handleMessage(message);
      });
      
      this.port.onDisconnect.addListener(() => {
        this.handleDisconnect();
      });
      
      document.getElementById('connectBtn').textContent = 'Connecting...';
      document.getElementById('connectBtn').disabled = true;
      
    } catch (error) {
      console.error('Connection failed:', error);
      this.showError('Failed to connect: ' + error.message);
    }
  }
  
  disconnect() {
    if (this.port) {
      this.port.disconnect();
    }
    this.handleDisconnect();
  }
  
  handleMessage(message) {
    switch (message.type) {
      case 'SESSION_CREATED':
        this.sessionId = message.sessionId;
        this.isConnected = true;
        this.updateUI();
        this.copyToClipboard(this.sessionId);
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
    this.sessionId = null;
    this.isConnected = false;
    this.updateUI();
  }
  
  updateUI() {
    const statusIndicator = document.getElementById('statusIndicator');
    const statusText = document.getElementById('statusText');
    const connectBtn = document.getElementById('connectBtn');
    const sessionInfo = document.getElementById('sessionInfo');
    const sessionIdSpan = document.getElementById('sessionId');
    const connectionStatus = document.getElementById('connectionStatus');
    
    if (this.isConnected && this.sessionId) {
      statusIndicator.className = 'status-indicator connected';
      statusText.textContent = 'Connected - Ready for automation';
      connectBtn.textContent = 'Disconnect';
      connectBtn.disabled = false;
      
      sessionInfo.style.display = 'block';
      sessionIdSpan.textContent = this.sessionId;
      connectionStatus.textContent = 'Active';
      
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