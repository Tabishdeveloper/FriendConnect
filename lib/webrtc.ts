import { db } from './firebase';
import { 
  collection, 
  doc, 
  setDoc, 
  onSnapshot, 
  updateDoc, 
  deleteDoc, 
  getDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';

// Configuration for WebRTC
const configuration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
  ],
};

// Check if WebRTC is supported
const isWebRTCSupported = () => {
  return typeof window !== 'undefined' && 
         !!window.RTCPeerConnection && 
         !!navigator.mediaDevices && 
         !!navigator.mediaDevices.getUserMedia;
};

// Types
export interface CallEventPayload {
  type: 'offer' | 'answer' | 'ice-candidate';
  data: any;
  callId: string;
  fromUserId: string;
  toUserId: string;
}

export interface CallEvent {
  onIncomingCall: (fromUserId: string, callId: string) => void;
  onCallAccepted: (callId: string) => void;
  onCallEnded: (callId: string) => void;
  onLocalStream: (stream: MediaStream) => void;
  onRemoteStream: (stream: MediaStream) => void;
  onCallError: (error: Error) => void;
}

class WebRTCService {
  private peerConnection: RTCPeerConnection | null = null;
  private localStream: MediaStream | null = null;
  private remoteStream: MediaStream | null = null;
  private callDoc: any = null;
  private offerCandidates: any = null;
  private answerCandidates: any = null;
  private unsubscribeCallDoc: (() => void) | null = null;
  private userId: string | null = null;
  private remoteUserId: string | null = null;
  private currentCallId: string | null = null;
  private events: CallEvent;
  private mockLocalStream: any = null;
  private mockRemoteStream: any = null;
  private isMockSession: boolean = false;
  
  // Event callbacks
  private onLocalStreamCallback: ((stream: MediaStream) => void) | null = null;
  private onRemoteStreamCallback: ((stream: MediaStream) => void) | null = null;
  private onCallEndedCallback: (() => void) | null = null;
  private onCallErrorCallback: ((error: Error) => void) | null = null;
  
  constructor(events: CallEvent) {
    this.events = events;
    this.isMockSession = !isWebRTCSupported() || process.env.NODE_ENV !== 'production';
    
    // Create mock streams for development environment
    if (this.isMockSession) {
      this.createMockStreams();
    }
  }
  
  // Set event callbacks
  public setOnLocalStream(callback: (stream: MediaStream) => void) {
    this.onLocalStreamCallback = callback;
  }
  
  public setOnRemoteStream(callback: (stream: MediaStream) => void) {
    this.onRemoteStreamCallback = callback;
  }
  
  public setOnCallEnded(callback: () => void) {
    this.onCallEndedCallback = callback;
  }
  
  public setOnCallError(callback: (error: Error) => void) {
    this.onCallErrorCallback = callback;
  }
  
  // Create mock streams for development
  private createMockStreams() {
    console.log('Creating mock streams for development');
    
    // Simulate local stream after a brief delay
    setTimeout(() => {
      this.mockLocalStream = {
        id: 'mock-local-stream',
        getTracks: () => [
          { kind: 'video', enabled: true, stop: () => {} },
          { kind: 'audio', enabled: true, stop: () => {} }
        ],
        getVideoTracks: () => [{ kind: 'video', enabled: true, stop: () => {} }],
        getAudioTracks: () => [{ kind: 'audio', enabled: true, stop: () => {} }]
      };
      
      if (this.events.onLocalStream) {
        // Notify that we have a "mock" local stream
        this.events.onLocalStream(this.mockLocalStream as unknown as MediaStream);
      }
      
      // Simulate remote stream after a delay
      setTimeout(() => {
        this.mockRemoteStream = {
          id: 'mock-remote-stream',
          getTracks: () => [
            { kind: 'video', enabled: true, stop: () => {} },
            { kind: 'audio', enabled: true, stop: () => {} }
          ]
        };
        
        if (this.events.onRemoteStream) {
          // Notify that we have a "mock" remote stream
          this.events.onRemoteStream(this.mockRemoteStream as unknown as MediaStream);
        }
      }, 2000);
    }, 1000);
  }
  
