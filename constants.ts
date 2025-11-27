import { Product } from './types';

export const APP_NAME = "Pepe Comala";

// Google Drive Configuration
// To enable Google Drive integration:
// 1. Go to Google Cloud Console (https://console.cloud.google.com)
// 2. Create a project and enable "Google Drive API" and "Google Picker API"
// 3. Create Credentials:
//    - API Key (Browser key)
//    - OAuth 2.0 Client ID (Web application)
// 4. IMPORTANT: In the Client ID settings, add your app's domain (e.g., http://localhost:3000 or https://your-app.com)
//    to "Authorized JavaScript origins". This is required for the file download (CORS) to work.
export const GOOGLE_DRIVE_CLIENT_ID = ""; 
export const GOOGLE_DRIVE_API_KEY = ""; 
export const GOOGLE_DRIVE_APP_ID = ""; // Project ID (Optional)

// Height variations for masonry effect
const HEIGHT_CLASSES = [
  'aspect-[3/4]',
  'aspect-[1/1]',
  'aspect-[3/2]',
  'aspect-[4/5]'
];

const ADJECTIVES = ['Ethereal', 'Modern', 'Vintage', 'Urban', 'Coastal', 'Rustic', 'Cyber', 'Minimal', 'Luxury', 'Boho'];
const NOUNS = ['Lamp', 'Chair', 'Vase', 'Watch', 'Sneaker', 'Camera', 'Planter', 'Headphones', 'Backpack', 'Sculpture'];

// Generate 32 mock items
export const INITIAL_PRODUCTS: Product[] = Array.from({ length: 32 }, (_, i) => {
  const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
  
  return {
    id: `prod-${i}`,
    title: `${adj} ${noun} ${i + 1}`,
    description: `Experience the essence of ${adj.toLowerCase()} design with this stunning ${noun.toLowerCase()}. Crafted for those who appreciate fine detail and uncompromising quality. Perfect for any contemporary setting.`,
    price: Math.floor(Math.random() * 300) + 50,
    imageUrl: `https://picsum.photos/seed/${i + 100}/600/${Math.random() > 0.5 ? 800 : 600}`,
    heightClass: HEIGHT_CLASSES[i % HEIGHT_CLASSES.length],
  };
});