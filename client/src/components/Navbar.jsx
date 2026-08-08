import React from 'react';
import { Link, useLocation } from 'react-router-dom';

function Navbar() {
  const location = useLocation();
  const links = [
    { path: '/', label: '\u{1F4CB} 今日任务' },
    { path: '/counter', label: '\u{1F522} 计数器' },
    { path: '/stopwatch', label: '\u{23F1} 秒表' },
    { path: '/dashboard', label: '\u{1F4CA} 数据看板' },
    { path: '/admin', label: '\u{1F527} 管理页面' },
  ];

  return (
    <nav className="navbar">
      <Link to="/" className="logo">{'\u{1F4CB}'} Daily Planner</Link>
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
