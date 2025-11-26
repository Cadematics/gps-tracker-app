import { useState, useEffect } from 'react';
import { onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
import { auth } from '../firebase';
import { getUserById, getCompanyByOwner } from '../firestore';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [company, setCompany] = useState(null);
  const [companyId, setCompanyId] = useState(null);
  const [role, setRole] = useState(null);
  const [fullName, setFullName] = useState(null);
  const [companyName, setCompanyName] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      if (authUser) {
        const userDoc = await getUserById(authUser.uid);
        if (userDoc) {
          setUser(authUser);
          setRole(userDoc.role);
          setFullName(userDoc.fullName);
          const companyDoc = await getCompanyByOwner(authUser.uid);
          if (companyDoc) {
            setCompany(companyDoc);
            setCompanyId(companyDoc.id);
            setCompanyName(companyDoc.companyName);
          }
        } else {
          setUser(authUser);
        }
      } else {
        setUser(null);
        setCompany(null);
        setCompanyId(null);
        setRole(null);
        setFullName(null);
        setCompanyName(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signOut = async () => {
    await firebaseSignOut(auth);
  };

  return { user, loading, signOut, company, companyId, role, fullName, companyName };
};
