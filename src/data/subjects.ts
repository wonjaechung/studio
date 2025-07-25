import { Subject } from './types';

export const subjects: Subject[] = [
  {
    id: 'ap-economics',
    name: 'AP Econ',
    fullName: 'AP Economics',
    description: 'Microeconomics and Macroeconomics',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    icon: '📊'
  },
  {
    id: 'ap-statistics',
    name: 'AP Stats',
    fullName: 'AP Statistics',
    description: 'Statistical analysis and probability',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    icon: '📈'
  }
];

export const getSubjectById = (id: string): Subject | undefined => {
  return subjects.find(subject => subject.id === id);
};

export const getSubjectByName = (name: string): Subject | undefined => {
  return subjects.find(subject => 
    subject.name.toLowerCase() === name.toLowerCase() ||
    subject.fullName.toLowerCase() === name.toLowerCase()
  );
};