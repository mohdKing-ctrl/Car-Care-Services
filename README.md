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

## SEO control panel (`seo-admin.html`)
A "back end" page for the search-engine setup. Open it from the admin dashboard (SEO text tab, "Advanced SEO tools") or at `/seo-admin.html`. It needs the admin login.
- Edit the page title, description, keywords, share image, business data and social links, with character counters
- Live **Google search preview** (desktop / mobile) and **share-card preview**
- Automatic **audit** of the published `index.html`, `robots.txt` and `sitemap.xml` with a score out of 100
- Keyword usage table (title / description / headings / page text)
- Generates the head tags, `sitemap.xml` and `robots.txt`; **Download updated index.html** swaps the SEO block (between `SEO:START` and `SEO:END`) for you

Because GitHub Pages is static, the panel saves a draft in your browser and gives you files to upload to the repository (it cannot write to GitHub itself). The panel page is marked `noindex` so it does not appear on Google.

## Login, admin dashboard and company dashboards
- `login.html`: one login page. The administrator goes to `admin.html`; each company goes to its own `portal.html`.
- **Admin dashboard** (`admin.html`): overview with visits, views, calls, WhatsApp clicks and orders; list of all companies with full details; customers and orders (CSV export); **SEO text editor** (title, meta description, keywords, share text); accounts and a password tool.
- **Company dashboard** (`portal.html`): each company sees only its own visits, clicks on its services, customers who ordered, and its listing.
- Login details are in `LOGIN-DETAILS.md` (one folder **above** this one, so it is not uploaded). Keep it private.
- Accounts are in `js/accounts.js` (salted hashes only). Change a password in the admin dashboard, tab **Accounts**.

### How the numbers work (important)
GitHub Pages is a static host with no database, so:
- Visits and clicks made on the public website are recorded **in the visitor's own browser** (`js/track.js`). Dashboards show them as "live" events, merged with **simulated sample history** so the charts are not empty in a demo (switch it off with "Include sample history").
- The login is checked in the browser, so it is a **demo**, not real security. A real system needs a server (for example Firebase or Supabase) to store events and check passwords.
- The SEO editor's **Save & apply** changes the text on the browser that saved it. To publish for everyone, use **Download updated index.html** and upload it to GitHub.
