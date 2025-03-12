import Link from 'next/link';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 md:p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-center font-mono text-sm flex flex-col">
        <h1 className="text-4xl md:text-6xl font-bold text-center mb-6 bg-gradient-to-r from-primary-500 to-secondary-500 text-transparent bg-clip-text">
          Friend Connect
        </h1>
        <p className="text-lg md:text-xl text-center mb-8 max-w-2xl">
          Your personal space to connect, chat, watch movies, and listen to music with your friend.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl">
          <Link 
            href="/login" 
            className="btn btn-primary w-full text-center py-3 text-lg rounded-lg"
          >
            Login
          </Link>
          <Link 
            href="/signup" 
            className="btn btn-secondary w-full text-center py-3 text-lg rounded-lg"
          >
            Sign Up
          </Link>
        </div>
        
        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 w-full">
          <FeatureCard 
            title="Real-time Chat" 
            description="Chat with your friend in real-time with text, emojis, and media sharing."
            icon="💬"
          />
          <FeatureCard 
            title="Video Calls" 
            description="Connect face-to-face with high-quality video and audio calls."
            icon="📹"
          />
          <FeatureCard 
            title="Watch Together" 
            description="Sync movies and videos to watch together, no matter where you are."
            icon="🎬"
          />
          <FeatureCard 
            title="Listen Together" 
            description="Share and listen to music in perfect sync with your friend."
            icon="🎵"
          />
        </div>
      </div>
    </main>
  );
}

function FeatureCard({ title, description, icon }: { title: string; description: string; icon: string }) {
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-gray-600 dark:text-gray-300">{description}</p>
    </div>
  );
} 