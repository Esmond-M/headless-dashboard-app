import { useEffect, useState } from 'react';
import { getPosts } from '../api.js';

function stripHtml(html) {
  return html?.replace(/<[^>]+>/g, '') ?? '';
}

export default function Posts() {
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    getPosts(page, 12)
      .then(({ posts, total, totalPages }) => {
        setPosts(posts);
        setTotal(total);
        setTotalPages(totalPages);
      })
      .catch(() => setError('Failed to load posts.'))
      .finally(() => setLoading(false));
  }, [page]);

  const filtered = search
    ? posts.filter((p) => stripHtml(p.title.rendered).toLowerCase().includes(search.toLowerCase()))
    : posts;

  return (
    <div>
      <div className="page-header">
        <h1>Blog Posts</h1>
        <p>{total} posts from WordPress via REST API</p>
      </div>

      <div className="search-bar">
        <input
          type="text"
          placeholder="Filter by title…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading && <div className="loading"><div className="spinner" />Loading posts…</div>}
      {error && <div className="error-msg">{error}</div>}

      {!loading && !error && (
        <>
          {filtered.length === 0 ? (
            <div className="empty-state">No posts match your search.</div>
          ) : (
            <div className="card-grid">
              {filtered.map((post) => {
                const thumb = post._embedded?.['wp:featuredmedia']?.[0]?.source_url;
                return (
                  <div key={post.id} className="card">
                    {thumb && <img src={thumb} alt="" className="card-img" loading="lazy" />}
                    <div className="card-meta">
                      {new Date(post.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </div>
                    <div className="card-title">{stripHtml(post.title.rendered)}</div>
                    <div className="card-excerpt">{stripHtml(post.excerpt.rendered)}</div>
                    <div className="card-footer">
                      <a href={post.link} target="_blank" rel="noreferrer" className="btn btn-ghost" style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem' }}>
                        Read →
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {!search && totalPages > 1 && (
            <div className="pagination">
              <button className="btn btn-ghost" onClick={() => setPage((p) => p - 1)} disabled={page === 1}>
                ← Prev
              </button>
              <span style={{ fontSize: '0.85rem', color: 'var(--color-muted)' }}>
                Page {page} of {totalPages}
              </span>
              <button className="btn btn-ghost" onClick={() => setPage((p) => p + 1)} disabled={page === totalPages}>
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
