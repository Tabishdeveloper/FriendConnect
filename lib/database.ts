import { supabase } from './supabase';
import { v4 as uuidv4 } from 'uuid';

// Types
export interface Message {
  id?: string;
  sender: string;
  text: string;
  timestamp: Date | any;
  read?: boolean;
}

export interface User {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
  status: 'online' | 'offline';
  lastSeen?: Date | any;
}

// Mock data for development
const mockMessages: Message[] = [
  {
    id: '1',
    sender: 'friend-id',
    text: 'Hey there! How are you doing?',
    timestamp: new Date(Date.now() - 3600000),
    read: true
  },
  {
    id: '2',
    sender: 'mock-user-id',
    text: 'I\'m doing great! Just checking out this app.',
    timestamp: new Date(Date.now() - 1800000),
    read: true
  },
  {
    id: '3',
    sender: 'friend-id',
    text: 'It looks awesome! Want to watch a movie later?',
    timestamp: new Date(Date.now() - 600000),
    read: false
  }
];

const mockUsers: {[key: string]: User} = {
  'mock-user-id': {
    uid: 'mock-user-id',
    displayName: 'Demo User',
    email: 'user@example.com',
    status: 'online',
    lastSeen: new Date()
  },
  'friend-id': {
    uid: 'friend-id',
    displayName: 'Demo Friend',
    email: 'friend@example.com',
    status: 'online',
    lastSeen: new Date(Date.now() - 300000)
  }
};

// Channels for real-time updates
const setupMessageChannel = (chatId: string, callback: (messages: Message[]) => void) => {
  return supabase
    .channel(`messages-${chatId}`)
    .on('postgres_changes', { 
      event: '*', 
      schema: 'public', 
      table: 'messages',
      filter: `chat_id=eq.${chatId}`
    }, (payload) => {
      // Fetch all messages on any change
      getMessages(chatId.split('_')[0], chatId.split('_')[1], 50)
        .then(messages => callback(messages));
    })
    .subscribe();
};

// Chat functions
export const sendMessage = async (senderId: string, receiverId: string, text: string) => {
  try {
    // Create a chat ID that is consistent regardless of who initiates
    const chatId = [senderId, receiverId].sort().join('_');
    
    const newMessage = {
      chat_id: chatId,
      sender: senderId,
      text,
      timestamp: new Date(),
      read: false,
    };
    
    const { data, error } = await supabase.from('messages').insert(newMessage).select();
    
    if (error) throw error;
    
    // Update the chat metadata
    await supabase.from('chats').upsert({
      id: chatId,
      participants: [senderId, receiverId],
      last_message: text,
      last_message_time: new Date(),
      last_message_sender: senderId,
    }).select();
    
    return data ? data[0] : newMessage;
  } catch (error) {
    console.error('Error sending message:', error);
    
    // Fallback to mock in development
    if (process.env.NODE_ENV !== 'production') {
      console.log('Using mock message data');
      const newMessage = {
        id: uuidv4(),
        sender: senderId,
        text,
        timestamp: new Date(),
        read: false
      };
      mockMessages.push(newMessage);
      return newMessage;
    }
    
    throw error;
  }
};

export const getMessages = async (userId: string, friendId: string, messageLimit = 50) => {
  try {
    const chatId = [userId, friendId].sort().join('_');
    
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('chat_id', chatId)
      .order('timestamp', { ascending: true })
      .limit(messageLimit);
    
    if (error) throw error;
    
    // Mark messages as read
    const unreadMessages = data?.filter(msg => msg.sender === friendId && !msg.read) || [];
    for (const msg of unreadMessages) {
      if (msg.id) {
        await supabase
          .from('messages')
          .update({ read: true })
          .eq('id', msg.id);
      }
    }
    
    return data || [];
  } catch (error) {
    console.error('Error getting messages:', error);
    
    // Fallback to mock in development
    if (process.env.NODE_ENV !== 'production') {
      console.log('Using mock message data');
      return mockMessages
        .filter(msg => 
          (msg.sender === userId || msg.sender === friendId)
        )
        .slice(-messageLimit);
    }
    
    throw error;
  }
};

