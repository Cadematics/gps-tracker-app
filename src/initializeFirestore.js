import { collection, addDoc } from 'firebase/firestore';
import { db } from './firebase';

const initializeFirestore = async () => {
  try {
    // Create a dummy document in each collection to ensure they are created
    await addDoc(collection(db, 'companies'), { name: 'dummy company' });
    await addDoc(collection(db, 'users'), { name: 'dummy user' });
    await addDoc(collection(db, 'devices'), { name: 'dummy device' });
    console.log('Firestore collections created successfully');
  } catch (error) {
    console.error('Error creating Firestore collections:', error);
  }
};

initializeFirestore();
