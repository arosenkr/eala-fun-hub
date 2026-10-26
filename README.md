# Eala Fan Hub

A standalone, mobile-friendly Alex Eala fan-news website using Philippine flag colors. The site automatically pulls recent public headlines for “Alex Eala” / “Alexandra Eala” through a small Netlify serverless function and links readers to the original news destinations.

## What auto-updates

- Recent news headlines
- Publisher/source names
- Publication times
- Feed status and last refresh time

The browser refreshes the feed every 10 minutes while the page is open. Netlify caches the upstream RSS response so the site does not repeatedly hit the source.

## Important content model

The site does **not** copy full news stories. It displays a headline, source, date/time and outbound link. This reduces copyright risk and keeps the site useful as a fan index rather than a republisher.

The automatic feed currently uses a public Google News RSS search endpoint. No API key or paid sports-data license is required, but availability and terms can change. The site includes a direct Google News fallback if the feed becomes unavailable.

## Recommended publishing method: GitHub + Netlify

This method deploys both the static website and the `/api/news` serverless function.

### 1. Create a GitHub repository

1. Sign in to GitHub.
2. Click **New repository**.
3. Name it something like `eala-fan-hub`.
4. Choose **Public** or **Private**.
5. Create the repository.

### 2. Upload these website files

Upload the **contents** of this folder to the repository root, including:

- `index.html`
- `styles.css`
- `app.js`
- `favicon.svg`
- `site.webmanifest`
- `robots.txt`
- `404.html`
- `netlify.toml`
- `netlify/functions/news.mjs`

You can use GitHub’s **Add file → Upload files** button; no command line is required.

### 3. Deploy with Netlify

1. Sign in at Netlify.
2. Choose **Add new project → Import an existing project**.
3. Select **GitHub** and authorize access if asked.
4. Choose the repository you just created.
5. Netlify should detect the root site automatically. There is no build command.
6. Click **Deploy**.
7. When the deploy finishes, open the generated `*.netlify.app` address.
8. Confirm that the news cards appear under **Alex Eala in the news**.

### 4. Change the site name

In Netlify:

**Project configuration → General → Project details → Change project name**

A name such as `eala-fan-hub` may produce a URL like:

`https://eala-fan-hub.netlify.app`

Availability varies.

### 5. Add a custom domain (optional)

1. Buy a domain from any registrar.
2. In Netlify, open **Domain management**.
3. Choose **Add a domain**.
4. Enter the domain you own.
5. Follow Netlify’s DNS instructions.
6. Netlify provisions HTTPS automatically after DNS is configured.

Use an independent fan-oriented domain/name that does not imply endorsement by Alex Eala, her management, or the WTA.

## Updating the design or links

- Page wording and links: edit `index.html`.
- Colors/layout: edit `styles.css`.
- Feed display behavior: edit `app.js`.
- Search query/feed logic: edit `netlify/functions/news.mjs`.

When the GitHub repository changes, Netlify automatically redeploys the site.

## Changing the news search

In `netlify/functions/news.mjs`, modify `FEED_URL`. The current query searches for both “Alex Eala” and “Alexandra Eala”.

## Testing after deployment

Open these two URLs:

1. `https://YOUR-SITE.netlify.app/`
2. `https://YOUR-SITE.netlify.app/api/news`

The second URL should return JSON containing an `items` array and `fetchedAt` timestamp.

## Notes

- No player photo is bundled, avoiding an unnecessary image-licensing issue.
- The colors use the principal Philippine flag palette: blue `#0038A8`, red `#CE1126`, white, and yellow `#FCD116`.
- This is an independent fan site, not an official Alex Eala or WTA property.

## Current page structure

The current version places profile/results/statistics/record links immediately below the page header, followed by the automatically updating news feed, social-media links, the about section, and a footer credit to **A & A**.

## October 23, 2026 update

This version uses 9 news placeholders/items, cache-busted CSS/JS asset URLs, an explicit Netlify `/api/news` rewrite, and a direct-function fallback (`/.netlify/functions/news`) in the browser. Replace `index.html`, `styles.css`, `app.js`, `netlify.toml`, and `netlify/functions/news.mjs` together so the deployed frontend and function remain in sync.
