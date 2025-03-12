# Friend Connect

A fully functional website for you and your friend to connect, chat, watch movies, and listen to music together in real-time.

## Features

- **User Authentication**: Secure login and signup system for you and your friend.
- **Real-time Chat**: Text messaging with instant delivery.
- **Video Calls**: Face-to-face communication with audio and video.
- **Watch Together**: Synchronized video watching experience.
- **Listen Together**: Shared music listening with synchronized playback.
- **Games**: Simple games to play together.
- **Responsive Design**: Works on both desktop and mobile devices.

## Tech Stack

- **Frontend**: Next.js with TypeScript and TailwindCSS
- **Authentication**: Simulated (can be integrated with Firebase Auth)
- **Real-time Communication**: WebRTC (simulated)
- **Styling**: TailwindCSS for responsive and beautiful UI

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/friend-connect.git
   cd friend-connect
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Run the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Project Structure

```
friend-connect/
├── app/                  # Next.js App Router
│   ├── dashboard/        # Dashboard pages
│   │   ├── chat/         # Chat feature
│   │   ├── games/        # Games feature
│   │   ├── listen/       # Listen Together feature
│   │   ├── video-call/   # Video Call feature
│   │   └── watch/        # Watch Together feature
│   ├── login/            # Login page
│   ├── signup/           # Signup page
│   ├── globals.css       # Global styles
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Home page
├── components/           # Reusable components
├── lib/                  # Utility functions and hooks
├── public/               # Static assets
├── styles/               # Additional styles
├── next.config.js        # Next.js configuration
├── package.json          # Project dependencies
├── tailwind.config.js    # TailwindCSS configuration
└── tsconfig.json         # TypeScript configuration
```

## Deployment

This application can be deployed on Vercel, Netlify, or any other platform that supports Next.js applications.

```bash
npm run build
# or
yarn build
```

## Future Enhancements

- Implement actual Firebase authentication
- Add real-time database for persistent chat history
- Implement actual WebRTC for video calls
- Add more games and interactive features
- Create mobile apps using React Native

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Next.js team for the amazing framework
- TailwindCSS for the utility-first CSS framework
- All the open-source libraries used in this project "# Friend_Connect" 
