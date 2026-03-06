import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar.jsx';
import Overview from './pages/Overview.jsx';
import Posts from './pages/Posts.jsx';
import Portfolio from './pages/Portfolio.jsx';
import GitHub from './pages/GitHub.jsx';

export default function App() {
  return (
    <HashRouter>
      <div className="app-shell">
        <Sidebar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Overview />} />
            <Route path="/posts" element={<Posts />} />
            <Route path="/portfolio" element={<Portfolio />} />
            <Route path="/github" element={<GitHub />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </HashRouter>
  );
}
