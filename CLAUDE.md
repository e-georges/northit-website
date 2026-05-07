# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

Static HTML website for **North IT** (northit.fr), a French ITIL® 4 Foundation training and certification company. Deployed via GitHub Pages with a custom domain configured in `CNAME`.

## Development

No build system or package manager. Open any `.html` file directly in a browser, or serve locally with:

```bash
# Python
python -m http.server 8080

# Node (npx)
npx serve .
```

## Architecture

**Self-contained HTML pages** — every page bundles its own CSS (inline `<style>`) and JavaScript (inline `<script>`). There are no shared external stylesheets or JS files; nav, design tokens, and common styles are duplicated across all pages.

**Design tokens** (defined in `:root` on each page — must be kept in sync manually):
```
--navy:#07102A   --deep:#0B1A3E   --blue:#1446A0   --cyan:#00AADD
--white:#F4F7FF  --muted:#8A9BC4  --card:#0F1F4A   --border:rgba(0,170,221,.15)
```

**Fonts** loaded from Google Fonts CDN: `Raleway` (headings, weights 700/800/900) and `Nunito Sans` (body).

**SEO** — each page contains:
- Full Open Graph + Twitter Card meta tags
- A `<link rel="canonical">` pointing to the production URL
- A `<script type="application/ld+json">` block with Schema.org structured data (Organization, Course, Person, etc.)

When adding or editing a page, update `sitemap.xml` with the new URL and `<lastmod>` date.

## Pages

| File | Purpose |
|---|---|
| `index.html` | Homepage — hero, stats, course overview, testimonials, CTA |
| `formation.html` | Full course programme, session dates, pricing |
| `itil-v5.html` | ITIL® v5 content/landing page |
| `about.html` | Founder bio (Éric GEORGES) |
| `references.html` | Client references |
| `contact.html` | Registration/contact form |
| `termes.html` | Legal terms |
