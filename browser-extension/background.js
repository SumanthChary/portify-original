// Background service worker for Portify automation with persistent storage
const SUPABASE_URL = 'https://yvvqfcwhskthbbjspcvi.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl2dnFmY3doc2t0aGJianNwY3ZpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ2OTgwNzAsImV4cCI6MjA2MDI3NDA3MH0.T-DAvL0-4pEWF0QSaM3nQcgJhou8gUQHeKK-vMV7KIk';

// Persistent session management
async function getSession() {
  const result = await chrome.storage.local.get(['portifySession']);
  return result.portifySession || null;
}

async function saveSession(session) {
  await chrome.storage.local.set({ portifySession: session });
  console.log('[Background] Session saved:', session.sessionId);
}

async function clearSession() {
  await chrome.storage.local.remove(['portifySession']);
  console.log('[Background] Session cleared');
}

// Generate unique session ID
function generateSessionId() {
  return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// Create session in Supabase
async function createSupabaseSession(sessionId) {
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/extension_sessions`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({
        session_id: sessionId,
        status: 'waiting',
        webrtc_offer: null,
        webrtc_answer: null,
        ice_candidates: []
      })
    });
    
    if (!response.ok) {
      throw new Error(`Failed to create session: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('[Background] Supabase session created:', data);
    return data[0];
  } catch (error) {
    console.error('[Background] Error creating Supabase session:', error);
    throw error;
  }
}

// Update session in Supabase
async function updateSupabaseSession(sessionId, updates) {
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/extension_sessions?session_id=eq.${sessionId}`, {
      method: 'PATCH',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({
        ...updates,
        updated_at: new Date().toISOString()
      })
    });
    
    if (!response.ok) {
      throw new Error(`Failed to update session: ${response.status}`);
    }
    
    console.log('[Background] Supabase session updated');
    return true;
  } catch (error) {
    console.error('[Background] Error updating Supabase session:', error);
    throw error;
  }
}

// Poll for WebRTC offer from web app
async function pollForOffer(sessionId) {
  console.log('[Background] Starting to poll for offer...');
  
  const maxAttempts = 120; // 2 minutes
  let attempts = 0;
  
  while (attempts < maxAttempts) {
    try {
      const response = await fetch(
        `${SUPABASE_URL}/rest/v1/extension_sessions?session_id=eq.${sessionId}&select=webrtc_offer,status`,
        {
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
          }
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        if (data[0]?.webrtc_offer) {
          console.log('[Background] Offer received from web app!');
          return data[0].webrtc_offer;
        }
      }
    } catch (error) {
      console.error('[Background] Poll error:', error);
    }
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    attempts++;
  }
  
  throw new Error('Timeout waiting for offer');
}

// Handle messages from popup and content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('[Background] Message received:', message.type);
  
  (async () => {
    try {
      switch (message.type) {
        case 'GET_SESSION':
          const session = await getSession();
          sendResponse({ session });
          break;
          
        case 'CREATE_SESSION':
          const sessionId = generateSessionId();
          await createSupabaseSession(sessionId);
          const newSession = {
            sessionId,
            status: 'waiting',
            createdAt: Date.now()
          };
          await saveSession(newSession);
          sendResponse({ session: newSession });
          break;
          
        case 'START_POLLING':
          // Start polling for offer in background
          pollForOffer(message.sessionId).then(async (offer) => {
            // Notify content script about the offer
            const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
            if (tabs[0]) {
              chrome.tabs.sendMessage(tabs[0].id, {
                type: 'OFFER_RECEIVED',
                offer: offer,
                sessionId: message.sessionId
              });
            }
          }).catch(error => {
            console.error('[Background] Polling failed:', error);
          });
          sendResponse({ started: true });
          break;
          
        case 'SAVE_ANSWER':
          await updateSupabaseSession(message.sessionId, {
            webrtc_answer: message.answer,
            status: 'connected'
          });
          const currentSession = await getSession();
          if (currentSession) {
            currentSession.status = 'connected';
            await saveSession(currentSession);
          }
          sendResponse({ success: true });
          break;
          
        case 'UPDATE_STATUS':
          await updateSupabaseSession(message.sessionId, {
            status: message.status
          });
          sendResponse({ success: true });
          break;
          
        case 'CLEAR_SESSION':
          await clearSession();
          sendResponse({ success: true });
          break;
          
        case 'EXECUTE_AUTOMATION':
          // Forward automation command to content script
          const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
          if (tabs[0]) {
            chrome.tabs.sendMessage(tabs[0].id, {
              type: 'EXECUTE_AUTOMATION',
              command: message.command
            });
          }
          sendResponse({ success: true });
          break;
          
        default:
          sendResponse({ error: 'Unknown message type' });
      }
    } catch (error) {
      console.error('[Background] Error handling message:', error);
      sendResponse({ error: error.message });
    }
  })();
  
  return true; // Keep channel open for async response
});

// Initialize on install
chrome.runtime.onInstalled.addListener(() => {
  console.log('[Background] Portify extension installed');
});

console.log('[Background] Service worker started');
