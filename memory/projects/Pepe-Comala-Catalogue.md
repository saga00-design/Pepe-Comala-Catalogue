# Pepe-Comala-Catalogue

**Repo:** saga00-design/Pepe-Comala-Catalogue  
**Inspected:** 2026-11-12  
**Status:** Active prototype — no backend, localStorage-only

## What It Is
A masonry-style product showcase/catalogue built with React 19. Displays 32 mock products in a responsive masonry grid. Users can click a product to view detail, toggle edit mode to modify any product inline (title, description, price, image URL), add new products, or delete them. All changes persist to localStorage.

Likely intended as a Pepe Comala brand product catalogue — a companion to the Backbone Hub ecosystem landing pages.

## Tech Stack
- React 19 + TypeScript + Vite 6
- Tailwind CSS (light theme: slate-50 bg, white cards)
- localStorage for persistence
- Picsum Photos for placeholder images
- Google Drive API/Picker stubbed (not configured)

## File Structure
```
App.tsx                   Root — all state, edit mode, modal control
constants.ts              INITIAL_PRODUCTS (32 items), Google Drive config (empty)
types.ts                  Product, ProductUpdate
components/
  ProductCard.tsx         Masonry card — aspect ratio variation for visual depth
  ProductModal.tsx        Detail view + inline edit (title, desc, price, imageUrl)
  Icons.tsx               Inline SVG: EditIcon, PlusIcon, EyeIcon, CheckIcon
index.html / index.tsx    Entry points
```

## Data Model
```ts
interface Product {
  id: string              // 'prod-0' to 'prod-31' for mocks, 'new-{timestamp}' for added
  title: string
  description: string
  price: number
  imageUrl: string
  heightClass: string     // 'aspect-[3/4]' | 'aspect-[1/1]' | 'aspect-[3/2]' | 'aspect-[4/5]'
}
```

## Key Behaviours
- **Edit mode**: toggle via header button — shows edit overlays on each card
- **Add product**: prepends a blank product, opens modal immediately
- **Delete**: from modal in edit mode
- **Persistence**: `localStorage.setItem('pepe_comala_products', ...)` on every change
- **Reset**: clearing localStorage restores the 32 mock products from `constants.ts`

## Google Drive Integration (Stubbed)
`constants.ts` has three empty string constants:
```ts
export const GOOGLE_DRIVE_CLIENT_ID = "";
export const GOOGLE_DRIVE_API_KEY = "";
export const GOOGLE_DRIVE_APP_ID = "";
```
To activate: create a Google Cloud project, enable Drive API + Picker API, add OAuth client ID and API key, add domain to Authorized JavaScript origins.

## Risks / Notes
- No auth — anyone with access can edit/delete all products
- localStorage is per-browser — not shareable, not persistent across devices
- Masonry is simulated with aspect-ratio CSS, not a true masonry algorithm — tall items don't fill gaps
- No image upload — only URL input (must be a public URL or picsum seed)
- No CMS or database — to productionise, needs a backend (Supabase/Firebase) and image storage

## Relationship to Other Projects
- `saga00-design/Pepe-Comala` — the Backbone Hub landing page (different product)
- `saga00-design/Pepe-Comala2` — a saved AI Studio snapshot (not related)
- `saga00-design/Backbone-Hub` — the main hospitality management app this brand is for
