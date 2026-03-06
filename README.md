# Developer Dashboard

A developer dashboard built with React and Vite. Pulls live data from a headless WordPress REST API and the GitHub API — displays blog posts, portfolio items, repository stats, and commit activity charts. No backend required.

**Live demo:** [esmondmccain.com/developer-dashboard](https://esmondmccain.com/developer-dashboard/)

## Tech Stack

- **Frontend:** React 18, Vite 5, React Router 6 (HashRouter)
- **Data:** WordPress REST API (headless), GitHub REST API (public, no auth)
- **Charts:** Recharts
- **No backend** — purely client-side, all data fetched directly from public APIs

## Pages

| Page | Data source |
|---|---|
| Overview | WP posts + portfolio count, GitHub stats, recent activity |
| Posts | WP blog posts — paginated, filterable by title |
| Portfolio | WP `em-portfolio` CPT — filterable by title |
| GitHub | Profile card, commit activity chart, stars chart, repo list |

## Running Locally

```bash
npm install
npm run dev
```

App: `http://localhost:5173`

No `.env` or server setup needed — all API calls are to public endpoints.

## Deployment

Built with `npm run build` and served as a static site embedded in the WordPress theme, the same pattern as the Project Manager app.

## Notes

- GitHub API allows 60 unauthenticated requests/hour per IP — sufficient for a portfolio demo
- WordPress portfolio items must be in **Published** status to appear; drafts are excluded by the REST API automatically
- To point this at a different WordPress site or GitHub user, update the constants at the top of `src/api.js`
