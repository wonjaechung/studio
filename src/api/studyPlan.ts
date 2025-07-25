import { db } from '@/lib/firebase';
import { collection, doc, getDoc, setDoc, updateDoc, query, where, getDocs, Timestamp } from 'firebase/firestore';

export interface StudyNote {
  id?: string;
  userId: string;
  title: string;
  content: string;
  subject: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  attachments?: {
    type: 'image' | 'drawing';
    url: string;
    name: string;
  }[];
}

export async function saveStudyNote(note: StudyNote) {
  try {
    const noteData = {
      ...note,
      createdAt: note.createdAt ? Timestamp.fromDate(note.createdAt) : Timestamp.now(),
      updatedAt: Timestamp.now()
    };

    if (note.id) {
      // Update existing note
      await updateDoc(doc(db, 'studyNotes', note.id), noteData);
      return note.id;
    } else {
      // Create new note
      const docRef = doc(collection(db, 'studyNotes'));
      await setDoc(docRef, noteData);
      return docRef.id;
    }
  } catch (error) {
    console.error('Error saving study note:', error);
    throw error;
  }
}

export async function getStudyNotes(userId: string, subject?: string) {
  try {
    let q;
    if (subject) {
      q = query(
        collection(db, 'studyNotes'),
        where('userId', '==', userId),
        where('subject', '==', subject)
      );
    } else {
      q = query(
        collection(db, 'studyNotes'),
        where('userId', '==', userId)
      );
    }

    const querySnapshot = await getDocs(q);
    const notes: StudyNote[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      notes.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate()
      } as StudyNote);
    });

    return notes.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
  } catch (error) {
    console.error('Error getting study notes:', error);
    throw error;
  }
}

export async function getStudyNote(noteId: string) {
  try {
    const docRef = doc(db, 'studyNotes', noteId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate()
      } as StudyNote;
    } else {
      throw new Error('Note not found');
    }
  } catch (error) {
    console.error('Error getting study note:', error);
    throw error;
  }
}