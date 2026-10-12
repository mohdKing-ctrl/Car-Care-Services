# Care Line (كير لاين)

Compare car wash and car service companies across the Sultanate of Oman.
Customers compare local companies and contact them directly by phone call or WhatsApp. The company comes to the customer.

This is a demo for a college project. All companies are fictional examples.

## Features
- Search by service (wash, interior, polish, oil change, battery, tyres, A/C, brakes) and by governorate (all 11 in Oman)
- Company cards with rating, price in OMR, areas served, open/closed status (Oman time)
- **Call** and **WhatsApp** buttons (WhatsApp opens with a ready message for that company and service)
- **UTAS Students & Staff** order form: choose role, UTAS branch (11 branches), services, car brand, campus car-park location and time. Only companies that serve that branch and offer all selected services are shown; the order is sent to the chosen company on WhatsApp
- English and Arabic (RTL) in one click
- Mobile friendly, no frameworks, no build step

## Edit the demo data
- Companies, prices and phone numbers: `js/data.js`
  (`wa` = `968` + 8-digit number, no `+` and no spaces)
- Texts / translations: `js/i18n.js`
- "Join as a company" WhatsApp number: `TEAM_WHATSAPP` at the top of `js/app.js`

## Publish on GitHub Pages
1. Create a new repository on GitHub and upload **the contents of this folder** (so `index.html` is in the repo root).
2. Repo **Settings → Pages → Build and deployment → Deploy from a branch → `main` / `(root)` → Save**.
3. After about a minute the site is live at `https://<your-username>.github.io/<repo-name>/`.

## Social media + SEO
- Social links (Instagram, TikTok, Facebook) and the 4 post images are in the **Social media** section and the footer. Post images: `img/social/`. Post titles/captions: `js/i18n.js` (`post.1.t`, `post.1.c`, ...).
- Account URLs appear in `index.html` (social section, footer, structured data) and `js/data.js` (`SOCIAL`).
- Search engine setup: page title and description, Open Graph / X share preview, structured data (JSON-LD), `sitemap.xml`, `robots.txt`, favicon.

### After you publish: replace the placeholder address
`index.html`, `sitemap.xml` and `robots.txt` contain `https://YOUR-USERNAME.github.io/YOUR-REPO/`.
Search-and-replace it with your real GitHub Pages address (keep the trailing `/`), for example `https://myname.github.io/careline/`.
Then add the site in Google Search Console and submit `sitemap.xml`.
(Note: `robots.txt` is only read by search engines when it is at the root of the domain, i.e. a `username.github.io` site or a custom domain.)
