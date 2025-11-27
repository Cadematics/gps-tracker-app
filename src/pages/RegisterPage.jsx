import React, { useState } from 'react';
import styles from './RegisterPage.module.css';
import { useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import { createCompany } from '../firestore';
import { serverTimestamp } from 'firebase/firestore';

const RegisterPage = () => {
  const [fullName, setFullName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const { user } = await createUserWithEmailAndPassword(auth, email, password);

      await createCompany(user.uid, {
        companyName: companyName,
        ownerUserId: user.uid,
        adminFullName: fullName,
        email: email,
        createdAt: serverTimestamp(),
      });

      navigate('/live');
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div className={styles.registerPage}>
      <form className={styles.registerForm} onSubmit={handleRegister}>
        <h2>Register Company</h2>
        {error && <p className={styles.error}>{error}</p>}
        <input
          type="text"
          placeholder="Full Name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Company Name"
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Register</button>
      </form>
    </div>
  );
};

export default RegisterPage;
