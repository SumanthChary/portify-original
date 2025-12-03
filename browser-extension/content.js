// Content script for Portify automation - handles WebRTC and automation commands
console.log('[Portify Content] Script loaded on:', window.location.href);

const SUPABASE_URL = 'https://yvvqfcwhskthbbjspcvi.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl2dnFmY3doc2t0aGJianNwY3ZpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ2OTgwNzAsImV4cCI6MjA2MDI3NDA3MH0.T-DAvL0-4pEWF0QSaM3nQcgJhou8gUQHeKK-vMV7KIk';

class PortifyAutomation {
  constructor() {
    this.pc = null;
    this.dataChannel = null;
    this.sessionId = null;
    this.isConnected = false;
    this.pollingInterval = null;
    this.setupMessageListeners();
    this.checkForExistingSession();
  }
  
  setupMessageListeners() {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message.type === 'OFFER_RECEIVED') this.handleOffer(message.offer, message.sessionId);
      if (message.type === 'EXECUTE_AUTOMATION') this.executeCommand(message.command);
      if (message.type === 'CHECK_STATUS') sendResponse({ connected: this.isConnected, sessionId: this.sessionId });
      return true;
    });
  }
  
  async checkForExistingSession() {
    try {
      const response = await chrome.runtime.sendMessage({ type: 'GET_SESSION' });
      if (response?.session?.sessionId) {
        this.sessionId = response.session.sessionId;
        this.startPolling();
      }
    } catch (e) {}
  }
  
  startPolling() {
    if (this.pollingInterval) return;
    this.pollingInterval = setInterval(() => this.pollForOffer(), 2000);
  }
  
  stopPolling() {
    if (this.pollingInterval) { clearInterval(this.pollingInterval); this.pollingInterval = null; }
  }
  
  async pollForOffer() {
    if (!this.sessionId || this.isConnected) return;
    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/extension_sessions?session_id=eq.${this.sessionId}&select=webrtc_offer,status`, {
        headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${SUPABASE_ANON_KEY}` }
      });
      if (response.ok) {
        const data = await response.json();
        if (data[0]?.webrtc_offer && data[0]?.status !== 'connected') {
          this.stopPolling();
          await this.handleOffer(data[0].webrtc_offer, this.sessionId);
        }
      }
    } catch (e) { console.error('[Content] Poll error:', e); }
  }
  
  async handleOffer(offerStr, sessionId) {
    try {
      this.sessionId = sessionId;
      const offer = typeof offerStr === 'string' ? JSON.parse(offerStr) : offerStr;
      this.pc = new RTCPeerConnection({ iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] });
      this.pc.ondatachannel = (e) => { this.dataChannel = e.channel; this.setupDataChannel(); };
      this.pc.onconnectionstatechange = () => {
        if (this.pc.connectionState === 'connected') { this.isConnected = true; this.sendStatus('CONNECTED', { message: 'WebRTC connected!' }); }
        else if (this.pc.connectionState === 'disconnected' || this.pc.connectionState === 'failed') this.isConnected = false;
      };
      await this.pc.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await this.pc.createAnswer();
      await this.pc.setLocalDescription(answer);
      await new Promise(r => { if (this.pc.iceGatheringState === 'complete') r(); else { this.pc.onicegatheringstatechange = () => { if (this.pc.iceGatheringState === 'complete') r(); }; setTimeout(r, 5000); } });
      await this.saveAnswer(JSON.stringify(this.pc.localDescription));
    } catch (e) { console.error('[Content] Offer error:', e); }
  }
  
  async saveAnswer(answer) {
    await fetch(`${SUPABASE_URL}/rest/v1/extension_sessions?session_id=eq.${this.sessionId}`, {
      method: 'PATCH', headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${SUPABASE_ANON_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ webrtc_answer: answer, status: 'answered', updated_at: new Date().toISOString() })
    });
  }
  
  setupDataChannel() {
    this.dataChannel.onopen = () => this.sendStatus('READY', { message: 'Extension ready!' });
    this.dataChannel.onmessage = (e) => { try { this.executeCommand(JSON.parse(e.data)); } catch (err) {} };
    this.dataChannel.onclose = () => { this.isConnected = false; };
  }
  
  sendStatus(status, data = {}) {
    if (this.dataChannel?.readyState === 'open') this.dataChannel.send(JSON.stringify({ type: 'STATUS', status, ...data, timestamp: Date.now() }));
  }
  
  async executeCommand(cmd) {
    this.sendStatus('EXECUTING', { command: cmd.type });
    try {
      const type = cmd.type?.toUpperCase();
      if (type === 'NAVIGATE') window.location.href = cmd.url || cmd.data?.url;
      else if (type === 'CREATE_PAYHIP_PRODUCT' || type === 'CREATEPRODUCT') await this.createProduct(cmd.product || cmd.data);
      else if (type === 'CLICK') document.querySelector(cmd.selector || cmd.data?.selector)?.click();
      else if (type === 'TYPE') { const el = document.querySelector(cmd.selector || cmd.data?.selector); if (el) { el.value = cmd.text || cmd.data?.text; el.dispatchEvent(new Event('input', { bubbles: true })); } }
      else if (type === 'SUBMIT_PRODUCT') await this.submitProduct();
      this.sendStatus('COMPLETED', { command: cmd.type });
    } catch (e) { this.sendStatus('ERROR', { command: cmd.type, error: e.message }); }
  }
  
  async createProduct(product) {
    if (!window.location.href.includes('payhip.com/product/add')) { window.location.href = 'https://payhip.com/product/add/digital'; return; }
    await this.waitForElement('input[name="product_name"], #product_name');
    const title = product?.title || product?.name || '';
    for (const sel of ['#product_name', 'input[name="product_name"]']) { const el = document.querySelector(sel); if (el) { el.value = title; el.dispatchEvent(new Event('input', { bubbles: true })); break; } }
    for (const sel of ['#product_description', 'textarea[name="product_description"]', '.ql-editor']) { const el = document.querySelector(sel); if (el) { if (el.contentEditable === 'true' || el.classList.contains('ql-editor')) el.innerHTML = product?.description || ''; else el.value = product?.description || ''; el.dispatchEvent(new Event('input', { bubbles: true })); break; } }
    for (const sel of ['#product_price', 'input[name="product_price"]']) { const el = document.querySelector(sel); if (el) { el.value = product?.price || '0'; el.dispatchEvent(new Event('input', { bubbles: true })); break; } }
    this.sendStatus('PRODUCT_FORM_FILLED', { product: title });
  }
  
  async submitProduct() {
    const btns = document.querySelectorAll('button');
    for (const btn of btns) { if (/save|create|publish/i.test(btn.textContent)) { btn.click(); this.sendStatus('PRODUCT_SUBMITTED'); return; } }
  }
  
  async waitForElement(selector, timeout = 10000) {
    const start = Date.now();
    while (Date.now() - start < timeout) { const el = document.querySelector(selector); if (el) return el; await new Promise(r => setTimeout(r, 100)); }
    throw new Error(`Timeout: ${selector}`);
  }
}

new PortifyAutomation();
