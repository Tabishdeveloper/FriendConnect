'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function Dashboard() {
  const [friendOnline, setFriendOnline] = useState(false);
  
  // In a real app, this would be fetched from an API
  const recentActivities = [
    { id: 1, type: 'chat', message: 'New message from Friend', time: '5 minutes ago' },
    { id: 2, type: 'watch', message: 'Friend suggested "Inception" to watch', time: '2 hours ago' },
    { id: 3, type: 'listen', message: 'Friend shared a playlist with you', time: 'Yesterday' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
      <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Dashboard</h1>
      
      <div className="py-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Friend Status Card */}
          <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-12 w-12 rounded-full bg-gray-100 dark:bg-gray-700 overflow-hidden">
                    <svg className="h-full w-full text-gray-300 dark:text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Friend</dt>
                    <dd>
                      <div className="flex items-center">
                        <div className={`h-2.5 w-2.5 rounded-full ${friendOnline ? 'bg-green-400' : 'bg-gray-400'} mr-2`}></div>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {friendOnline ? 'Online' : 'Offline'}
                        </span>
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 px-5 py-3">
              <div className="text-sm">
                <Link href="/dashboard/chat" className="font-medium text-primary-600 hover:text-primary-500">
                  Send a message
                </Link>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">Quick Actions</h3>
              <div className="mt-4 grid grid-cols-2 gap-2">
                <Link 
                  href="/dashboard/video-call" 
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  <span className="mr-2">📹</span> Video Call
                </Link>
                <Link 
                  href="/dashboard/chat" 
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  <span className="mr-2">💬</span> Chat
                </Link>
                <Link 
                  href="/dashboard/watch" 
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  <span className="mr-2">🎬</span> Watch
                </Link>
                <Link 
                  href="/dashboard/listen" 
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  <span className="mr-2">🎵</span> Listen
                </Link>
              </div>
            </div>
          </div>

          {/* Recent Activities */}
          <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg sm:col-span-2">
            <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">Recent Activities</h3>
            </div>
            <div className="px-5 py-3">
              <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                {recentActivities.map((activity) => (
                  <li key={activity.id} className="py-3">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        {activity.type === 'chat' && <span className="text-2xl">💬</span>}
                        {activity.type === 'watch' && <span className="text-2xl">🎬</span>}
                        {activity.type === 'listen' && <span className="text-2xl">🎵</span>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {activity.message}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                          {activity.time}
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 px-5 py-3">
              <div className="text-sm">
                <a href="#" className="font-medium text-primary-600 hover:text-primary-500">
                  View all activities
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="mt-8">
          <h2 className="text-lg leading-6 font-medium text-gray-900 dark:text-white mb-4">Upcoming Events</h2>
          <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
              <li>
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 text-2xl">🎬</div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-primary-600 dark:text-primary-400">
                          Movie Night
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Watching "The Matrix" together
                        </p>
                      </div>
                    </div>
                    <div className="ml-2 flex-shrink-0 flex">
                      <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100">
                        Tomorrow, 8:00 PM
                      </p>
                    </div>
                  </div>
                </div>
              </li>
              <li>
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 text-2xl">🎮</div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-primary-600 dark:text-primary-400">
                          Gaming Session
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Playing chess together
                        </p>
                      </div>
                    </div>
                    <div className="ml-2 flex-shrink-0 flex">
                      <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100">
                        Saturday, 3:00 PM
                      </p>
                    </div>
                  </div>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
} 