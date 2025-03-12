import { v4 as uuidv4 } from 'uuid';
import { db } from './firebase';
import { 
  collection, 
  doc, 
  setDoc, 
  onSnapshot, 
  updateDoc, 
  getDoc, 
  serverTimestamp,
  Timestamp,
  query,
  orderBy,
  limit,
  addDoc
} from 'firebase/firestore';

// Check if Firebase is available
const isFirebaseAvailable = () => {
  return process.env.NODE_ENV === 'production' && 
         typeof window !== 'undefined' && 
         !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
};

// Types
export interface MediaSession {
  id: string;
  creatorId: string;
  participants: string[];
  mediaType: 'video' | 'audio';
  mediaUrl: string;
  title: string;
  currentTime: number;
  isPlaying: boolean;
  playbackRate: number;
  lastUpdated: Date | any;
}

export interface MediaAction {
  type: 'play' | 'pause' | 'seek' | 'skip' | 'rate-change' | 'load';
  sessionId: string;
  userId: string;
  data: any;
  timestamp: Date | any;
}

export interface MediaSyncCallbacks {
  onSessionUpdate: (session: MediaSession) => void;
  onParticipantAction: (action: MediaAction) => void;
  onParticipantJoined: (userId: string, sessionId: string) => void;
  onParticipantLeft: (userId: string, sessionId: string) => void;
  onError: (error: Error) => void;
}

class MediaSyncService {
  private currentSessionId: string | null = null;
  private userId: string | null = null;
  private callbacks: MediaSyncCallbacks | null = null;
  private sessionUnsubscribe: (() => void) | null = null;
  private actionsUnsubscribe: (() => void) | null = null;
  private mockMode: boolean = false;
  private mockSession: MediaSession | null = null;
  private mockActions: MediaAction[] = [];
  private mockActionInterval: NodeJS.Timeout | null = null;
  
  constructor() {
    this.mockMode = !isFirebaseAvailable();
    console.log(`MediaSync service initialized in ${this.mockMode ? 'mock' : 'production'} mode`);
  }
  
  // Set user ID
  setUserId(userId: string) {
    this.userId = userId;
  }
  
  // Set callbacks
  setCallbacks(callbacks: MediaSyncCallbacks) {
    this.callbacks = callbacks;
  }
  
  // Create a new media session
  async createSession(
    mediaType: 'video' | 'audio',
    mediaUrl: string,
    title: string
  ): Promise<string> {
    if (!this.userId) {
      throw new Error('User ID not set. Call setUserId() first.');
    }
    
    if (this.mockMode) {
      const sessionId = `mock-session-${uuidv4()}`;
      this.mockSession = {
        id: sessionId,
        creatorId: this.userId,
        participants: [this.userId],
        mediaType,
        mediaUrl,
        title,
        currentTime: 0,
        isPlaying: false,
        playbackRate: 1,
        lastUpdated: new Date()
      };
      
      this.currentSessionId = sessionId;
      
      // Notify about session update
      if (this.callbacks?.onSessionUpdate) {
        this.callbacks.onSessionUpdate(this.mockSession);
      }
      
      console.log('Created mock media session:', this.mockSession);
      
      // Simulate some actions in mock mode
      this.startMockActionSimulation();
      
      return sessionId;
    }
    
    try {
      // Implementation for Firebase would go here
      // For now, returning a mock session ID
      const sessionId = `firebase-not-implemented-${uuidv4()}`;
      return sessionId;
    } catch (error) {
      console.error('Error creating media session:', error);
      if (this.callbacks?.onError) {
        this.callbacks.onError(error instanceof Error ? error : new Error('Failed to create session'));
      }
      throw error;
    }
  }
  
