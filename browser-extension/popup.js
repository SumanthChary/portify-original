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
  
  async copyToClipboard(text) {
    try {
      await navigator.clipboard.writeText(text);
      this.showSuccess(`Session ID copied to clipboard: ${text}`);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
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
    const statusText = document.getElementById('statusText');
    const originalText = statusText.textContent;
    
    statusText.textContent = message;
    statusText.style.color = type === 'error' ? '#f87171' : 
                           type === 'success' ? '#4ade80' : '#ffffff';
    
    setTimeout(() => {
      statusText.textContent = originalText;
      statusText.style.color = '#ffffff';
    }, 3000);
  }
}

// Initialize popup when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new PortifyPopup();
});