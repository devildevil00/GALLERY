import React, { useState, useEffect, useRef } from 'react';
import './Navbar.css';

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const mainNavRef = useRef(null);
  const menuToggleRef = useRef(null);

  

  const toggleMenu = () => {
    setMenuOpen((prev) => !prev);
  };

  // Close menu if clicking outside nav on mobile
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        mainNavRef.current &&
        !mainNavRef.current.contains(event.target) &&
        menuToggleRef.current &&
        !menuToggleRef.current.contains(event.target) &&
        menuOpen
      ) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [menuOpen]);

  // Close menu when a nav item is clicked (for better mobile UX)
  const handleNavItemClick = () => {
    if (menuOpen) {
      setMenuOpen(false);
    }
  };

  

  return (
    <>
      <header>
        <div className="logo">
          <span className="blue">GAL</span>
          <strong>LERY</strong>
          <span className="blue">view</span>
          <strong>.su</strong>
        </div>
        <button
          aria-label="Toggle menu"
          className="menu-toggle"
          aria-expanded={menuOpen}
          aria-controls="mainNav"
          onClick={toggleMenu}
          ref={menuToggleRef}
          type="button"
        >
          {/* Hamburger icon using SVG */}
          <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
          <span className="sr-only">Menu</span>
        </button>
        <nav
          id="mainNav"
          aria-label="Primary navigation"
          className={menuOpen ? 'open' : ''}
          ref={mainNavRef}
        >
          <div>LocalImg</div>
          <div>GDImg</div>
          <div>
            More <i className="fas fa-chevron-down dropdown-arrow" aria-hidden="true"></i>
          </div>
          <div>
            English <i className="fas fa-chevron-down dropdown-arrow" aria-hidden="true"></i>
          </div>
          <button className="btn-share" type="button" >
            Share
          </button>
        </nav>
      </header>
      
      
    </>
  );
};

export default Navbar;
