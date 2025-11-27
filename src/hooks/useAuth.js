import { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase';
import { getCompanyByOwner } from '../firestore';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [company, setCompany] = useState({});
  const [companyId, setCompanyId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
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
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  return { user, company, companyId, loading };
};
