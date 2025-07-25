'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { subjects } from '@/data/subjects';
import { getAllSampleQuestions } from '@/data/sampleQuestions';
import { Question } from '@/data/types';

interface DrillConfig {
  subject: string;
  questionCount: number;
  difficulty: 'all' | 'easy' | 'medium' | 'hard';
  tags: string[];
  timeLimit: number; // in minutes, 0 for no limit
}

export default function DrillSetup() {
  const router = useRouter();
  const [config, setConfig] = useState<DrillConfig>({
    subject: 'ap-statistics',
    questionCount: 10,
    difficulty: 'all',
    tags: [],
    timeLimit: 0
  });

  const questions = getAllSampleQuestions();
  const subjectQuestions = questions.filter(q => q.subject === config.subject);
  
  // Get unique tags from questions
  const availableTags = Array.from(new Set(
    subjectQuestions.flatMap(q => q.tags)
  )).sort();

  const handleStartDrill = () => {
    // Filter questions based on config
    let filteredQuestions = subjectQuestions;
    
    if (config.difficulty !== 'all') {
      filteredQuestions = filteredQuestions.filter(q => q.difficulty === config.difficulty);
    }
    
    if (config.tags.length > 0) {
      filteredQuestions = filteredQuestions.filter(q => 
        config.tags.some(tag => q.tags.includes(tag))
      );
    }
    
    // Shuffle and limit questions
    const shuffled = [...filteredQuestions].sort(() => Math.random() - 0.5);
    const selectedQuestions = shuffled.slice(0, config.questionCount);
    
    // Store in session storage
    sessionStorage.setItem('drillQuestions', JSON.stringify(selectedQuestions));
    sessionStorage.setItem('drillConfig', JSON.stringify(config));
    
    // Navigate to practice session
    router.push('/drills/practice');
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Setup Your Practice Drill</h1>
      
      <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
        {/* Subject Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Subject
          </label>
          <div className="grid grid-cols-2 gap-4">
            {subjects.map((subject) => (
              <button
                key={subject.id}
                onClick={() => setConfig({ ...config, subject: subject.id, tags: [] })}
                className={`p-4 rounded-lg border-2 transition-all ${
                  config.subject === subject.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="text-2xl mb-2">{subject.icon}</div>
                <div className="font-semibold">{subject.fullName}</div>
                <div className="text-sm text-gray-600">{subject.description}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Question Count */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Number of Questions
          </label>
          <select
            value={config.questionCount}
            onChange={(e) => setConfig({ ...config, questionCount: parseInt(e.target.value) })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value={5}>5 questions</option>
            <option value={10}>10 questions</option>
            <option value={15}>15 questions</option>
            <option value={20}>20 questions</option>
          </select>
        </div>

        {/* Difficulty */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Difficulty Level
          </label>
          <div className="flex gap-2">
            {['all', 'easy', 'medium', 'hard'].map((level) => (
              <button
                key={level}
                onClick={() => setConfig({ ...config, difficulty: level as any })}
                className={`px-4 py-2 rounded-md capitalize ${
                  config.difficulty === level
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {level}
              </button>
            ))}
          </div>
        </div>

        {/* Tags */}
        {availableTags.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Topics (Optional)
            </label>
            <div className="flex flex-wrap gap-2">
              {availableTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => {
                    const newTags = config.tags.includes(tag)
                      ? config.tags.filter(t => t !== tag)
                      : [...config.tags, tag];
                    setConfig({ ...config, tags: newTags });
                  }}
                  className={`px-3 py-1 rounded-full text-sm ${
                    config.tags.includes(tag)
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Time Limit */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Time Limit
          </label>
          <select
            value={config.timeLimit}
            onChange={(e) => setConfig({ ...config, timeLimit: parseInt(e.target.value) })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value={0}>No time limit</option>
            <option value={15}>15 minutes</option>
            <option value={30}>30 minutes</option>
            <option value={45}>45 minutes</option>
            <option value={60}>60 minutes</option>
          </select>
        </div>

        {/* Start Button */}
        <div className="pt-4">
          <button
            onClick={handleStartDrill}
            disabled={subjectQuestions.length === 0}
            className="w-full bg-blue-500 text-white py-3 rounded-md font-semibold hover:bg-blue-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {subjectQuestions.length === 0 
              ? 'No questions available for this subject'
              : `Start Drill (${Math.min(config.questionCount, subjectQuestions.length)} questions available)`
            }
          </button>
        </div>
      </div>
    </div>
  );
}