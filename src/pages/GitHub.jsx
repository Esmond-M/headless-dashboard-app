import { useEffect, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import { getGitHubProfile, getGitHubRepos, getGitHubEvents } from '../api.js';

const LANG_COLORS = {
  JavaScript: '#f7df1e',
  TypeScript: '#3178c6',
  PHP:        '#8892bf',
  CSS:        '#563d7c',
  HTML:       '#e34c26',
  Python:     '#3572a5',
  Shell:      '#89e051',
};

function langColor(lang) {
  return LANG_COLORS[lang] ?? 'var(--color-muted)';
}

function formatRelative(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return 'today';
  if (days === 1) return 'yesterday';
  return `${days}d ago`;
}

export default function GitHub() {
  const [profile, setProfile] = useState(null);
  const [repos, setRepos] = useState([]);
  const [events, setEvents] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    Promise.all([
      getGitHubProfile(),
      getGitHubRepos(),
      getGitHubEvents(),
    ])
      .then(([p, r, e]) => { setProfile(p); setRepos(r); setEvents(e); })
      .catch(() => setError('Failed to load GitHub data. GitHub API rate limits may apply.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading"><div className="spinner" />Loading GitHub data…</div>;
  if (error) return <div className="error-msg">{error}</div>;

  // Chart: top 8 repos by stars
  const chartData = [...repos]
    .filter((r) => r.stargazers_count > 0 || r.forks_count > 0)
    .sort((a, b) => b.stargazers_count - a.stargazers_count)
    .slice(0, 8)
    .map((r) => ({ name: r.name.replace(/[-_]/g, ' '), stars: r.stargazers_count }));

  // Push frequency: events grouped by week (payload.size unavailable for unauthenticated requests)
  const weekMap = {};
  events.forEach((e) => {
    if (e.type !== 'PushEvent') return;
    const d = new Date(e.created_at);
    const weekStart = new Date(d);
    weekStart.setDate(d.getDate() - d.getDay());
    const key = weekStart.toISOString().slice(0, 10);
    weekMap[key] = (weekMap[key] ?? 0) + (e.payload?.size > 0 ? e.payload.size : 1);
  });
  const pushData = Object.entries(weekMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-12)
    .map(([week, pushes]) => ({ week: week.slice(5), pushes }));

  const filtered = search
    ? repos.filter((r) => r.name.toLowerCase().includes(search.toLowerCase()))
    : repos;

  return (
    <div>
      <div className="page-header">
        <h1>GitHub</h1>
        <p>Live data from the GitHub API</p>
      </div>

      {profile && (
        <div className="gh-profile">
          <img src={profile.avatar_url} alt={profile.login} className="gh-avatar" />
          <div className="gh-profile-info">
            <h2>{profile.name ?? profile.login}</h2>
            {profile.bio && <p>{profile.bio}</p>}
            <div className="gh-profile-stats">
              <span><strong>{profile.public_repos}</strong> repos</span>
              <span><strong>{profile.followers}</strong> followers</span>
              <span><strong>{profile.following}</strong> following</span>
            </div>
          </div>
        </div>
      )}

      {pushData.length > 0 && (
        <div className="section">
          <div className="section-title">Push Activity (last 12 weeks)</div>
          <div className="chart-wrap">
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={pushData} margin={{ top: 4, right: 4, bottom: 4, left: -20 }}>
                <XAxis dataKey="week" tick={{ fill: 'var(--color-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'var(--color-muted)', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ background: 'var(--color-surface2)', border: '1px solid var(--color-border)', borderRadius: '6px', fontSize: '0.8rem' }}
                  cursor={{ fill: 'rgba(255,255,255,0.04)' }}
                />
                <Bar dataKey="pushes" fill="var(--color-primary)" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {chartData.length > 0 && (
        <div className="section">
          <div className="section-title">Stars by Repository</div>
          <div className="chart-wrap">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={chartData} layout="vertical" margin={{ top: 4, right: 16, bottom: 4, left: 8 }}>
                <XAxis type="number" tick={{ fill: 'var(--color-muted)', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                <YAxis dataKey="name" type="category" tick={{ fill: 'var(--color-muted)', fontSize: 11 }} axisLine={false} tickLine={false} width={110} />
                <Tooltip
                  contentStyle={{ background: 'var(--color-surface2)', border: '1px solid var(--color-border)', borderRadius: '6px', fontSize: '0.8rem' }}
                  cursor={{ fill: 'rgba(255,255,255,0.04)' }}
                />
                <Bar dataKey="stars" fill="var(--color-warning)" radius={[0, 3, 3, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      <div className="section">
        <div className="section-title">Repositories ({repos.length})</div>
        <div className="search-bar">
          <input
            type="text"
            placeholder="Filter repos…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {filtered.length === 0 ? (
          <div className="empty-state">No repos match.</div>
        ) : (
          <div className="repo-list">
            {filtered.map((repo) => (
              <div key={repo.id} className="repo-item">
                <a href={repo.html_url} target="_blank" rel="noreferrer" className="repo-name">{repo.name}</a>
                <span className="repo-desc">{repo.description ?? ''}</span>
                <div className="repo-meta">
                  {repo.language && (
                    <span>
                      <span style={{ width: 8, height: 8, borderRadius: '50%', background: langColor(repo.language), display: 'inline-block' }} />
                      {repo.language}
                    </span>
                  )}
                  {repo.stargazers_count > 0 && <span>★ {repo.stargazers_count}</span>}
                  {repo.forks_count > 0 && <span>⑂ {repo.forks_count}</span>}
                  <span style={{ color: 'var(--color-muted)' }}>{formatRelative(repo.updated_at)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
