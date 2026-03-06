import { useEffect, useState } from 'react';
import { getPortfolio } from '../api.js';

function stripHtml(html) {
  return html?.replace(/<[^>]+>/g, '') ?? '';
}

export default function Portfolio() {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getPortfolio()
      .then(setItems)
      .catch(() => setError('Failed to load portfolio items.'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = search
    ? items.filter((i) => stripHtml(i.title.rendered).toLowerCase().includes(search.toLowerCase()))
    : items;

  return (
    <div>
      <div className="page-header">
        <h1>Portfolio</h1>
        <p>{items.length} items from the WordPress em-portfolio custom post type</p>
      </div>

      <div className="search-bar">
        <input
          type="text"
          placeholder="Filter by title…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading && <div className="loading"><div className="spinner" />Loading portfolio…</div>}
      {error && <div className="error-msg">{error}</div>}

      {!loading && !error && (
        filtered.length === 0 ? (
          <div className="empty-state">No portfolio items found.</div>
        ) : (
          <div className="card-grid">
            {filtered.map((item) => {
              const thumb = item._embedded?.['wp:featuredmedia']?.[0]?.source_url;
              const categories = item._embedded?.['wp:term']?.[0] ?? [];
              return (
                <div key={item.id} className="card">
                  {thumb && <img src={thumb} alt="" className="card-img" loading="lazy" />}
                  <div className="card-title">{stripHtml(item.title.rendered)}</div>
                  {categories.length > 0 && (
                    <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                      {categories.map((cat) => (
                        <span key={cat.id} className="badge badge-blue">{cat.name}</span>
                      ))}
                    </div>
                  )}
                  <div className="card-excerpt">{stripHtml(item.excerpt?.rendered ?? '')}</div>
                  <div className="card-footer">
                    <a href={item.link} target="_blank" rel="noreferrer" className="btn btn-ghost" style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem' }}>
                      View →
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )
      )}
    </div>
  );
}
