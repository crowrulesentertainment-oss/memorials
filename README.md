# CrowRules Memorials

**Remember. Honor. Celebrate.**

CrowRules Memorials is a digital remembrance platform for preserving lives, stories, photographs, traditions, voices and legacies.

## Site

- Home: `index.html`
- Memorial directory: `memorials.html`
- Featured: `featured.html`
- Recent: `recent.html`
- Search: `search.html`
- Create a memorial: `create-memorial.html`

## Shared site engine

The repository uses a shared navigation and presentation layer:

- `assets/memorial-nav.js` — responsive site navigation and memorial context
- `assets/memorial-nav.css` — navigation styling
- `assets/memorial-site.css` — responsive cinematic design system
- `assets/memorial-site.js` — accessibility, page enhancement, context, footer and utility behavior

The shared engine preserves `slug` and `memorial_id` URL context so visitors can move through remembrance features without losing the memorial they are viewing.

## Data

Memorial content is powered by Supabase. Existing functionality and database-backed pages should be preserved when individual pages are enhanced.

## Design direction

Dark cinematic presentation, warm gold accents, strong typography, responsive layouts, accessible controls, image fallbacks, reduced-motion support and a respectful remembrance-first experience.

A CrowRules Entertainment project.