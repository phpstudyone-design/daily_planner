import React from 'react';
import { Link, useLocation } from 'react-router-dom';

function Navbar() {
  const location = useLocation();
  const links = [
    { path: '/', label: '\u4eca\u65e5\u4efb\u52a1' },
    { path: '/dashboard', label: '\u6570\u636e\u770b\u677f' },
    { path: '/admin', label: '\u7ba1\u7406\u9875\u9762' },
  ];

  return (
    <nav className="navbar">
      <Link to="/" className="logo">{'📋'} Daily Planner</Link>
      <div className="nav-links">
        {links.map((link) => (
          <Link
            key={link.path}
            to={link.path}
            className={location.pathname === link.path ? 'active' : ''}
          >
            {link.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}

export default Navbar;
