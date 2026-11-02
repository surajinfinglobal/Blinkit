# Admin Panel (React)

1. Admin panel `admin/` folder se `/admin` route par load hota hai. `admin-tailwind.css` Tailwind v4 utilities aur admin theme tokens dono define karta hai.
2. `index.html` <head> me fonts:
   - Plus Jakarta Sans (400-800)
   - Material Symbols Outlined (`...css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1`)
3. Route me use karo:
   ```jsx
   import AdminPanel from './admin/AdminPanel'
   <Route path="/admin" element={<AdminPanel />} />
   ```
