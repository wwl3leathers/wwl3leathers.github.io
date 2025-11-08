3Leathers — Minimal Content Overwrite Package (v11-8 Full Functionality Add-On)

WHAT'S INCLUDED
- privacy.html  (new page)
- terms.html    (new page; includes deposits language exactly as approved)
- builder/health.html (hidden utility; optional)
- sitemap.xml   (expanded for all live pages; excludes /builder/ by default)
- images/favicon.png (tab icon)
- snippets/head-social-meta.html (OG/Twitter meta; no visible links)
- snippets/checkout-icons.html (icons-only strip; inline SVG)

HOW TO INSTALL (GitHub Pages)
1) Upload the CONTENTS of this ZIP into your repo root (not the folder itself). It's safe—no existing images are overwritten.
2) Add footer links to Privacy and Terms if they’re not already present.
3) (Optional but recommended) In each page <head> (index, shop, custom, checkout, custom-thanks):
   Paste the snippet from /snippets/head-social-meta.html just below the <title> tag.
4) In checkout.html:
   Paste the contents of /snippets/checkout-icons.html directly ABOVE the form’s submit button.
5) Commit to 'main'. GitHub Pages will rebuild automatically.

NOTES
- No Netlify, no analytics, no new forms added.
- Forms & AJAX behaviors remain exactly as before.
- Social tags do NOT add any visible social links.
- /builder/health.html is noindex and unlinked (direct URL only).
