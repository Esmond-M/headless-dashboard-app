import { NavLink } from 'react-router-dom';

const links = [
  { to: '/',          icon: '◈', label: 'Overview'  },
  { to: '/posts',     icon: '✦', label: 'Posts'     },
  { to: '/portfolio', icon: '◆', label: 'Portfolio' },
  { to: '/github',    icon: '◉', label: 'GitHub'    },
];

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">Dev<span>Dashboard</span></div>
      <nav className="sidebar-nav">
        {links.map(({ to, icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) => 'sidebar-link' + (isActive ? ' active' : '')}
          >
            <span className="sidebar-icon">{icon}</span>
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
