const WP_BASE = 'https://esmondmccain.com/wp-json/wp/v2';
const GH_BASE = 'https://api.github.com';
const GH_USER = 'Esmond-M';

async function get(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Fetch failed: ${url} — ${res.status}`);
  return res.json();
}

// ── WordPress ──────────────────────────────────────────────
export async function getPosts(page = 1, perPage = 10) {
  const url = `${WP_BASE}/posts?page=${page}&per_page=${perPage}&_embed=1`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Posts fetch failed: ${res.status}`);
  const data = await res.json();
  const total = parseInt(res.headers.get('X-WP-Total') ?? '0', 10);
  const totalPages = parseInt(res.headers.get('X-WP-TotalPages') ?? '1', 10);
  return { posts: data, total, totalPages };
}

export async function getPortfolio() {
  // em-portfolio is the CPT slug used in the theme
  const res = await fetch(`${WP_BASE}/em-portfolio?per_page=100&_embed=1`);
  if (!res.ok) throw new Error(`Portfolio fetch failed: ${res.status}`);
  return res.json();
}

// ── GitHub ─────────────────────────────────────────────────
export async function getGitHubProfile() {
  return get(`${GH_BASE}/users/${GH_USER}`);
}

export async function getGitHubRepos() {
  return get(`${GH_BASE}/users/${GH_USER}/repos?per_page=100&sort=updated`);
}

export async function getGitHubEvents() {
  return get(`${GH_BASE}/users/${GH_USER}/events/public?per_page=100`);
}
