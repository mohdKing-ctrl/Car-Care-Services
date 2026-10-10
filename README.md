# Car Care Services (خدمات العناية بالسيارات)

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
