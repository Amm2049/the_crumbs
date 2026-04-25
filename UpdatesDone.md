# The Crumbs - Learning Log & Progress

## Latest Updates (Admin Dashboard Overhaul)

### ☁️ Media Management & Cloudinary
- **Browser-Side Uploads:** Integrated Cloudinary's `CldUploadWidget` for a secure, performant browser-side upload flow using unsigned presets.
- **Unified Organization:** Assets are now automatically organized into `products` and `categories` folders on Cloudinary.
- **Custom UI:** Tailored the Cloudinary widget palette to match the artisanal "Honey & Cream" color scheme.

### 🎨 Premium Admin UI (Honey & Cream Design)
- **Unified Tables:** Standardized all admin tables (Products, Orders, Categories, Customers) with high-contrast typography, rounded headers, and sticky glassmorphism effects.
- **Modal-Based Workflow:** Replaced cramped inline editing and separate pages with beautiful, centered **Modals** for Product and Category management.
- **Dashboard Snapshot:** Redesigned StatsCards with interactive hover containers, trend indicators, and a focused "Recent Orders" compact view.

### ⚙️ UX & Functionality Improvements
- **Automatic Slugs:** Implemented real-time slug generation based on product/category names during creation.
- **Accessible Actions:** Switched row actions from "hover-to-reveal" to "always visible" for better efficiency and accessibility.
- **Real-time Status Pills:** Added distinct, color-coded status badges across all tables for instant readability.
- **Simplified Backend:** Kept APIs lightweight by handling all media processing on the frontend and only syncing validated URLs to the database.
