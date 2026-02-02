import React, { useState } from 'react';
import styles from './RegisterPage.module.css';
import { useNavigate, Link } from 'react-router-dom';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import { createCompany } from '../firestore';

const RegisterPage = () => {
  const [companyName, setCompanyName] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError(null);
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    try {
      const { user } = await createUserWithEmailAndPassword(auth, email, password);

      // The createCompany function now handles createdAt and updatedAt automatically.
      await createCompany(user.uid, {
        companyName: companyName,
        ownerUserId: user.uid,
        adminFullName: fullName,
        email: email,
        phoneNumber: phoneNumber,
      });

      navigate('/dashboard/live');
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div className={styles.registerPage}>
      <div className={styles.registerCard}>
        <div className={styles.header}>
          <h1>Create Your Company Account</h1>
          <p>Register your organization and main admin user</p>
        </div>

        {error && <p className={styles.error}>{error}</p>}

        <form className={styles.registerForm} onSubmit={handleRegister}>
          <div className={styles.formSection}>
            <h2>Company Info</h2>
            <input
              type="text"
              placeholder="Company Name"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              required
            />
          </div>

          <div className={styles.formSection}>
            <h2>User Info</h2>
            <input
              type="text"
              placeholder="Full Name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
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
              type="tel"
              placeholder="Phone Number"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit">Create Account</button>
        </form>

        <div className={styles.loginLink}>
          <p>
            Already have an account? <Link to="/login">Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
