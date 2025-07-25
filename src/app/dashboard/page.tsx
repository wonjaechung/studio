'use client';

import React from 'react';
import Link from 'next/link';
import { BookOpen, Brain, FileText, Calculator, BarChart3, Gamepad2 } from 'lucide-react';

export default function Dashboard() {
  const features = [
    {
      title: 'Practice Drills',
      description: 'Test your knowledge with AP Statistics and Economics questions',
      icon: <Brain className="w-8 h-8" />,
      href: '/drills',
      color: 'bg-blue-500'
    },
    {
      title: 'Study Notes',
      description: 'Create and manage your study notes with rich text editor',
      icon: <FileText className="w-8 h-8" />,
      href: '/notes',
      color: 'bg-green-500'
    },
    {
      title: 'Resources',
      description: 'Access educational content, videos, and interactive materials',
      icon: <BookOpen className="w-8 h-8" />,
      href: '/resources',
      color: 'bg-purple-500'
    },
    {
      title: 'Statistics Lab',
      description: 'Interactive calculator, spreadsheet, and graphing tools',
      icon: <Calculator className="w-8 h-8" />,
      href: '/',
      color: 'bg-orange-500'
    },
    {
      title: 'Data Visualization',
      description: 'Create and analyze statistical charts and graphs',
      icon: <BarChart3 className="w-8 h-8" />,
      href: '/',
      color: 'bg-indigo-500'
    },
    {
      title: 'Game Mode',
      description: 'Learn statistics through interactive games',
      icon: <Gamepad2 className="w-8 h-8" />,
      href: '/',
      color: 'bg-pink-500'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        <header className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            AP Statistics & Economics Learning Platform
          </h1>
          <p className="text-xl text-gray-600">
            Your comprehensive toolkit for mastering AP Statistics and Economics
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => (
            <Link
              key={feature.title}
              href={feature.href}
              className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 block"
            >
              <div className={`${feature.color} text-white w-16 h-16 rounded-lg flex items-center justify-center mb-4`}>
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </Link>
          ))}
        </div>

        <div className="mt-12 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold mb-4">Getting Started</h2>
          <div className="space-y-4 text-gray-700">
            <p>
              Welcome to your comprehensive AP learning platform! Here's how to make the most of it:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>
                <strong>Practice Drills:</strong> Start with practice questions to test your understanding. 
                Choose your subject, difficulty level, and number of questions.
              </li>
              <li>
                <strong>Study Notes:</strong> Create organized notes for each subject. 
                Use the rich text editor to format your notes with highlights, lists, and more.
              </li>
              <li>
                <strong>Resources:</strong> Browse through curated educational content including videos, 
                documents, and interactive materials.
              </li>
              <li>
                <strong>Statistics Lab:</strong> Use the integrated calculator, spreadsheet, and graphing 
                tools for hands-on practice with data analysis.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}