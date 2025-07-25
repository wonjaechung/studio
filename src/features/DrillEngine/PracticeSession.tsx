'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Question } from '@/data/types';
import { ChevronLeft, ChevronRight, Clock, CheckCircle, XCircle } from 'lucide-react';

interface SessionState {
  currentQuestionIndex: number;
  answers: Record<string, string>;
  startTime: number;
  questionTimes: Record<string, number>;
  submitted: boolean;
}

export default function PracticeSession() {
  const router = useRouter();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [config, setConfig] = useState<any>(null);
  const [sessionState, setSessionState] = useState<SessionState>({
    currentQuestionIndex: 0,
    answers: {},
    startTime: Date.now(),
    questionTimes: {},
    submitted: false
  });
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);

  useEffect(() => {
    // Load questions and config from session storage
    const storedQuestions = sessionStorage.getItem('drillQuestions');
    const storedConfig = sessionStorage.getItem('drillConfig');
    
    if (!storedQuestions || !storedConfig) {
      router.push('/drills');
      return;
    }
    
    setQuestions(JSON.parse(storedQuestions));
    setConfig(JSON.parse(storedConfig));
  }, [router]);

  useEffect(() => {
    // Timer logic
    if (!config || config.timeLimit === 0 || sessionState.submitted) return;
    
    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - sessionState.startTime) / 1000);
      const remaining = config.timeLimit * 60 - elapsed;
      
      if (remaining <= 0) {
        handleSubmit();
      } else {
        setTimeLeft(remaining);
      }
    }, 1000);
    
    return () => clearInterval(interval);
  }, [config, sessionState.startTime, sessionState.submitted]);

  const currentQuestion = questions[sessionState.currentQuestionIndex];
  
  const handleAnswerSelect = (answer: string) => {
    if (sessionState.submitted) return;
    
    setSessionState(prev => ({
      ...prev,
      answers: {
        ...prev.answers,
        [currentQuestion.id]: answer
      }
    }));
  };

  const handleNext = () => {
    if (sessionState.currentQuestionIndex < questions.length - 1) {
      setSessionState(prev => ({
        ...prev,
        currentQuestionIndex: prev.currentQuestionIndex + 1
      }));
      setShowExplanation(false);
    }
  };

  const handlePrevious = () => {
    if (sessionState.currentQuestionIndex > 0) {
      setSessionState(prev => ({
        ...prev,
        currentQuestionIndex: prev.currentQuestionIndex - 1
      }));
      setShowExplanation(false);
    }
  };

  const handleSubmit = () => {
    setSessionState(prev => ({
      ...prev,
      submitted: true
    }));
  };

  const calculateResults = () => {
    let correct = 0;
    questions.forEach(q => {
      if (sessionState.answers[q.id] === q.correctAnswer) {
        correct++;
      }
    });
    return {
      correct,
      total: questions.length,
      percentage: Math.round((correct / questions.length) * 100)
    };
  };

  if (!currentQuestion) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <span className="text-lg font-semibold">
              Question {sessionState.currentQuestionIndex + 1} of {questions.length}
            </span>
            {timeLeft !== null && (
              <div className="flex items-center gap-2 text-gray-600">
                <Clock className="w-4 h-4" />
                <span>{formatTime(timeLeft)}</span>
              </div>
            )}
          </div>
          {!sessionState.submitted && (
            <button
              onClick={handleSubmit}
              className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition-colors"
            >
              Submit Drill
            </button>
          )}
        </div>
        
        {/* Progress bar */}
        <div className="mt-4 bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((sessionState.currentQuestionIndex + 1) / questions.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Question */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="mb-6">
          <p className="text-lg leading-relaxed">{currentQuestion.text}</p>
        </div>

        {/* Answer Options */}
        <div className="space-y-3">
          {Object.entries(currentQuestion.options).map(([key, value]) => {
            const isSelected = sessionState.answers[currentQuestion.id] === key;
            const isCorrect = key === currentQuestion.correctAnswer;
            const showResult = sessionState.submitted;
            
            return (
              <button
                key={key}
                onClick={() => handleAnswerSelect(key)}
                disabled={sessionState.submitted}
                className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                  showResult && isCorrect
                    ? 'border-green-500 bg-green-50'
                    : showResult && isSelected && !isCorrect
                    ? 'border-red-500 bg-red-50'
                    : isSelected
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                } ${sessionState.submitted ? 'cursor-default' : 'cursor-pointer'}`}
              >
                <div className="flex items-start gap-3">
                  <span className="font-semibold">{key}.</span>
                  <span className="flex-1">{value}</span>
                  {showResult && isCorrect && (
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  )}
                  {showResult && isSelected && !isCorrect && (
                    <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Explanation */}
        {sessionState.submitted && (
          <div className="mt-6">
            <button
              onClick={() => setShowExplanation(!showExplanation)}
              className="text-blue-500 hover:text-blue-600 font-medium"
            >
              {showExplanation ? 'Hide' : 'Show'} Explanation
            </button>
            
            {showExplanation && currentQuestion.explanation?.en && (
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                {currentQuestion.explanation.en.steps && (
                  <ol className="list-decimal list-inside space-y-2">
                    {currentQuestion.explanation.en.steps.map((step, idx) => (
                      <li key={idx}>{step}</li>
                    ))}
                  </ol>
                )}
                {currentQuestion.explanation.en.summary && (
                  <p className="mt-3 font-medium text-blue-800">
                    {currentQuestion.explanation.en.summary}
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex justify-between items-center">
        <button
          onClick={handlePrevious}
          disabled={sessionState.currentQuestionIndex === 0}
          className="flex items-center gap-2 px-4 py-2 rounded-md bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="w-4 h-4" />
          Previous
        </button>

        {/* Question Navigator */}
        <div className="flex gap-2">
          {questions.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setSessionState(prev => ({ ...prev, currentQuestionIndex: idx }))}
              className={`w-8 h-8 rounded-full text-sm font-medium ${
                idx === sessionState.currentQuestionIndex
                  ? 'bg-blue-500 text-white'
                  : sessionState.answers[questions[idx].id]
                  ? 'bg-gray-300'
                  : 'bg-gray-100'
              }`}
            >
              {idx + 1}
            </button>
          ))}
        </div>

        <button
          onClick={handleNext}
          disabled={sessionState.currentQuestionIndex === questions.length - 1}
          className="flex items-center gap-2 px-4 py-2 rounded-md bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Results Summary */}
      {sessionState.submitted && (
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold mb-4">Results</h2>
          {(() => {
            const results = calculateResults();
            return (
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-4xl font-bold text-blue-500">
                    {results.percentage}%
                  </div>
                  <div className="text-gray-600">
                    {results.correct} out of {results.total} correct
                  </div>
                </div>
                <div className="flex gap-4 justify-center">
                  <button
                    onClick={() => router.push('/drills')}
                    className="px-6 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
                  >
                    New Drill
                  </button>
                  <button
                    onClick={() => router.push('/')}
                    className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                  >
                    Back to Dashboard
                  </button>
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}