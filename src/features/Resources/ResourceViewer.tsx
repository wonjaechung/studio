'use client';

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, BookOpen, Video, FileText, Gamepad2 } from 'lucide-react';
import { Resource } from '@/data/types';

// Sample resources data
const sampleResources: Resource[] = [
  {
    id: 'res-1',
    subject: 'ap-statistics',
    title: 'Introduction to Descriptive Statistics',
    description: 'Learn the basics of descriptive statistics including measures of center and spread',
    type: 'interactive',
    difficulty: 'beginner',
    tags: ['descriptive-statistics', 'mean', 'median', 'standard-deviation'],
    content: {
      sections: [
        {
          type: 'text',
          content: 'Descriptive statistics help us summarize and understand data. The main measures include:'
        },
        {
          type: 'list',
          items: [
            'Measures of Center: Mean, Median, Mode',
            'Measures of Spread: Range, IQR, Standard Deviation',
            'Measures of Position: Percentiles, Quartiles, Z-scores'
          ]
        },
        {
          type: 'interactive',
          content: 'Try calculating the mean of: 2, 4, 6, 8, 10'
        }
      ]
    }
  },
  {
    id: 'res-2',
    subject: 'ap-economics',
    title: 'Supply and Demand Basics',
    description: 'Understanding the fundamental concepts of supply and demand curves',
    type: 'video',
    url: 'https://example.com/video',
    duration: '15:30',
    difficulty: 'beginner',
    tags: ['microeconomics', 'supply', 'demand'],
    thumbnail: '/api/placeholder/400/225'
  },
  {
    id: 'res-3',
    subject: 'ap-statistics',
    title: 'Probability Distributions',
    description: 'Explore different types of probability distributions',
    type: 'document',
    difficulty: 'intermediate',
    tags: ['probability', 'distributions', 'normal', 'binomial']
  }
];

export default function ResourceViewer() {
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
  const [filter, setFilter] = useState({
    subject: 'all',
    type: 'all',
    difficulty: 'all'
  });

  const filteredResources = sampleResources.filter(resource => {
    if (filter.subject !== 'all' && resource.subject !== filter.subject) return false;
    if (filter.type !== 'all' && resource.type !== filter.type) return false;
    if (filter.difficulty !== 'all' && resource.difficulty !== filter.difficulty) return false;
    return true;
  });

  const getTypeIcon = (type: Resource['type']) => {
    switch (type) {
      case 'video': return <Video className="w-5 h-5" />;
      case 'document': return <FileText className="w-5 h-5" />;
      case 'interactive': return <Gamepad2 className="w-5 h-5" />;
      default: return <BookOpen className="w-5 h-5" />;
    }
  };

  const getDifficultyColor = (difficulty?: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Resource Library</h1>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
            <select
              value={filter.subject}
              onChange={(e) => setFilter({ ...filter, subject: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Subjects</option>
              <option value="ap-statistics">AP Statistics</option>
              <option value="ap-economics">AP Economics</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
            <select
              value={filter.type}
              onChange={(e) => setFilter({ ...filter, type: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Types</option>
              <option value="video">Video</option>
              <option value="document">Document</option>
              <option value="interactive">Interactive</option>
              <option value="webtoon">Webtoon</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty</label>
            <select
              value={filter.difficulty}
              onChange={(e) => setFilter({ ...filter, difficulty: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Levels</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>
        </div>
      </div>

      {/* Resource Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredResources.map((resource) => (
          <div
            key={resource.id}
            onClick={() => setSelectedResource(resource)}
            className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
          >
            {resource.thumbnail ? (
              <img
                src={resource.thumbnail}
                alt={resource.title}
                className="w-full h-48 object-cover"
              />
            ) : (
              <div className="w-full h-48 bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                {getTypeIcon(resource.type)}
              </div>
            )}
            
            <div className="p-4">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-lg">{resource.title}</h3>
                {getTypeIcon(resource.type)}
              </div>
              
              <p className="text-gray-600 text-sm mb-3">{resource.description}</p>
              
              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  {resource.difficulty && (
                    <span className={`text-xs px-2 py-1 rounded ${getDifficultyColor(resource.difficulty)}`}>
                      {resource.difficulty}
                    </span>
                  )}
                  {resource.duration && (
                    <span className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-800">
                      {resource.duration}
                    </span>
                  )}
                </div>
              </div>
              
              {resource.tags.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1">
                  {resource.tags.slice(0, 3).map((tag) => (
                    <span key={tag} className="text-xs bg-gray-100 px-2 py-1 rounded">
                      {tag}
                    </span>
                  ))}
                  {resource.tags.length > 3 && (
                    <span className="text-xs text-gray-500">+{resource.tags.length - 3} more</span>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Resource Modal */}
      {selectedResource && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold mb-2">{selectedResource.title}</h2>
                  <p className="text-gray-600">{selectedResource.description}</p>
                </div>
                <button
                  onClick={() => setSelectedResource(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
              {selectedResource.type === 'video' && selectedResource.url && (
                <div className="aspect-video bg-gray-200 rounded-lg flex items-center justify-center">
                  <p className="text-gray-500">Video player would go here</p>
                </div>
              )}
              
              {selectedResource.type === 'interactive' && selectedResource.content && (
                <div className="space-y-4">
                  {selectedResource.content.sections.map((section: any, idx: number) => (
                    <div key={idx}>
                      {section.type === 'text' && (
                        <p className="text-gray-700">{section.content}</p>
                      )}
                      {section.type === 'list' && (
                        <ul className="list-disc list-inside space-y-1">
                          {section.items.map((item: string, i: number) => (
                            <li key={i} className="text-gray-700">{item}</li>
                          ))}
                        </ul>
                      )}
                      {section.type === 'interactive' && (
                        <div className="bg-blue-50 p-4 rounded-lg">
                          <p className="text-blue-800 font-medium">{section.content}</p>
                          <input
                            type="text"
                            placeholder="Your answer..."
                            className="mt-2 w-full px-3 py-2 border border-blue-300 rounded-md"
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
              
              {selectedResource.type === 'document' && (
                <div className="prose max-w-none">
                  <p className="text-gray-600">Document content would be displayed here...</p>
                </div>
              )}
              
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex flex-wrap gap-2">
                  {selectedResource.tags.map((tag) => (
                    <span key={tag} className="text-sm bg-gray-100 px-3 py-1 rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}