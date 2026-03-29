# Run the app locally

## Quick steps

1. **Open a terminal** in the project folder:  
   `react-pdf-filler-app`

2. **Install dependencies** (first time, or after pulling changes):
   ```bash
   cd client-vite
   npm install
   ```

3. **Start the dev server**
   ```bash
   npm run dev
   ```

4. **Open in browser**  
   Go to: **http://localhost:5173**

---

## If you're at the repo root

```bash
cd client-vite
npm install
npm run dev
```

Then open **http://localhost:5173**.

---

## Optional: install everything (root + client + server)

From the **root** of the repo:

```bash
npm run install:all
npm run dev
```

(`npm run dev` from root runs the client-vite dev server.)

---

## Troubleshooting

- **Port in use** – Vite will offer another port (e.g. 5174). Use the URL it prints.
- **Module not found** – Run `npm install` again inside `client-vite`.
- **PDFs don’t load** – Ensure templates exist in `client-vite/public/templates/` (e.g. `GirlingTemplate.pdf`).
