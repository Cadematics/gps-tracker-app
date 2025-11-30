import React, { useState, useEffect, useRef } from 'react';
import styles from './Navbar.module.css';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, signOut, company, loading } = useAuth();
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const handleLogout = async () => {
    await signOut();
    setIsDropdownOpen(false);
  };

  const handleProfileNavigation = () => {
    navigate('/dashboard/profile');
    setIsDropdownOpen(false);
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);

  return (
    <nav className={styles.navbar}>
      <div className={styles.navContainer}>
        <div className={styles.logo}>
          <Link to="/">traK</Link>
        </div>
        <div className={styles.navLinks}>
          {loading ? (
            <span>Loading...</span>
          ) : user ? (
            <>
              <Link to="/dashboard/live">Live</Link>
              <Link to="/dashboard/devices">Devices</Link>
              <Link to="/dashboard/history">History</Link>
              <Link to="/dashboard/geofencing">Geofencing</Link>
              <Link to="/dashboard/reports">Reports</Link>
              <div className={styles.userMenu} ref={dropdownRef}>
                <img
                  src={company?.companyLogoUrl || user.photoURL || `https://avatar.vercel.sh/${user.uid}.png`}
                  alt={company?.companyLogoUrl ? "Company Logo" : "User Avatar"}
                  className={styles.userAvatar}
                  onClick={toggleDropdown}
                />
                <span className={styles.companyName}>
                  {company?.companyName || 'No Company'}
                </span>
                {isDropdownOpen && (
                  <div className={styles.dropdown}>
                    <button onClick={handleProfileNavigation}>Profile</button>
                    <button onClick={handleLogout}>Logout</button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link to="/login">Login</Link>
              <Link to="/register" className={styles.registerButton}>
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
