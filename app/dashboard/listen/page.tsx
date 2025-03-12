'use client';

import { useState, useRef, useEffect } from 'react';

export default function ListenTogether() {
  const [audioUrl, setAudioUrl] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [playlist, setPlaylist] = useState<{ title: string; artist: string; url: string }[]>([]);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [messages, setMessages] = useState<{ id: number; sender: string; text: string; timestamp: string }[]>([]);
  const [newMessage, setNewMessage] = useState('');
  
  const audioRef = useRef<HTMLAudioElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Sample tracks to choose from
  const sampleTracks = [
    { 
      title: 'Mellow Morning',
      artist: 'Dee Yan-Key',
      url: 'https://files.freemusicarchive.org/storage-freemusicarchive-org/music/no_curator/Dee_Yan-Key/Ambient_piano/Dee_Yan-Key_-_01_-_Mellow_Morning.mp3'
    },
    { 
      title: 'Rainfall',
      artist: 'Rafael Krux',
      url: 'https://files.freemusicarchive.org/storage-freemusicarchive-org/music/ccCommunity/Rafael_Krux/Percussion_Ensemble/Rafael_Krux_-_01_-_Rainfall.mp3'
    },
    { 
      title: 'Reunion',
      artist: 'Dee Yan-Key',
      url: 'https://files.freemusicarchive.org/storage-freemusicarchive-org/music/no_curator/Dee_Yan-Key/Ambient_piano/Dee_Yan-Key_-_03_-_Reunion.mp3'
    },
    { 
      title: 'Harmony',
      artist: 'Dee Yan-Key',
      url: 'https://files.freemusicarchive.org/storage-freemusicarchive-org/music/no_curator/Dee_Yan-Key/Ambient_piano/Dee_Yan-Key_-_02_-_Harmony.mp3'
    },
  ];
  
  useEffect(() => {
    const handleTimeUpdate = () => {
      if (audioRef.current) {
        setCurrentTime(audioRef.current.currentTime);
      }
    };
    
    const handleDurationChange = () => {
      if (audioRef.current) {
        setDuration(audioRef.current.duration);
      }
    };
    
    const handlePlay = () => {
      setIsPlaying(true);
      
      // In a real app, we would send a play event to the other user
    };
    
    const handlePause = () => {
      setIsPlaying(false);
      
      // In a real app, we would send a pause event to the other user
    };
    
    const handleEnded = () => {
      // Play next track when current one ends
      if (currentTrackIndex < playlist.length - 1) {
        setCurrentTrackIndex(currentTrackIndex + 1);
      } else {
        setIsPlaying(false);
      }
    };
    
    const audio = audioRef.current;
    if (audio) {
      audio.addEventListener('timeupdate', handleTimeUpdate);
      audio.addEventListener('durationchange', handleDurationChange);
      audio.addEventListener('play', handlePlay);
      audio.addEventListener('pause', handlePause);
      audio.addEventListener('ended', handleEnded);
    }
    
    return () => {
      if (audio) {
        audio.removeEventListener('timeupdate', handleTimeUpdate);
        audio.removeEventListener('durationchange', handleDurationChange);
        audio.removeEventListener('play', handlePlay);
        audio.removeEventListener('pause', handlePause);
        audio.removeEventListener('ended', handleEnded);
      }
    };
  }, [currentTrackIndex, playlist.length]);
  
  // Update audio source when track changes
  useEffect(() => {
    if (playlist.length > 0 && audioRef.current) {
      const track = playlist[currentTrackIndex];
      audioRef.current.src = track.url;
      audioRef.current.load();
      if (isPlaying) {
        audioRef.current.play();
      }
    }
  }, [currentTrackIndex, playlist, isPlaying]);
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  const handleTrackSelect = (track: { title: string; artist: string; url: string }) => {
    setPlaylist([track]);
    setCurrentTrackIndex(0);
    setIsListening(true);
    
    // In a real app, we would send the track info to the other user
  };
  
  const handleAddToPlaylist = (track: { title: string; artist: string; url: string }) => {
    setPlaylist([...playlist, track]);
    if (playlist.length === 0) {
      setIsListening(true);
    }
    
    // In a real app, we would send the updated playlist to the other user
  };
  
  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
    }
  };
  
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const seekTime = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = seekTime;
      setCurrentTime(seekTime);
      
      // In a real app, we would send a seek event to the other user
    }
  };
  
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
      setIsMuted(newVolume === 0);
    }
  };
  
  const toggleMute = () => {
    if (audioRef.current) {
      const newMuted = !isMuted;
      audioRef.current.muted = newMuted;
      setIsMuted(newMuted);
      if (newMuted) {
        setVolume(0);
      } else {
        setVolume(1);
        audioRef.current.volume = 1;
      }
    }
  };
  
  const playPrevious = () => {
    if (currentTrackIndex > 0) {
      setCurrentTrackIndex(currentTrackIndex - 1);
    }
  };
  
  const playNext = () => {
    if (currentTrackIndex < playlist.length - 1) {
      setCurrentTrackIndex(currentTrackIndex + 1);
    }
  };
  
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
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
        'I love this song!',
        'Great choice!',
        'This artist is amazing.',
        'The beat is so good.',
        'Can we add this to our favorites?',
        'I have another song by this artist we should listen to next.',
        'The lyrics are so meaningful.',
        'This reminds me of that time we...',
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
        {!isListening ? (
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                Listen Together
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Select music to listen with your friend in perfect sync.
              </p>
            </div>
            
            <div className="px-6 py-5">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {sampleTracks.map((track, index) => (
                  <div 
                    key={index} 
                    className="bg-gray-50 dark:bg-gray-700 overflow-hidden rounded-lg shadow"
                  >
                    <div className="h-40 bg-gradient-to-r from-primary-500 to-secondary-500 flex items-center justify-center">
                      <svg className="h-16 w-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"></path>
                      </svg>
                    </div>
                    <div className="px-4 py-4">
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white">{track.title}</h4>
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{track.artist}</p>
                      <div className="mt-4 flex space-x-2">
                        <button
                          onClick={() => handleTrackSelect(track)}
                          className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                        >
                          Play Now
                        </button>
                        <button
                          onClick={() => handleAddToPlaylist(track)}
                          className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-600 hover:bg-gray-50 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                        >
                          Add to Queue
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-8">
                <label htmlFor="custom-url" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Or enter a custom audio URL
                </label>
                <div className="mt-1 flex rounded-md shadow-sm">
                  <input
                    type="text"
                    name="custom-url"
                    id="custom-url"
                    className="focus:ring-primary-500 focus:border-primary-500 flex-1 block w-full rounded-none rounded-l-md sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                    placeholder="https://example.com/audio.mp3"
                    value={audioUrl}
                    onChange={(e) => setAudioUrl(e.target.value)}
                  />
                  <button
                    type="button"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-r-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    onClick={() => audioUrl && handleTrackSelect({ title: 'Custom Track', artist: 'Unknown', url: audioUrl })}
                  >
                    Play
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
              {/* Audio player */}
              <div className="p-6">
                <audio ref={audioRef} className="hidden"></audio>
                
                {/* Now playing info */}
                <div className="flex items-center mb-6">
                  <div className="h-20 w-20 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
                    <svg className="h-10 w-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"></path>
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                      {playlist[currentTrackIndex]?.title || 'No track selected'}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {playlist[currentTrackIndex]?.artist || 'Unknown artist'}
                    </p>
                  </div>
                </div>
                
                {/* Playback controls */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {formatTime(currentTime)}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {formatTime(duration)}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max={duration || 0}
                    value={currentTime}
                    onChange={handleSeek}
                    className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
                
                <div className="flex items-center justify-center space-x-6">
                  <button
                    onClick={playPrevious}
                    disabled={currentTrackIndex === 0}
                    className={`p-2 rounded-full focus:outline-none ${
                      currentTrackIndex === 0 
                        ? 'text-gray-400 dark:text-gray-600' 
                        : 'text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400'
                    }`}
                  >
                    <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7"></path>
                    </svg>
                  </button>
                  
                  <button
                    onClick={togglePlay}
                    className="p-4 rounded-full bg-primary-600 text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    {isPlaying ? (
                      <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                    ) : (
                      <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                    )}
                  </button>
                  
                  <button
                    onClick={playNext}
                    disabled={currentTrackIndex === playlist.length - 1}
                    className={`p-2 rounded-full focus:outline-none ${
                      currentTrackIndex === playlist.length - 1 
                        ? 'text-gray-400 dark:text-gray-600' 
                        : 'text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400'
                    }`}
                  >
                    <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 5l7 7-7 7M5 5l7 7-7 7"></path>
                    </svg>
                  </button>
                </div>
                
                <div className="mt-6 flex items-center">
                  <button
                    onClick={toggleMute}
                    className="text-gray-700 dark:text-gray-300 mr-2 focus:outline-none"
                  >
                    {isMuted ? (
                      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" clipRule="evenodd"></path>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2"></path>
                      </svg>
                    ) : (
                      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"></path>
                      </svg>
                    )}
                  </button>
                  
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={volume}
                    onChange={handleVolumeChange}
                    className="w-24 h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              </div>
              
              {/* Playlist */}
              <div className="border-t border-gray-200 dark:border-gray-700">
                <div className="px-6 py-3 bg-gray-50 dark:bg-gray-700">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white">Queue</h4>
                </div>
                <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                  {playlist.length > 0 ? (
                    playlist.map((track, index) => (
                      <li 
                        key={index}
                        className={`px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer ${
                          index === currentTrackIndex ? 'bg-gray-100 dark:bg-gray-600' : ''
                        }`}
                        onClick={() => setCurrentTrackIndex(index)}
                      >
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            {index === currentTrackIndex && isPlaying ? (
                              <div className="h-8 w-8 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
                                <svg className="h-4 w-4 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                </svg>
                              </div>
                            ) : (
                              <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                                <span className="text-sm text-gray-600 dark:text-gray-400">{index + 1}</span>
                              </div>
                            )}
                          </div>
                          <div className="ml-3">
                            <p className="text-sm font-medium text-gray-900 dark:text-white">{track.title}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{track.artist}</p>
                          </div>
                        </div>
                      </li>
                    ))
                  ) : (
                    <li className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                      No tracks in queue
                    </li>
                  )}
                </ul>
              </div>
            </div>
            
            {/* Chat sidebar */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden flex flex-col h-[calc(100vh-12rem)]">
              <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Chat</h3>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4">
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
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              </div>
              
              <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700">
                <form onSubmit={handleSendMessage} className="flex">
                  <input
                    type="text"
                    className="flex-1 focus:ring-primary-500 focus:border-primary-500 block w-full rounded-l-md sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    placeholder="Type your message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                  />
                  <button
                    type="submit"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-r-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
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