import { useState, useEffect } from 'react';
import {
  onAuthStateChanged,
  signOut as firebaseSignOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from 'firebase/auth';
import { auth } from '../firebase';
import { getCompanyByOwner } from '../firestore';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [company, setCompany] = useState({});
  const [companyId, setCompanyId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      setLoading(true);
      try {
        if (authUser) {
          setUser(authUser);
          const companyDoc = await getCompanyByOwner(authUser.uid);
          if (companyDoc && companyDoc.id) {
            setCompany(companyDoc);
            setCompanyId(companyDoc.id);
          } else {
            setCompany({});
            setCompanyId(null);
          }
        } else {
          setUser(null);
          setCompany({});
          setCompanyId(null);
        }
      } catch (error) {
        console.error("Auth state change error:", error);
        setUser(null);
        setCompany({});
        setCompanyId(null);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const signIn = (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  const register = (email, password) => {
    return createUserWithEmailAndPassword(auth, email, password);
  };

  const signOut = () => {
    return firebaseSignOut(auth);
  };

  return { user, company, companyId, loading, signIn, register, signOut };
};