  // Initialize WebRTC
  async initialize() {
    if (this.isMockSession) {
      console.log('Using mock WebRTC implementation in development environment');
      return;
    }
    
    try {
      // Configure ICE servers
      const configuration = {
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' },
        ]
      };
      
      this.peerConnection = new RTCPeerConnection(configuration);
      
      // Set up event listeners for ICE candidates
      this.peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
          this.handleIceCandidate(event.candidate);
        }
      };
      
      // Set up event listener for remote streams
      this.peerConnection.ontrack = (event) => {
        this.remoteStream = event.streams[0];
        if (this.events.onRemoteStream) {
          this.events.onRemoteStream(this.remoteStream);
        }
      };
    } catch (error) {
      console.error('Error initializing WebRTC:', error);
      if (this.events.onCallError) {
        this.events.onCallError(error instanceof Error ? error : new Error('Failed to initialize WebRTC'));
      }
    }
  }
  
  // Start a call
  async startCall(toUserId: string): Promise<string> {
    if (this.isMockSession) {
      console.log('Starting mock call to:', toUserId);
      const mockCallId = `mock-${uuidv4()}`;
      this.currentCallId = mockCallId;
      
      // Simulate call accepted after a delay
      setTimeout(() => {
        if (this.events.onCallAccepted) {
          this.events.onCallAccepted(mockCallId);
        }
      }, 1500);
      
      return mockCallId;
    }
    
    try {
      await this.initialize();
      
      // Get local media stream
      this.localStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      
      // Notify about local stream
      if (this.events.onLocalStream) {
        this.events.onLocalStream(this.localStream);
      }
      
      // Add tracks to the peer connection
      this.localStream.getTracks().forEach(track => {
        if (this.peerConnection && this.localStream) {
          this.peerConnection.addTrack(track, this.localStream);
        }
      });
      
      // Create an offer
      const offer = await this.peerConnection?.createOffer();
      await this.peerConnection?.setLocalDescription(offer);
      
      // Generate a unique call ID
      const callId = uuidv4();
      this.currentCallId = callId;
      
      // Send the offer via the signaling server
      this.sendSignalingData({
        type: 'offer',
        data: offer,
        callId,
        fromUserId: 'current-user-id', // This should come from auth context
        toUserId
      });
      
      return callId;
    } catch (error) {
      console.error('Error starting call:', error);
      if (this.events.onCallError) {
        this.events.onCallError(error instanceof Error ? error : new Error('Failed to start call'));
      }
      throw error;
    }
  }
  
  // Answer an incoming call
  async answerCall(fromUserId: string, callId: string, offerData: any) {
    if (this.isMockSession) {
      console.log('Answering mock call from:', fromUserId, 'with ID:', callId);
      this.currentCallId = callId;
      
      // Simulate having a remote stream after a delay
      setTimeout(() => {
        if (this.events.onCallAccepted) {
          this.events.onCallAccepted(callId);
        }
      }, 1000);
      
      return;
    }
    
    try {
      await this.initialize();
      this.currentCallId = callId;
      
      // Set the remote description from the offer
      const offerDesc = new RTCSessionDescription(offerData);
      await this.peerConnection?.setRemoteDescription(offerDesc);
      
      // Get local media stream
      this.localStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      
      // Notify about local stream
      if (this.events.onLocalStream) {
        this.events.onLocalStream(this.localStream);
      }
      
      // Add tracks to the peer connection
      this.localStream.getTracks().forEach(track => {
        if (this.peerConnection && this.localStream) {
          this.peerConnection.addTrack(track, this.localStream);
        }
      });
      
      // Create an answer
      const answer = await this.peerConnection?.createAnswer();
      await this.peerConnection?.setLocalDescription(answer);
      
      // Send the answer via the signaling server
      this.sendSignalingData({
        type: 'answer',
        data: answer,
        callId,
        fromUserId: 'current-user-id', // This should come from auth context
        toUserId: fromUserId
      });
      
      if (this.events.onCallAccepted) {
        this.events.onCallAccepted(callId);
      }
    } catch (error) {
      console.error('Error answering call:', error);
      if (this.events.onCallError) {
        this.events.onCallError(error instanceof Error ? error : new Error('Failed to answer call'));
      }
    }
  }
  
  // End the current call
  endCall() {
    if (this.isMockSession) {
      console.log('Ending mock call:', this.currentCallId);
      
      if (this.currentCallId && this.events.onCallEnded) {
        this.events.onCallEnded(this.currentCallId);
      }
      
      this.currentCallId = null;
      this.mockLocalStream = null;
      this.mockRemoteStream = null;
      return;
    }
    
    try {
      // Stop all tracks in the local stream
      if (this.localStream) {
        this.localStream.getTracks().forEach(track => track.stop());
        this.localStream = null;
      }
      
      // Close the peer connection
      if (this.peerConnection) {
        this.peerConnection.close();
        this.peerConnection = null;
      }
      
      // Reset remote stream
      this.remoteStream = null;
      
      // Notify call ended
      if (this.currentCallId && this.events.onCallEnded) {
        this.events.onCallEnded(this.currentCallId);
      }
      
      this.currentCallId = null;
    } catch (error) {
      console.error('Error ending call:', error);
    }
  }
  
  // Mute/unmute audio
  toggleAudio(mute: boolean) {
    if (this.isMockSession) {
      console.log('Toggling mock audio:', mute ? 'muted' : 'unmuted');
      return;
    }
    
    if (this.localStream) {
      this.localStream.getAudioTracks().forEach(track => {
        track.enabled = !mute;
      });
    }
  }
  
  // Enable/disable video
  toggleVideo(disable: boolean) {
    if (this.isMockSession) {
      console.log('Toggling mock video:', disable ? 'disabled' : 'enabled');
      return;
    }
    
    if (this.localStream) {
      this.localStream.getVideoTracks().forEach(track => {
        track.enabled = !disable;
      });
    }
  }
  
  // Handle an incoming WebRTC signaling message
  handleSignalingData(data: CallEventPayload) {
    if (this.isMockSession) {
      console.log('Handling mock signaling data:', data);
      
      if (data.type === 'offer') {
        // Notify about incoming call
        if (this.events.onIncomingCall) {
          this.events.onIncomingCall(data.fromUserId, data.callId);
        }
      }
      
      return;
    }
    
    try {
      if (data.type === 'offer') {
        // Notify about incoming call
        if (this.events.onIncomingCall) {
          this.events.onIncomingCall(data.fromUserId, data.callId);
        }
      } else if (data.type === 'answer' && this.peerConnection) {
        // Set remote description from answer
        const answerDesc = new RTCSessionDescription(data.data);
        this.peerConnection.setRemoteDescription(answerDesc).catch(error => {
          console.error('Error setting remote description:', error);
        });
      } else if (data.type === 'ice-candidate' && this.peerConnection) {
        // Add ICE candidate
        const candidate = new RTCIceCandidate(data.data);
        this.peerConnection.addIceCandidate(candidate).catch(error => {
          console.error('Error adding ICE candidate:', error);
        });
      }
    } catch (error) {
      console.error('Error handling signaling data:', error);
      if (this.events.onCallError) {
        this.events.onCallError(error instanceof Error ? error : new Error('Failed to process signaling data'));
      }
    }
  }
  
  // Handle ICE candidate event
  private handleIceCandidate(candidate: RTCIceCandidate) {
    if (!this.currentCallId) return;
    
    // Send the ICE candidate via the signaling server
    this.sendSignalingData({
      type: 'ice-candidate',
      data: candidate,
      callId: this.currentCallId,
      fromUserId: 'current-user-id', // This should come from auth context
      toUserId: 'other-user-id' // This should be the call recipient
    });
  }
  
  // Send signaling data to the other peer
  private sendSignalingData(data: CallEventPayload) {
    // In a real implementation, this would send the data to a signaling server
    // For now, we'll just log it
    console.log('Sending signaling data:', data);
    
    // Implement actual signaling here
    // This could use Firebase, WebSockets, or another solution
  }
}

export default new WebRTCService(); 