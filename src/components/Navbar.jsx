import React from 'react';
import styles from './Navbar.module.css';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, signOut, company } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
  };
  
  const handleProfileNavigation = () => {
      navigate('/dashboard/profile');
  }

  return (
    <nav className={styles.navbar}>
      <div className={styles.navContainer}>
        <div className={styles.logo}>
          <Link to="/">traK</Link>
        </div>
        <div className={styles.navLinks}>
          {user ? (
            <div className={styles.userMenu}>
              <img 
                src={user.photoURL || `https://avatar.vercel.sh/${user.uid}.png`} 
                alt="Company Logo" 
                className={styles.userAvatar}
              />
              <span className={styles.companyName}>{company?.name}</span>
              <div className={styles.dropdown}>
                <button onClick={handleProfileNavigation}>Profile</button>
                <button onClick={handleLogout}>Logout</button>
              </div>
            </div>
          ) : (
            <>
              <Link to="/login">Login</Link>
              <Link to="/register" className={styles.registerButton}>Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
