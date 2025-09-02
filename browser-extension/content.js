// Content script for real-time browser automation
class PortifyAutomation {
  constructor() {
    this.peerConnection = null;
    this.dataChannel = null;
    this.sessionId = null;
    this.isConnected = false;
    this.automationQueue = [];
    
    this.init();
  }
  
  init() {
    // Listen for messages from background script
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      this.handleMessage(message);
      return true;
    });
    
    // Listen for automation commands
    window.addEventListener('message', (event) => {
      if (event.data.type === 'PORTIFY_AUTOMATION_COMMAND') {
        this.executeCommand(event.data.command);
      }
    });
    
    // Inject our automation script
    this.injectAutomationScript();
  }
  
  injectAutomationScript() {
    const script = document.createElement('script');
    script.src = chrome.runtime.getURL('injected.js');
    (document.head || document.documentElement).appendChild(script);
  }
  
  async handleMessage(message) {
    switch (message.type) {
      case 'WEBRTC_OFFER':
        await this.handleWebRTCOffer(message.offer, message.sessionId);
        break;
      case 'ICE_CANDIDATE':
        await this.handleICECandidate(message.candidate);
        break;
    }
  }
  
  async setupWebRTC() {
    this.peerConnection = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' }
      ]
    });
    
    // Setup data channel for commands
    this.dataChannel = this.peerConnection.createDataChannel('automation', {
      ordered: true
    });
    
    this.dataChannel.onopen = () => {
      this.isConnected = true;
      this.sendStatus('connected');
      this.processQueue();
    };
    
    this.dataChannel.onmessage = (event) => {
      const command = JSON.parse(event.data);
      this.executeCommand(command);
    };
    
    // Handle ICE candidates
    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        chrome.runtime.sendMessage({
          type: 'ICE_CANDIDATE',
          candidate: event.candidate
        });
      }
    };
    
    // Setup screen sharing
    await this.setupScreenShare();
  }
  
  async setupScreenShare() {
    try {
      // For extension, we'll use chrome.tabCapture instead of getDisplayMedia
      // This will be handled by the background script
      console.log('Screen share setup - using chrome.tabCapture via background script');
      
      // Request screen capture from background script
      chrome.runtime.sendMessage({
        type: 'START_SCREEN_CAPTURE',
        tabId: await this.getCurrentTabId()
      });
      
    } catch (error) {
      console.error('Screen share setup failed:', error);
    }
  }
  
  async getCurrentTabId() {
    return new Promise((resolve) => {
      chrome.runtime.sendMessage({ type: 'GET_CURRENT_TAB' }, (response) => {
        resolve(response?.tabId || null);
      });
    });
  }
  
  async handleWebRTCOffer(offer, sessionId) {
    this.sessionId = sessionId;
    await this.setupWebRTC();
    
    await this.peerConnection.setRemoteDescription(offer);
    const answer = await this.peerConnection.createAnswer();
    await this.peerConnection.setLocalDescription(answer);
    
    // Send answer back to background script
    chrome.runtime.sendMessage({
      type: 'WEBRTC_ANSWER',
      answer: answer,
      sessionId: sessionId
    });
  }
  
  async handleICECandidate(candidate) {
    if (this.peerConnection) {
      await this.peerConnection.addIceCandidate(candidate);
    }
  }
  
  executeCommand(command) {
    if (!this.isConnected) {
      this.automationQueue.push(command);
      return;
    }
    
    this.sendStatus('executing', command.type);
    
    switch (command.type) {
      case 'NAVIGATE':
        this.navigate(command.url);
        break;
      case 'FILL_FORM':
        this.fillForm(command.formData);
        break;
      case 'CLICK':
        this.clickElement(command.selector);
        break;
      case 'WAIT':
        this.wait(command.duration);
        break;
      case 'SCREENSHOT':
        this.takeScreenshot();
        break;
      case 'LOGIN':
        this.performLogin(command.credentials, command.platform);
        break;
      case 'CREATE_PRODUCT':
        this.createProduct(command.productData, command.platform);
        break;
    }
  }
  
  async navigate(url) {
    window.location.href = url;
    this.sendStatus('navigated', url);
  }
  
  async fillForm(formData) {
    for (const [selector, value] of Object.entries(formData)) {
      const element = document.querySelector(selector);
      if (element) {
        element.value = value;
        element.dispatchEvent(new Event('input', { bubbles: true }));
        element.dispatchEvent(new Event('change', { bubbles: true }));
      }
    }
    this.sendStatus('form_filled');
  }
  
  async clickElement(selector) {
    const element = document.querySelector(selector);
    if (element) {
      element.click();
      this.sendStatus('clicked', selector);
    } else {
      this.sendStatus('error', `Element not found: ${selector}`);
    }
  }
  
  async wait(duration) {
    await new Promise(resolve => setTimeout(resolve, duration));
    this.sendStatus('waited', duration);
  }
  
  async takeScreenshot() {
    // This will be handled by the screen sharing stream
    this.sendStatus('screenshot_taken');
  }
  
  async performLogin(credentials, platform) {
    const platformConfigs = {
      payhip: {
        loginUrl: 'https://payhip.com/login',
        emailSelector: '#email',
        passwordSelector: '#password',
        submitSelector: 'button[type="submit"]'
      },
      gumroad: {
        loginUrl: 'https://gumroad.com/login',
        emailSelector: 'input[name="email"]',
        passwordSelector: 'input[name="password"]',
        submitSelector: 'button[type="submit"]'
      }
    };
    
    const config = platformConfigs[platform];
    if (!config) {
      this.sendStatus('error', `Platform ${platform} not supported`);
      return;
    }
    
    if (window.location.href !== config.loginUrl) {
      await this.navigate(config.loginUrl);
      // Wait for page load
      await this.wait(2000);
    }
    
    await this.fillForm({
      [config.emailSelector]: credentials.email,
      [config.passwordSelector]: credentials.password
    });
    
    await this.wait(1000);
    await this.clickElement(config.submitSelector);
    
    this.sendStatus('login_attempted', platform);
  }
  
  async createProduct(productData, platform) {
    const platformConfigs = {
      payhip: {
        createUrl: 'https://payhip.com/product/add/digital',
        titleSelector: 'input[name="product_name"]',
        descriptionSelector: 'textarea[name="product_description"]',
        priceSelector: 'input[name="product_price"]',
        submitSelector: 'button[type="submit"]'
      }
    };
    
    const config = platformConfigs[platform];
    if (!config) {
      this.sendStatus('error', `Platform ${platform} not supported for product creation`);
      return;
    }
    
    if (!window.location.href.includes('product/add')) {
      await this.navigate(config.createUrl);
      await this.wait(3000);
    }
    
    await this.fillForm({
      [config.titleSelector]: productData.title,
      [config.descriptionSelector]: productData.description,
      [config.priceSelector]: productData.price.toString()
    });
    
    this.sendStatus('product_form_filled', productData.title);
  }
  
  sendStatus(status, data = null) {
    if (this.dataChannel && this.dataChannel.readyState === 'open') {
      this.dataChannel.send(JSON.stringify({
        type: 'STATUS_UPDATE',
        status,
        data,
        timestamp: Date.now(),
        url: window.location.href
      }));
    }
  }
  
  processQueue() {
    while (this.automationQueue.length > 0) {
      const command = this.automationQueue.shift();
      this.executeCommand(command);
    }
  }
}

// Initialize automation when page loads
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new PortifyAutomation();
  });
} else {
  new PortifyAutomation();
}