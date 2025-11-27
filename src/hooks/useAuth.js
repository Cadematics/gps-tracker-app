import { useState, useEffect } from 'react';
import { onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
import { auth } from '../firebase';
import { getCompanyByOwner } from '../firestore';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [company, setCompany] = useState(null);
  const [companyId, setCompanyId] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      if (authUser) {
        setUser(authUser);
        const companyDoc = await getCompanyByOwner(authUser.uid);
        if (companyDoc) {
          setCompany(companyDoc);
          setCompanyId(companyDoc.id);
        }
      } else {
        setUser(null);
        setCompany(null);
        setCompanyId(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signOut = async () => {
    await firebaseSignOut(auth);
  };

  return { user, company, setCompany, companyId, loading, signOut };
};
