'use client';

import { useState, useRef, useEffect } from 'react';

export default function VideoCall() {
  const [isCalling, setIsCalling] = useState(false);
  const [isCallConnected, setIsCallConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  
  // Initialize camera when component mounts
  useEffect(() => {
    // Clean up function to stop all tracks when component unmounts
    return () => {
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [localStream]);

  // Function to access user's camera and microphone
  const initializeMedia = async () => {
    try {
      setCameraError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: true 
      });
      
      setLocalStream(stream);
      
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
        localVideoRef.current.muted = true; // Mute local video to prevent echo
      }
      
      return stream;
    } catch (error) {
      console.error('Error accessing media devices:', error);
      setCameraError('Could not access camera or microphone. Please check permissions.');
      return null;
    }
  };
  
  // In a real app, this would use WebRTC to establish a peer connection
  const startCall = async () => {
    setIsCalling(true);
    
    // Initialize camera and microphone
    const stream = await initializeMedia();
    
    if (!stream) {
      setIsCalling(false);
      return;
    }
    
    // Simulate call connection after 2 seconds
    setTimeout(() => {
      setIsCalling(false);
      setIsCallConnected(true);
      
      // In a real app with WebRTC, we would:
      // 1. Create a peer connection
      // 2. Add local stream tracks to the connection
      // 3. Create and exchange offer/answer with the remote peer
      // 4. Set up ICE candidates exchange
      
      // For now, we'll simulate a remote stream with a copy of our local stream
      if (remoteVideoRef.current) {
        // In a real app, this would be the stream from the remote peer
        // For demo purposes, we're creating a simulated remote stream
        const simulatedRemoteStream = new MediaStream();
        
        // Add a simulated video track (in a real app this would come from the peer)
        const videoTrack = stream.getVideoTracks()[0];
        if (videoTrack) {
          simulatedRemoteStream.addTrack(videoTrack);
        }
        
        remoteVideoRef.current.srcObject = simulatedRemoteStream;
      }
    }, 2000);
  };
  
  const endCall = () => {
    setIsCallConnected(false);
    
    // In a real app, we would clean up the WebRTC connection
    if (localStream) {
      // Don't stop the tracks yet if we're just ending the call
      // as we might want to start another call without re-requesting permissions
    }
    
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }
    
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }
  };
  
  const toggleMute = () => {
    setIsMuted(!isMuted);
    
    // Actually mute the audio track
    if (localStream) {
      localStream.getAudioTracks().forEach(track => {
        track.enabled = isMuted; // Toggle the current state
      });
    }
  };
  
  const toggleVideo = () => {
    setIsVideoOff(!isVideoOff);
    
    // Actually disable the video track
    if (localStream) {
      localStream.getVideoTracks().forEach(track => {
        track.enabled = isVideoOff; // Toggle the current state
      });
    }
  };

  // Function to switch camera (front/back) if available
  const switchCamera = async () => {
    if (!localStream) return;
    
    // Stop all current video tracks
    localStream.getVideoTracks().forEach(track => track.stop());
    
    try {
      // Get current camera facing mode
      const currentVideoTrack = localStream.getVideoTracks()[0];
      const currentFacingMode = currentVideoTrack?.getSettings().facingMode;
      
      // Request the opposite facing mode
      const newFacingMode = currentFacingMode === 'user' ? 'environment' : 'user';
      
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: newFacingMode },
        audio: true
      });
      
      // Replace video track in the local stream
      const newVideoTrack = newStream.getVideoTracks()[0];
      
      if (newVideoTrack && localVideoRef.current) {
        const audioTracks = localStream.getAudioTracks();
        
        // Create a new stream with the new video track and existing audio tracks
        const updatedStream = new MediaStream([newVideoTrack, ...audioTracks]);
        setLocalStream(updatedStream);
        
        localVideoRef.current.srcObject = updatedStream;
      }
    } catch (error) {
      console.error('Error switching camera:', error);
      setCameraError('Could not switch camera. Your device might have only one camera.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
      <div className="py-4">
        <div className="bg-gray-900 rounded-lg overflow-hidden h-[calc(100vh-12rem)]">
          {!isCallConnected ? (
            <div className="flex flex-col items-center justify-center h-full">
              <div className="text-center">
                <div className="h-24 w-24 rounded-full bg-gray-800 mx-auto mb-6 flex items-center justify-center">
                  <svg className="h-12 w-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                  </svg>
                </div>
                <h2 className="text-xl font-semibold text-white mb-2">Video Call with Friend</h2>
                <p className="text-gray-400 mb-8">Connect face-to-face in real-time</p>
                
                {cameraError && (
                  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                    <span className="block sm:inline">{cameraError}</span>
                  </div>
                )}
                
                {isCalling ? (
                  <div className="flex flex-col items-center">
                    <div className="animate-pulse text-primary-400 mb-4">Calling...</div>
                    <button
                      onClick={() => setIsCalling(false)}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={startCall}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                    </svg>
                    Start Call
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="relative h-full">
              {/* Remote video (full screen) */}
              <video
                ref={remoteVideoRef}
                className="w-full h-full object-cover"
                autoPlay
                playsInline
              ></video>
              
              {/* Local video (picture-in-picture) */}
              <div className="absolute bottom-4 right-4 w-48 h-36 bg-black rounded-lg overflow-hidden shadow-lg">
                <video
                  ref={localVideoRef}
                  className={`w-full h-full object-cover ${isVideoOff ? 'hidden' : ''}`}
                  autoPlay
                  playsInline
                ></video>
                
                {isVideoOff && (
                  <div className="w-full h-full flex items-center justify-center bg-gray-800">
                    <svg className="h-12 w-12 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                    </svg>
                  </div>
                )}
              </div>
              
              {/* Call controls */}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center space-x-4 bg-gray-800 bg-opacity-75 rounded-full px-4 py-2">
                <button
                  onClick={toggleMute}
                  className={`p-3 rounded-full ${isMuted ? 'bg-red-500' : 'bg-gray-700'} text-white focus:outline-none`}
                  title={isMuted ? "Unmute" : "Mute"}
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
                
                <button
                  onClick={endCall}
                  className="p-3 rounded-full bg-red-600 text-white focus:outline-none"
                  title="End Call"
                >
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 8l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M5 3a2 2 0 00-2 2v1c0 8.284 6.716 15 15 15h1a2 2 0 002-2v-3.28a1 1 0 00-.684-.948l-4.493-1.498a1 1 0 00-1.21.502l-1.13 2.257a11.042 11.042 0 01-5.516-5.517l2.257-1.128a1 1 0 00.502-1.21L9.228 3.683A1 1 0 008.279 3H5z"></path>
                  </svg>
                </button>
                
                <button
                  onClick={toggleVideo}
                  className={`p-3 rounded-full ${isVideoOff ? 'bg-red-500' : 'bg-gray-700'} text-white focus:outline-none`}
                  title={isVideoOff ? "Turn Camera On" : "Turn Camera Off"}
                >
                  {isVideoOff ? (
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2"></path>
                    </svg>
                  ) : (
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                    </svg>
                  )}
                </button>
                
                <button
                  onClick={switchCamera}
                  className="p-3 rounded-full bg-gray-700 text-white focus:outline-none"
                  title="Switch Camera"
                >
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                  </svg>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 