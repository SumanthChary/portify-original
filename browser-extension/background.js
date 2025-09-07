// Background service worker for Portify automation
let connections = new Map();
let automationSessions = new Map();
let persistentSessions = new Map(); // Store session data persistently

// Handle WebRTC signaling between web app and extension
chrome.runtime.onConnect.addListener((port) => {
  if (port.name === 'portify-automation') {
    let sessionId = null;
    
    port.onMessage.addListener(async (message) => {
      try {
        switch (message.type) {
          case 'INIT':
            if (message.reconnect && message.sessionId) {
              sessionId = message.sessionId;
              connections.set(sessionId, port);
              // Restore persistent session data if it exists
              if (persistentSessions.has(sessionId)) {
                const sessionData = persistentSessions.get(sessionId);
                port.postMessage({ type: 'SESSION_RECONNECTED', sessionId, data: sessionData });
              } else {
                port.postMessage({ type: 'SESSION_RECONNECTED', sessionId });
              }
            } else {
              sessionId = generateSessionId();
              connections.set(sessionId, port);
              // Create persistent session entry
              persistentSessions.set(sessionId, { created: Date.now(), active: true });
              port.postMessage({ type: 'SESSION_CREATED', sessionId });
            }
            break;
          case 'RECONNECT_SESSION':
            // Backwards compatibility
            sessionId = message.sessionId;
            connections.set(sessionId, port);
            port.postMessage({ type: 'SESSION_RECONNECTED', sessionId });
            break;
          case 'START_SCREEN_CAPTURE':
            await startScreenCapture(sessionId, message.tabId);
            break;
          case 'AUTOMATION_COMMAND':
            await executeAutomationCommand(sessionId, message.command);
            break;
          case 'WEBRTC_OFFER':
            await handleWebRTCOffer(sessionId, message.offer);
            break;
          case 'WEBRTC_ANSWER':
            await handleWebRTCAnswer(sessionId, message.answer);
            break;
          case 'ICE_CANDIDATE':
            await handleICECandidate(sessionId, message.candidate);
            break;
        }
      } catch (error) {
        port.postMessage({ type: 'ERROR', error: error.message });
      }
    });
    
    port.onDisconnect.addListener(() => {
      if (sessionId) {
        connections.delete(sessionId);
        // Keep persistent session data for reconnection
        if (persistentSessions.has(sessionId)) {
          const sessionData = persistentSessions.get(sessionId);
          sessionData.lastDisconnect = Date.now();
          persistentSessions.set(sessionId, sessionData);
        }
      }
    });
  }
});

async function startScreenCapture(sessionId, tabId) {
  try {
    // Use the newer chrome.tabCapture.capture API properly
    const stream = await chrome.tabCapture.capture({
      audio: false,
      video: true
    });
    
    const port = connections.get(sessionId);
    if (port) {
      port.postMessage({ 
        type: 'SCREEN_CAPTURE_STARTED', 
        streamId: stream ? stream.id : null 
      });
    }
  } catch (error) {
    console.error('Screen capture failed:', error);
    const port = connections.get(sessionId);
    if (port) {
      port.postMessage({ type: 'ERROR', error: 'Screen capture failed: ' + error.message });
    }
  }
}

async function executeAutomationCommand(sessionId, command) {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
  await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: runAutomationCommand,
    args: [command]
  });
}

function runAutomationCommand(command) {
  // This function runs in the page context
  window.postMessage({ 
    type: 'PORTIFY_AUTOMATION_COMMAND', 
    command 
  }, '*');
}

async function handleWebRTCOffer(sessionId, offer) {
  // Forward WebRTC signaling to content script
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  await chrome.tabs.sendMessage(tab.id, {
    type: 'WEBRTC_OFFER',
    offer,
    sessionId
  });
}

async function handleWebRTCAnswer(sessionId, answer) {
  const port = connections.get(sessionId);
  if (port) {
    port.postMessage({ type: 'WEBRTC_ANSWER', answer });
  }
}

async function handleICECandidate(sessionId, candidate) {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  await chrome.tabs.sendMessage(tab.id, {
    type: 'ICE_CANDIDATE',
    candidate,
    sessionId
  });
}

function generateSessionId() {
  return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// Add method to clear persistent session (called when user explicitly disconnects)
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'CLEAR_PERSISTENT_SESSION' && message.sessionId) {
    persistentSessions.delete(message.sessionId);
    automationSessions.delete(message.sessionId);
    connections.delete(message.sessionId);
    sendResponse({ cleared: true });
  }
});