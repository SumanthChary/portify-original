// Background service worker for Portify automation
let connections = new Map();
let automationSessions = new Map();

// Handle WebRTC signaling between web app and extension
chrome.runtime.onConnect.addListener((port) => {
  if (port.name === 'portify-automation') {
    const sessionId = generateSessionId();
    connections.set(sessionId, port);
    
    port.postMessage({ type: 'SESSION_CREATED', sessionId });
    
    port.onMessage.addListener(async (message) => {
      try {
        switch (message.type) {
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
      connections.delete(sessionId);
      automationSessions.delete(sessionId);
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