  // Join an existing media session
  async joinSession(sessionId: string): Promise<void> {
    if (!this.userId) {
      throw new Error('User ID not set. Call setUserId() first.');
    }
    
    if (this.mockMode) {
      if (this.mockSession && this.mockSession.id === sessionId) {
        // Add user to existing mock session
        if (!this.mockSession.participants.includes(this.userId)) {
          this.mockSession.participants.push(this.userId);
        }
      } else {
        // Create a new mock session if the requested one doesn't exist
        this.mockSession = {
          id: sessionId,
          creatorId: 'friend-user-id', // Someone else created it
          participants: ['friend-user-id', this.userId],
          mediaType: 'video',
          mediaUrl: 'https://example.com/sample-video.mp4',
          title: 'Sample shared video',
          currentTime: 35, // Starting point
          isPlaying: false,
          playbackRate: 1,
          lastUpdated: new Date()
        };
      }
      
      this.currentSessionId = sessionId;
      
      // Notify about session update
      if (this.callbacks?.onSessionUpdate) {
        this.callbacks.onSessionUpdate(this.mockSession);
      }
      
      // Notify others about user joining
      if (this.callbacks?.onParticipantJoined) {
        setTimeout(() => {
          this.callbacks?.onParticipantJoined('friend-user-id', sessionId);
        }, 1000);
      }
      
      console.log('Joined mock media session:', this.mockSession);
      
      // Simulate some actions in mock mode
      this.startMockActionSimulation();
      
      return;
    }
    
    try {
      // Implementation for Firebase would go here
      // ...
    } catch (error) {
      console.error('Error joining media session:', error);
      if (this.callbacks?.onError) {
        this.callbacks.onError(error instanceof Error ? error : new Error('Failed to join session'));
      }
      throw error;
    }
  }
  
  // Leave the current media session
  async leaveSession(): Promise<void> {
    if (!this.currentSessionId) {
      return;
    }
    
    if (this.mockMode) {
      // Clear mock data
      if (this.mockSession && this.userId) {
        this.mockSession.participants = this.mockSession.participants.filter(id => id !== this.userId);
      }
      
      this.currentSessionId = null;
      this.mockActions = [];
      
      if (this.mockActionInterval) {
        clearInterval(this.mockActionInterval);
        this.mockActionInterval = null;
      }
      
      console.log('Left mock media session');
      return;
    }
    
    try {
      // Implementation for Firebase would go here
      // ...
      
      // Clean up listeners
      if (this.sessionUnsubscribe) {
        this.sessionUnsubscribe();
        this.sessionUnsubscribe = null;
      }
      
      if (this.actionsUnsubscribe) {
        this.actionsUnsubscribe();
        this.actionsUnsubscribe = null;
      }
      
      this.currentSessionId = null;
    } catch (error) {
      console.error('Error leaving media session:', error);
      if (this.callbacks?.onError) {
        this.callbacks.onError(error instanceof Error ? error : new Error('Failed to leave session'));
      }
    }
  }
  
  // Update the session state
  async updateSessionState(
    currentTime: number,
    isPlaying: boolean,
    playbackRate: number = 1
  ): Promise<void> {
    if (!this.currentSessionId || !this.userId) {
      return;
    }
    
    if (this.mockMode) {
      if (this.mockSession) {
        this.mockSession.currentTime = currentTime;
        this.mockSession.isPlaying = isPlaying;
        this.mockSession.playbackRate = playbackRate;
        this.mockSession.lastUpdated = new Date();
        
        // Notify about session update
        if (this.callbacks?.onSessionUpdate) {
          this.callbacks.onSessionUpdate(this.mockSession);
        }
      }
      return;
    }
    
    try {
      // Implementation for Firebase would go here
      // ...
    } catch (error) {
      console.error('Error updating session state:', error);
      if (this.callbacks?.onError) {
        this.callbacks.onError(error instanceof Error ? error : new Error('Failed to update session state'));
      }
    }
  }
  
