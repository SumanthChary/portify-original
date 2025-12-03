import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface ConnectionState {
  status: 'disconnected' | 'waiting' | 'connecting' | 'connected';
  sessionId: string | null;
  error: string | null;
}

interface AutomationMessage {
  type: string;
  status?: string;
  command?: string;
  message?: string;
  timestamp?: number;
  [key: string]: any;
}

export function useExtensionConnection() {
  const [connectionState, setConnectionState] = useState<ConnectionState>({
    status: 'disconnected',
    sessionId: null,
    error: null
  });
  const [messages, setMessages] = useState<AutomationMessage[]>([]);
  
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const dataChannelRef = useRef<RTCDataChannel | null>(null);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup function
  const cleanup = useCallback(() => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
    if (dataChannelRef.current) {
      dataChannelRef.current.close();
      dataChannelRef.current = null;
    }
    if (pcRef.current) {
      pcRef.current.close();
      pcRef.current = null;
    }
  }, []);

  // Connect to extension session
  const connect = useCallback(async (sessionId: string) => {
    try {
      cleanup();
      
      console.log('[WebApp] Connecting to session:', sessionId);
      setConnectionState({ status: 'connecting', sessionId, error: null });

      // Create peer connection
      const pc = new RTCPeerConnection({
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' }
        ]
      });
      pcRef.current = pc;

      // Create data channel
      const dataChannel = pc.createDataChannel('automation', {
        ordered: true
      });
      dataChannelRef.current = dataChannel;

      dataChannel.onopen = () => {
        console.log('[WebApp] Data channel open');
        setConnectionState(prev => ({ ...prev, status: 'connected' }));
        addMessage({ type: 'SYSTEM', message: 'Connected to extension!' });
      };

      dataChannel.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          console.log('[WebApp] Message from extension:', message);
          addMessage(message);
        } catch (error) {
          console.error('[WebApp] Error parsing message:', error);
        }
      };

      dataChannel.onclose = () => {
        console.log('[WebApp] Data channel closed');
        setConnectionState(prev => ({ ...prev, status: 'disconnected' }));
      };

      pc.onconnectionstatechange = () => {
        console.log('[WebApp] Connection state:', pc.connectionState);
        if (pc.connectionState === 'connected') {
          setConnectionState(prev => ({ ...prev, status: 'connected' }));
        } else if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
          setConnectionState(prev => ({ ...prev, status: 'disconnected' }));
        }
      };

      // Create offer
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      // Wait for ICE gathering
      await new Promise<void>((resolve) => {
        if (pc.iceGatheringState === 'complete') {
          resolve();
        } else {
          pc.onicegatheringstatechange = () => {
            if (pc.iceGatheringState === 'complete') {
              resolve();
            }
          };
          setTimeout(resolve, 5000);
        }
      });

      // Save offer to Supabase
      const offerData = JSON.stringify(pc.localDescription);
      console.log('[WebApp] Saving offer to Supabase...');
      
      const { error: updateError } = await supabase
        .from('extension_sessions')
        .update({ 
          webrtc_offer: offerData,
          status: 'offer_sent',
          updated_at: new Date().toISOString()
        })
        .eq('session_id', sessionId);

      if (updateError) {
        throw new Error(`Failed to save offer: ${updateError.message}`);
      }

      console.log('[WebApp] Offer saved, waiting for answer...');
      setConnectionState(prev => ({ ...prev, status: 'waiting' }));

      // Start polling for answer
      pollingRef.current = setInterval(async () => {
        try {
          const { data, error } = await supabase
            .from('extension_sessions')
            .select('webrtc_answer, status')
            .eq('session_id', sessionId)
            .single();

          if (error) {
            console.error('[WebApp] Poll error:', error);
            return;
          }

          if (data?.webrtc_answer && pc.signalingState !== 'stable') {
            console.log('[WebApp] Answer received!');
            
            if (pollingRef.current) {
              clearInterval(pollingRef.current);
              pollingRef.current = null;
            }

            const answer = JSON.parse(data.webrtc_answer);
            await pc.setRemoteDescription(new RTCSessionDescription(answer));
            
            console.log('[WebApp] Remote description set');
          }
        } catch (error) {
          console.error('[WebApp] Polling error:', error);
        }
      }, 1000);

    } catch (error) {
      console.error('[WebApp] Connection error:', error);
      setConnectionState(prev => ({ 
        ...prev, 
        status: 'disconnected', 
        error: error instanceof Error ? error.message : 'Connection failed' 
      }));
      cleanup();
    }
  }, [cleanup]);

  // Disconnect
  const disconnect = useCallback(() => {
    cleanup();
    setConnectionState({ status: 'disconnected', sessionId: null, error: null });
    setMessages([]);
  }, [cleanup]);

  // Send command to extension
  const sendCommand = useCallback((command: any) => {
    if (dataChannelRef.current?.readyState === 'open') {
      console.log('[WebApp] Sending command:', command);
      dataChannelRef.current.send(JSON.stringify(command));
      addMessage({ type: 'COMMAND_SENT', ...command });
      return true;
    }
    console.warn('[WebApp] Data channel not open');
    return false;
  }, []);

  // Add message to log
  const addMessage = useCallback((message: AutomationMessage) => {
    setMessages(prev => [...prev.slice(-50), { ...message, timestamp: Date.now() }]);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  return {
    connectionState,
    messages,
    connect,
    disconnect,
    sendCommand,
    isConnected: connectionState.status === 'connected'
  };
}