export const subscribeToMessages = (userId: string, friendId: string, callback: (messages: Message[]) => void) => {
  try {
    const chatId = [userId, friendId].sort().join('_');
    
    // Initial fetch
    getMessages(userId, friendId, 50).then(messages => callback(messages));
    
    // Set up real-time subscription
    const subscription = setupMessageChannel(chatId, callback);
    
    return () => {
      subscription.unsubscribe();
    };
  } catch (error) {
    console.error('Error subscribing to messages:', error);
    
    // Fallback to mock in development
    if (process.env.NODE_ENV !== 'production') {
      console.log('Using mock subscription');
      callback(mockMessages);
      
      // Simulate new messages every 30 seconds
      const intervalId = setInterval(() => {
        const newMessage = {
          id: uuidv4(),
          sender: 'friend-id',
          text: `Hey, what's up? (${new Date().toLocaleTimeString()})`,
          timestamp: new Date(),
          read: false
        };
        mockMessages.push(newMessage);
        callback([...mockMessages]);
      }, 30000);
      
      return () => clearInterval(intervalId);
    }
    
    throw error;
  }
};

// User functions
export const updateUserStatus = async (userId: string, isOnline: boolean) => {
  try {
    const { error } = await supabase
      .from('users')
      .update({
        status: isOnline ? 'online' : 'offline',
        last_seen: new Date(),
      })
      .eq('uid', userId);
    
    if (error) throw error;
  } catch (error) {
    console.error('Error updating user status:', error);
    
    // Fallback to mock in development
    if (process.env.NODE_ENV !== 'production') {
      console.log('Using mock user status update');
      if (mockUsers[userId]) {
        mockUsers[userId].status = isOnline ? 'online' : 'offline';
        mockUsers[userId].lastSeen = new Date();
      }
    } else {
      throw error;
    }
  }
};

export const getUserProfile = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('uid', userId)
      .single();
    
    if (error) throw error;
    if (!data) throw new Error('User not found');
    
    return data as User;
  } catch (error) {
    console.error('Error getting user profile:', error);
    
    // Fallback to mock in development
    if (process.env.NODE_ENV !== 'production') {
      console.log('Using mock user data');
      const user = mockUsers[userId];
      if (user) {
        return user;
      }
      throw new Error('User not found in mock data');
    }
    
    throw error;
  }
};

export const createUserProfile = async (user: User) => {
  try {
    const { error } = await supabase
      .from('users')
      .upsert({
        uid: user.uid,
        displayName: user.displayName,
        email: user.email,
        photoURL: user.photoURL,
        status: 'online',
        last_seen: new Date(),
      })
      .select();
    
    if (error) throw error;
  } catch (error) {
    console.error('Error creating user profile:', error);
    
    // Fallback to mock in development
    if (process.env.NODE_ENV !== 'production') {
      console.log('Using mock user data');
      mockUsers[user.uid] = {
        ...user,
        status: 'online',
        lastSeen: new Date()
      };
    } else {
      throw error;
    }
  }
};

// Media sharing functions
export const shareMedia = async (senderId: string, receiverId: string, mediaType: 'video' | 'audio', mediaUrl: string, title: string) => {
  try {
    const chatId = [senderId, receiverId].sort().join('_');
    
    const mediaData = {
      sender: senderId,
      media_type: mediaType,
      media_url: mediaUrl,
      title,
      timestamp: new Date(),
      read: false,
      participants: [senderId, receiverId],
    };
    
    const { data, error } = await supabase
      .from('shared_media')
      .insert(mediaData)
      .select();
    
    if (error) throw error;
    
    // Also add as a message
    await sendMessage(senderId, receiverId, `Shared ${mediaType}: ${title}`);
    
    return data ? data[0] : mediaData;
  } catch (error) {
    console.error('Error sharing media:', error);
    
    // Fallback to mock in development
    if (process.env.NODE_ENV !== 'production') {
      console.log('Using mock media sharing');
      const mediaMessage = await sendMessage(senderId, receiverId, `Shared ${mediaType}: ${title}`);
      return {
        id: mediaMessage.id,
        sender: senderId,
        mediaType,
        mediaUrl,
        title,
        timestamp: new Date(),
        read: false,
        participants: [senderId, receiverId]
      };
    }
    
    throw error;
  }
}; 