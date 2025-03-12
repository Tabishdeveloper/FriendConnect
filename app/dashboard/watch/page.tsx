'use client';

import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';
import mediaSyncService from '@/lib/mediaSync';

export default function WatchTogether() {
  const { user } = useAuth();
  const [videoUrl, setVideoUrl] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isWatching, setIsWatching] = useState(false);
  const [messages, setMessages] = useState<{ id: number; sender: string; text: string; timestamp: string }[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [friendId, setFriendId] = useState('friend-id'); // In a real app, this would be dynamic
  const [syncEnabled, setSyncEnabled] = useState(true);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const videoContainerRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const lastUpdateTimeRef = useRef<number>(0);
  
  // Sample videos to choose from
  const sampleVideos = [
    { title: 'Big Buck Bunny', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4' },
    { title: 'Elephant Dream', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4' },
    { title: 'Sintel', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4' },
  ];
  
  useEffect(() => {
    const handleTimeUpdate = () => {
      if (videoRef.current) {
        setCurrentTime(videoRef.current.currentTime);
        
        // Sync current time with other users periodically (every 5 seconds)
        if (syncEnabled && sessionId && user) {
          const now = Date.now();
          if (now - lastUpdateTimeRef.current > 5000) {
            lastUpdateTimeRef.current = now;
            mediaSyncService.updateCurrentTime(videoRef.current.currentTime).catch(console.error);
          }
        }
      }
    };
    
    const handleDurationChange = () => {
      if (videoRef.current) {
        setDuration(videoRef.current.duration);
      }
    };
    
    const handlePlay = () => {
      setIsPlaying(true);
      
      // Sync play state with other users
      if (syncEnabled && sessionId && user) {
        mediaSyncService.play().catch(console.error);
      }
    };
    
    const handlePause = () => {
      setIsPlaying(false);
      
      // Sync pause state with other users
      if (syncEnabled && sessionId && user) {
        mediaSyncService.pause().catch(console.error);
      }
    };
    
    const video = videoRef.current;
    if (video) {
      video.addEventListener('timeupdate', handleTimeUpdate);
      video.addEventListener('durationchange', handleDurationChange);
      video.addEventListener('play', handlePlay);
      video.addEventListener('pause', handlePause);
    }
    
    return () => {
      if (video) {
        video.removeEventListener('timeupdate', handleTimeUpdate);
        video.removeEventListener('durationchange', handleDurationChange);
        video.removeEventListener('play', handlePlay);
        video.removeEventListener('pause', handlePause);
      }
    };
  }, [sessionId, syncEnabled, user]);
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  // Set up media sync callbacks
  useEffect(() => {
    if (!user) return;
    
    mediaSyncService.setOnPlay(() => {
      if (videoRef.current && !isPlaying) {
        setSyncEnabled(false); // Temporarily disable sync to avoid loops
        videoRef.current.play().then(() => {
          setSyncEnabled(true);
        }).catch(console.error);
      }
    });
    
    mediaSyncService.setOnPause(() => {
      if (videoRef.current && isPlaying) {
        setSyncEnabled(false); // Temporarily disable sync to avoid loops
        videoRef.current.pause();
        setSyncEnabled(true);
      }
    });
    
    mediaSyncService.setOnSeek((time) => {
      if (videoRef.current) {
        setSyncEnabled(false); // Temporarily disable sync to avoid loops
        videoRef.current.currentTime = time;
        setCurrentTime(time);
        setSyncEnabled(true);
      }
    });
    
    mediaSyncService.setOnLoad((url, title) => {
      setVideoUrl(url);
      if (videoRef.current) {
        videoRef.current.src = url;
        videoRef.current.load();
      }
    });
    
    // Clean up media sync session when component unmounts
    return () => {
      if (sessionId) {
        mediaSyncService.leaveSession().catch(console.error);
      }
    };
  }, [user, isPlaying, sessionId]);
  
  const handleVideoSelect = async (url: string, title: string) => {
    setVideoUrl(url);
    setIsWatching(true);
    
    // Create a new media session
    if (user && friendId) {
      try {
        const newSessionId = await mediaSyncService.createSession(
          user.uid,
          friendId,
          'video',
          url,
          title
        );
        setSessionId(newSessionId);
      } catch (error) {
        console.error('Error creating media session:', error);
      }
    }
  };
  
  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
    }
  };
  
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const seekTime = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = seekTime;
      setCurrentTime(seekTime);
      
      // Sync seek with other users
      if (syncEnabled && sessionId && user) {
        mediaSyncService.seek(seekTime).catch(console.error);
      }
    }
  };
  
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
      setIsMuted(newVolume === 0);
    }
  };
  
  const toggleMute = () => {
    if (videoRef.current) {
      const newMuted = !isMuted;
      videoRef.current.muted = newMuted;
      setIsMuted(newMuted);
      if (newMuted) {
        setVolume(0);
      } else {
        setVolume(1);
        videoRef.current.volume = 1;
      }
    }
  };
  
  const toggleFullscreen = () => {
    if (videoContainerRef.current) {
      if (!isFullscreen) {
        if (videoContainerRef.current.requestFullscreen) {
          videoContainerRef.current.requestFullscreen();
        }
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen();
        }
      }
      setIsFullscreen(!isFullscreen);
    }
  };
  
  const handleMouseMove = () => {
    setShowControls(true);
    
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    
    controlsTimeoutRef.current = setTimeout(() => {
      setShowControls(false);
    }, 3000);
  };
  
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };
  
  // Skip forward or backward
  const handleSkip = (seconds: number) => {
    if (videoRef.current) {
      const newTime = Math.max(0, Math.min(videoRef.current.currentTime + seconds, videoRef.current.duration));
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
      
      // Sync skip with other users
      if (syncEnabled && sessionId && user) {
        mediaSyncService.skip(seconds).catch(console.error);
      }
    }
  };
  
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
        'This part is so good!',
        'Wait, did you see that?',
        'I love this scene!',
        'The cinematography here is amazing.',
        'This actor is so talented.',
        'I didn\'t expect that plot twist!',
        'The soundtrack is perfect for this moment.',
        'Can you pause for a second? I need to grab something.',
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
      <div className="py-4">
        {!isWatching ? (
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                Watch Together
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Select a video to watch with your friend in perfect sync.
              </p>
            </div>
            
            <div className="px-6 py-5">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {sampleVideos.map((video, index) => (
                  <div 
                    key={index} 
                    className="bg-gray-50 dark:bg-gray-700 overflow-hidden rounded-lg shadow cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => handleVideoSelect(video.url, video.title)}
                  >
                    <div className="h-40 bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                      <svg className="h-12 w-12 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                    </div>
                    <div className="px-4 py-4">
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white">{video.title}</h4>
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Sample video</p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-8">
                <label htmlFor="custom-url" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Or enter a custom video URL
                </label>
                <div className="mt-1 flex rounded-md shadow-sm">
                  <input
                    type="text"
                    name="custom-url"
                    id="custom-url"
                    className="focus:ring-primary-500 focus:border-primary-500 flex-1 block w-full rounded-none rounded-l-md sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                    placeholder="https://example.com/video.mp4"
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                  />
                  <button
                    type="button"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-r-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    onClick={() => handleVideoSelect(videoUrl, 'Custom Video')}
                  >
                    Watch
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            <div className="lg:col-span-3">
              <div 
                ref={videoContainerRef}
                className="relative bg-black rounded-lg overflow-hidden"
                onMouseMove={handleMouseMove}
              >
                <video
                  ref={videoRef}
                  className="w-full h-auto"
                  src={videoUrl}
                  onClick={togglePlay}
                ></video>
                
                {/* Video controls */}
                <div 
                  className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4 transition-opacity duration-300 ${
                    showControls ? 'opacity-100' : 'opacity-0'
                  }`}
                >
                  <div className="flex items-center mb-2">
                    <input
                      type="range"
                      min="0"
                      max={duration || 0}
                      value={currentTime}
                      onChange={handleSeek}
                      className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <button
                        onClick={() => handleSkip(-10)}
                        className="text-white focus:outline-none"
                        title="Skip back 10 seconds"
                      >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0019 16V8a1 1 0 00-1.6-.8l-5.333 4zM4.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0011 16V8a1 1 0 00-1.6-.8l-5.334 4z"></path>
                        </svg>
                      </button>
                      
                      <button
                        onClick={togglePlay}
                        className="text-white focus:outline-none"
                      >
                        {isPlaying ? (
                          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                          </svg>
                        ) : (
                          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                          </svg>
                        )}
                      </button>
                      
                      <button
                        onClick={() => handleSkip(10)}
                        className="text-white focus:outline-none"
                        title="Skip forward 10 seconds"
                      >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.933 12.8a1 1 0 000-1.6L6.6 7.2A1 1 0 005 8v8a1 1 0 001.6.8l5.333-4zM19.933 12.8a1 1 0 000-1.6l-5.333-4A1 1 0 0013 8v8a1 1 0 001.6.8l5.333-4z"></path>
                        </svg>
                      </button>
                      
                      <div className="text-white text-sm">
                        {formatTime(currentTime)} / {formatTime(duration)}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center">
                        <button
                          onClick={toggleMute}
                          className="text-white focus:outline-none mr-2"
                        >
                          {isMuted ? (
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" clipRule="evenodd"></path>
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2"></path>
                            </svg>
                          ) : (
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"></path>
                            </svg>
                          )}
                        </button>
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.01"
                          value={volume}
                          onChange={handleVolumeChange}
                          className="w-20 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                        />
                      </div>
                      
                      <button
                        onClick={toggleFullscreen}
                        className="text-white focus:outline-none"
                      >
                        {isFullscreen ? (
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 9V4.5M9 9H4.5M15 9H19.5M15 9V4.5M15 15v4.5M15 15H4.5M15 15h4.5M9 15v4.5"></path>
                          </svg>
                        ) : (
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5"></path>
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden flex flex-col h-[calc(100vh-12rem)]">
              <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Chat</h3>
              </div>
              
              <div className="flex-1 p-4 overflow-y-auto">
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div 
                      key={message.id} 
                      className={`flex ${message.sender === 'me' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div 
                        className={`max-w-xs px-4 py-2 rounded-lg ${
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
                          {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              </div>
              
              <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700">
                <form onSubmit={handleSendMessage} className="flex space-x-2">
                  <input
                    type="text"
                    className="flex-1 focus:ring-primary-500 focus:border-primary-500 block w-full rounded-md sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    placeholder="Type your message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                  />
                  <button
                    type="submit"
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    Send
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 