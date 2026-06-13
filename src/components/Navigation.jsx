import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import logo from '../assets/logo.png';
import title from '../assets/title.jpeg';

const Navigation = () => {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  return (
    <nav className="navigation">
      <div className="nav-container">
        <div className="nav-brand">
          <Link to="/" className="logo-link" onClick={closeMenu}>
            <img src={logo} alt="Travel Website Logo" className="nav-logo" />
            <img src={title} alt="Travel Website Title" className="nav-title" />
          </Link>
        </div>

        {/* Mobile menu button */}
        <button className="mobile-menu-btn" onClick={toggleMenu}>
          <span className={`hamburger ${isMenuOpen ? 'open' : ''}`}></span>
        </button>

        {/* Navigation links */}
        <ul className={`nav-links ${isMenuOpen ? 'open' : ''}`}>
          <li className={location.pathname === '/' ? 'active' : ''}>
            <Link to="/" onClick={closeMenu}>Upcoming Trips</Link>
          </li>
          
          <li className={location.pathname === '/previous' ? 'active' : ''}>
            <Link to="/previous" onClick={closeMenu}>Previous Events</Link>
          </li>

          <li className={location.pathname === '/about' ? 'active' : ''}>
            <Link to="/about" onClick={closeMenu}>About Us</Link>
          </li>

          <li className={location.pathname === '/contact' ? 'active' : ''}>
            <Link to="/contact" onClick={closeMenu}>Contact</Link>
          </li>


        </ul>

      </div>
    </nav>
  );
};

export default Navigation;
