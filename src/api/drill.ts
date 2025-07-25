import { db } from '@/lib/firebase';
import { collection, addDoc, query, where, orderBy, getDocs, Timestamp } from 'firebase/firestore';

export interface DrillResult {
  userId: string;
  subject: string;
  totalQuestions: number;
  correctAnswers: number;
  timeSpent: number;
  completedAt: Date;
  questionResults: {
    questionId: string;
    isCorrect: boolean;
    selectedAnswer: string;
    timeSpent: number;
  }[];
}

export async function saveDrillResult(result: DrillResult) {
  try {
    const docRef = await addDoc(collection(db, 'drillResults'), {
      ...result,
      completedAt: Timestamp.fromDate(result.completedAt)
    });
    return docRef.id;
  } catch (error) {
    console.error('Error saving drill result:', error);
    throw error;
  }
}

export async function getDrillResults(userId: string, subject?: string) {
  try {
    let q;
    if (subject) {
      q = query(
        collection(db, 'drillResults'),
        where('userId', '==', userId),
        where('subject', '==', subject),
        orderBy('completedAt', 'desc')
      );
    } else {
      q = query(
        collection(db, 'drillResults'),
        where('userId', '==', userId),
        orderBy('completedAt', 'desc')
      );
    }
    
    const querySnapshot = await getDocs(q);
    const results: DrillResult[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      results.push({
        ...data,
        completedAt: data.completedAt.toDate()
      } as DrillResult);
    });
    
    return results;
  } catch (error) {
    console.error('Error getting drill results:', error);
    throw error;
  }
}