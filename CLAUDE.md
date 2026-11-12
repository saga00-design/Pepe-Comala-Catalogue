# Memory

## Me
Elliott — Pepe-Comala-Catalogue is a masonry-style product showcase/catalogue app.

## This Repo
React 19 product catalogue with a masonry grid layout. Products are editable inline, persisted to localStorage. Google Drive integration is stubbed but not wired up. 32 mock products generated from constants.ts. No backend.

→ Full details: memory/projects/Pepe-Comala-Catalogue.md

## Tech Stack
| Layer | Tech |
|-------|------|
| Frontend | React 19 + TypeScript + Vite 6 |
| State | React useState + localStorage persistence |
| Styling | Tailwind CSS (slate/light theme) |
| Images | Picsum Photos (placeholder) |
| Integration | Google Drive API/Picker (stubbed — keys empty) |

## Key Files
| File | Purpose |
|------|---------|
| `App.tsx` | Root — product state, edit mode, modal control |
| `constants.ts` | `INITIAL_PRODUCTS` (32 mock items), Google Drive config placeholders |
| `types.ts` | `Product`, `ProductUpdate` interfaces |
| `components/ProductCard.tsx` | Masonry card — click to view, edit button in edit mode |
| `components/ProductModal.tsx` | Detail/edit modal — title, description, price, image URL |
| `components/Icons.tsx` | Inline SVG icon components |

## Product Type
```ts
interface Product {
  id: string
  title: string
  description: string
  price: number
  imageUrl: string
  heightClass: string  // aspect ratio class for masonry effect
}
```

## State
- Products stored in `localStorage` key `pepe_comala_products`
- `isEditMode`: toggles edit overlays on cards
- `selectedProduct` + `isModalOpen`: detail/edit modal state

## Dev Command
```bash
npm run dev
```

## Notes
- Google Drive integration (`GOOGLE_DRIVE_CLIENT_ID`, `GOOGLE_DRIVE_API_KEY`) is stubbed in `constants.ts` — not connected
- No backend — all data is client-side localStorage
- Masonry effect is CSS `aspect-ratio` variation per card, not a true masonry layout library
- If wiring real products: replace `INITIAL_PRODUCTS` in `constants.ts` and add a backend/CMS

## Preferences
- Direct, practical answers
- Complete code when making changes
- Point out risks before acting
- Small business → scalable thinking
