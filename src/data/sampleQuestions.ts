import { Question } from './types';

export const sampleStatsQuestions: Question[] = [
  {
    id: 'stats-2024-1',
    subject: 'ap-statistics',
    year: 2024,
    questionNumber: 1,
    text: 'A researcher wants to estimate the average height of students at a university. Which of the following sampling methods would be most appropriate to obtain a representative sample?',
    options: {
      A: 'Select every 10th student entering the library',
      B: 'Randomly select students from a complete list of all enrolled students',
      C: 'Survey all students in the basketball team',
      D: 'Ask for volunteers to participate in the study',
      E: 'Select students from the freshman class only'
    },
    correctAnswer: 'B',
    difficulty: 'easy',
    tags: ['sampling', 'study-design'],
    explanation: {
      en: {
        steps: [
          'A representative sample should give every student an equal chance of being selected.',
          'Simple random sampling from a complete list ensures this equal probability.',
          'Other methods introduce bias: library users (A), athletes (C), volunteers (D), or freshmen (E) may not represent the entire population.'
        ],
        summary: 'Simple random sampling from a complete population list is the most appropriate method for obtaining a representative sample.'
      }
    }
  },
  {
    id: 'stats-2024-2',
    subject: 'ap-statistics',
    year: 2024,
    questionNumber: 2,
    text: 'The five-number summary for a dataset is: Min = 12, Q1 = 25, Median = 35, Q3 = 48, Max = 92. Which value is most likely an outlier?',
    options: {
      A: '12',
      B: '25',
      C: '35',
      D: '48',
      E: '92'
    },
    correctAnswer: 'E',
    difficulty: 'medium',
    tags: ['descriptive-statistics', 'outliers'],
    explanation: {
      en: {
        steps: [
          'Calculate IQR = Q3 - Q1 = 48 - 25 = 23',
          'Upper fence = Q3 + 1.5 × IQR = 48 + 1.5 × 23 = 48 + 34.5 = 82.5',
          'Lower fence = Q1 - 1.5 × IQR = 25 - 1.5 × 23 = 25 - 34.5 = -9.5',
          'Since 92 > 82.5, it is an outlier. 12 > -9.5, so it is not an outlier.'
        ],
        summary: 'Using the 1.5 × IQR rule, 92 exceeds the upper fence of 82.5, making it an outlier.'
      }
    }
  }
];

export const sampleEconQuestions: Question[] = [
  {
    id: 'econ-2024-1',
    subject: 'ap-economics',
    year: 2024,
    questionNumber: 1,
    text: 'If the demand for a good is price inelastic, an increase in price will result in:',
    options: {
      A: 'A proportionally larger decrease in quantity demanded',
      B: 'A proportionally smaller decrease in quantity demanded',
      C: 'No change in quantity demanded',
      D: 'An increase in quantity demanded',
      E: 'A shift in the demand curve'
    },
    correctAnswer: 'B',
    difficulty: 'medium',
    tags: ['elasticity', 'microeconomics'],
    explanation: {
      en: {
        steps: [
          'Price inelastic demand means |Ed| < 1',
          'This indicates that the percentage change in quantity demanded is less than the percentage change in price',
          'When price increases, quantity demanded decreases, but by a smaller proportion'
        ],
        summary: 'With inelastic demand, quantity demanded changes by a smaller percentage than the price change.'
      }
    }
  }
];

export const getAllSampleQuestions = (): Question[] => {
  return [...sampleStatsQuestions, ...sampleEconQuestions];
};