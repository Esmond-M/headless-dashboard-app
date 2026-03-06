import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import StatCard from '../components/StatCard.jsx';
import { getPosts, getPortfolio, getGitHubProfile, getGitHubRepos, getGitHubEvents } from '../api.js';

function formatRelative(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function eventLabel(event) {
  if (event.type === 'PushEvent') {
    const count = event.payload?.commits?.length ?? 0;
    return `Pushed ${count} commit${count !== 1 ? 's' : ''} to ${event.repo.name}`;
  }
  if (event.type === 'CreateEvent') return `Created ${event.payload.ref_type} in ${event.repo.name}`;
  if (event.type === 'IssuesEvent') return `${event.payload.action} issue in ${event.repo.name}`;
  if (event.type === 'PullRequestEvent') return `${event.payload.action} PR in ${event.repo.name}`;
  if (event.type === 'WatchEvent') return `Starred ${event.repo.name}`;
  if (event.type === 'ForkEvent') return `Forked ${event.repo.name}`;
  return `${event.type} on ${event.repo.name}`;
}

function eventIcon(type) {
  if (type === 'PushEvent') return '↑';
  if (type === 'CreateEvent') return '✦';
  if (type === 'IssuesEvent') return '⚠';
  if (type === 'PullRequestEvent') return '⇄';
  if (type === 'WatchEvent') return '★';
  if (type === 'ForkEvent') return '⑂';
  return '·';
}

function stripHtml(html) {
  return html?.replace(/<[^>]+>/g, '') ?? '';
}

export default function Overview() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    Promise.all([
      getPosts(1, 3).catch(() => ({ posts: [], total: 0 })),
      getPortfolio().catch(() => []),
      getGitHubProfile().catch(() => null),
      getGitHubRepos().catch(() => []),
      getGitHubEvents().catch(() => []),
    ]).then(([postsData, portfolio, ghProfile, repos, events]) => {
      setData({ postsData, portfolio, ghProfile, repos, events });
    }).catch(setError);
  }, []);

  if (error) return <div className="error-msg">Failed to load dashboard data.</div>;
  if (!data) return <div className="loading"><div className="spinner" />Loading…</div>;

  const { postsData, portfolio, ghProfile, repos, events } = data;
  const totalStars = repos.reduce((sum, r) => sum + r.stargazers_count, 0);
  const recentEvents = events.filter(e => e.type === 'PushEvent' || e.type === 'CreateEvent').slice(0, 6);
  const latestPost = postsData.posts[0];

  return (
    <div>
      <div className="page-header">
        <h1>Overview</h1>
        <p>A live snapshot of your work — pulled from WordPress and GitHub.</p>
      </div>

      <div className="stat-grid">
        <StatCard label="Blog Posts" value={postsData.total} sub="on esmondmccain.com" color="var(--color-primary)" />
        <StatCard label="Portfolio Items" value={portfolio.length} sub="WP custom post type" color="var(--color-primary)" />
        <StatCard label="GitHub Repos" value={ghProfile?.public_repos ?? repos.length} sub="public repositories" />
        <StatCard label="Total Stars" value={totalStars} sub="across all repos" color="var(--color-warning)" />
        <StatCard label="Followers" value={ghProfile?.followers ?? '—'} sub="GitHub followers" />
      </div>

      <div className="section">
        <div className="section-title">Recent GitHub Activity</div>
        {recentEvents.length === 0 ? (
          <div className="empty-state">No recent activity found.</div>
        ) : (
          <div className="activity-list">
            {recentEvents.map((e) => (
              <div key={e.id} className="activity-item">
                <span className="activity-icon">{eventIcon(e.type)}</span>
                <div className="activity-body">
                  <div>{eventLabel(e)}</div>
                  <div className="activity-time">{formatRelative(e.created_at)}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {latestPost && (
        <div className="section">
          <div className="section-title">Latest Post</div>
          <div className="card" style={{ maxWidth: 560 }}>
            <div className="card-meta">{new Date(latestPost.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
            <div className="card-title">{stripHtml(latestPost.title.rendered)}</div>
            <div className="card-excerpt">{stripHtml(latestPost.excerpt.rendered)}</div>
            <div className="card-footer">
              <a href={latestPost.link} target="_blank" rel="noreferrer" className="btn btn-ghost btn-sm" style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem' }}>
                Read post →
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
