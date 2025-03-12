'use client';

import { useState, useRef, useEffect } from 'react';

export default function Chat() {
  const [messages, setMessages] = useState([
    { id: 1, sender: 'friend', text: 'Hey there! How are you doing today?', timestamp: new Date(Date.now() - 3600000).toISOString() },
    { id: 2, sender: 'me', text: 'I\'m doing great! Just finished some work. How about you?', timestamp: new Date(Date.now() - 3000000).toISOString() },
    { id: 3, sender: 'friend', text: 'Pretty good! Want to watch a movie later?', timestamp: new Date(Date.now() - 2400000).toISOString() },
    { id: 4, sender: 'me', text: 'Sure! What do you have in mind?', timestamp: new Date(Date.now() - 1800000).toISOString() },
    { id: 5, sender: 'friend', text: 'How about The Matrix? It\'s been a while since we watched it.', timestamp: new Date(Date.now() - 1200000).toISOString() },
  ]);
  
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newMessage.trim() === '') return;
    
    const message = {
      id: messages.length + 1,
      sender: 'me',
      text: newMessage,
      timestamp: new Date().toISOString(),
    };
    
    setMessages([...messages, message]);
    setNewMessage('');
    
    // Simulate friend response after 2 seconds
    setTimeout(() => {
      const responses = [
        'That sounds great!',
        'Interesting! Tell me more.',
        'I see what you mean.',
        'Haha, that\'s funny!',
        'I agree with you on that.',
        'Let\'s talk about it more later.',
        'Do you want to watch a movie together?',
        'Should we listen to some music?',
      ];
      
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      
      const responseMessage = {
        id: messages.length + 2,
        sender: 'friend',
        text: randomResponse,
        timestamp: new Date().toISOString(),
      };
      
      setMessages(prevMessages => [...prevMessages, responseMessage]);
    }, 2000);
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
      <div className="py-4">
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden h-[calc(100vh-12rem)]">
          {/* Chat header */}
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center">
            <div className="relative">
              <div className="h-10 w-10 rounded-full bg-gray-100 dark:bg-gray-700 overflow-hidden">
                <svg className="h-full w-full text-gray-300 dark:text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-400 border-2 border-white dark:border-gray-800"></div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900 dark:text-white">Friend</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Online</p>
            </div>
            <div className="ml-auto flex space-x-2">
              <button className="p-2 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:text-gray-500">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                </svg>
              </button>
              <button className="p-2 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:text-gray-500">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                </svg>
              </button>
              <button className="p-2 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:text-gray-500">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"></path>
                </svg>
              </button>
            </div>
          </div>
          
          {/* Chat messages */}
          <div className="p-6 overflow-y-auto h-[calc(100%-10rem)]">
            <div className="space-y-4">
              {messages.map((message) => (
                <div 
                  key={message.id} 
                  className={`flex ${message.sender === 'me' ? 'justify-end' : 'justify-start'}`}
                >
                  <div 
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      message.sender === 'me' 
                        ? 'bg-primary-600 text-white' 
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                    }`}
                  >
                    <p>{message.text}</p>
                    <p className={`text-xs mt-1 ${
                      message.sender === 'me' 
                        ? 'text-primary-100' 
                        : 'text-gray-500 dark:text-gray-400'
                    }`}>
                      {formatTime(message.timestamp)}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </div>
          
          {/* Chat input */}
          <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
            <form onSubmit={handleSendMessage} className="flex space-x-2">
              <button
                type="button"
                className="p-2 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:text-gray-500"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"></path>
                </svg>
              </button>
              <input
                type="text"
                className="flex-1 focus:outline-none focus:ring-0 border-0 bg-transparent"
                placeholder="Type your message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
              />
              <button
                type="button"
                className="p-2 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:text-gray-500"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </button>
              <button
                type="submit"
                className="inline-flex items-center justify-center p-2 rounded-full bg-primary-600 text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
                </svg>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
} 