  // Notify about a media action
  async sendMediaAction(
    actionType: 'play' | 'pause' | 'seek' | 'skip' | 'rate-change' | 'load',
    actionData: any
  ): Promise<void> {
    if (!this.currentSessionId || !this.userId) {
      return;
    }
    
    if (this.mockMode) {
      const action: MediaAction = {
        type: actionType,
        sessionId: this.currentSessionId,
        userId: this.userId,
        data: actionData,
        timestamp: new Date()
      };
      
      this.mockActions.push(action);
      
      // Update mock session state based on action
      if (this.mockSession) {
        switch (actionType) {
          case 'play':
            this.mockSession.isPlaying = true;
            break;
          case 'pause':
            this.mockSession.isPlaying = false;
            break;
          case 'seek':
            this.mockSession.currentTime = actionData.time;
            break;
          case 'skip':
            this.mockSession.currentTime = this.mockSession.currentTime + actionData.skipAmount;
            break;
          case 'rate-change':
            this.mockSession.playbackRate = actionData.rate;
            break;
          case 'load':
            this.mockSession.mediaUrl = actionData.mediaUrl;
            this.mockSession.title = actionData.title;
            this.mockSession.currentTime = 0;
            break;
        }
        
        this.mockSession.lastUpdated = new Date();
        
        // Notify about session update
        if (this.callbacks?.onSessionUpdate) {
          this.callbacks.onSessionUpdate(this.mockSession);
        }
      }
      
      console.log('Sent mock media action:', action);
      return;
    }
    
    try {
      // Implementation for Firebase would go here
      // ...
    } catch (error) {
      console.error('Error sending media action:', error);
      if (this.callbacks?.onError) {
        this.callbacks.onError(error instanceof Error ? error : new Error('Failed to send media action'));
      }
    }
  }
  
  // Helper methods for mock mode
  private startMockActionSimulation() {
    if (!this.mockMode || this.mockActionInterval) {
      return;
    }
    
    // Simulate friend actions every 20-40 seconds
    this.mockActionInterval = setInterval(() => {
      if (!this.mockSession || !this.callbacks?.onParticipantAction) {
        return;
      }
      
      const actions = ['play', 'pause', 'seek', 'skip', 'rate-change'];
      const randomAction = actions[Math.floor(Math.random() * actions.length)] as 'play' | 'pause' | 'seek' | 'skip' | 'rate-change';
      
      let actionData: any;
      
      switch (randomAction) {
        case 'play':
          actionData = {};
          break;
        case 'pause':
          actionData = {};
          break;
        case 'seek':
          actionData = { time: Math.floor(Math.random() * 100) };
          break;
        case 'skip':
          actionData = { skipAmount: Math.random() > 0.5 ? 10 : -10 };
          break;
        case 'rate-change':
          const rates = [0.5, 1, 1.5, 2];
          actionData = { rate: rates[Math.floor(Math.random() * rates.length)] };
          break;
      }
      
      const mockAction: MediaAction = {
        type: randomAction,
        sessionId: this.mockSession.id,
        userId: 'friend-user-id',
        data: actionData,
        timestamp: new Date()
      };
      
      // Update mock session based on friend's action
      switch (randomAction) {
        case 'play':
          this.mockSession.isPlaying = true;
          break;
        case 'pause':
          this.mockSession.isPlaying = false;
          break;
        case 'seek':
          this.mockSession.currentTime = actionData.time;
          break;
        case 'skip':
          this.mockSession.currentTime = this.mockSession.currentTime + actionData.skipAmount;
          break;
        case 'rate-change':
          this.mockSession.playbackRate = actionData.rate;
          break;
      }
      
      this.mockSession.lastUpdated = new Date();
      
      // Notify about session update
      if (this.callbacks?.onSessionUpdate) {
        this.callbacks.onSessionUpdate(this.mockSession);
      }
      
      // Notify about friend's action
      this.callbacks.onParticipantAction(mockAction);
      
    }, Math.random() * 20000 + 20000); // Random interval between 20-40 seconds
  }
}

// Create singleton instance
export const mediaSyncService = new MediaSyncService(); 