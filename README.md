# 📝 React PDF Filler App

This app lets physical therapists quickly fill out evaluation PDFs using a web form. It generates downloadable, pre-filled PDF files with clinical fields like BP, ROM, MMT, and more.

⚠️ **HIPAA Notice:** This is a demo app and **not HIPAA compliant**. Do not enter real patient names, addresses, or dates of birth. All personally identifying information (PHI) must be added manually after download.

---

## 🚀 Features

- Fill out standardized forms using a web interface
- Choose between multiple PDF templates
- Auto-generates and downloads the completed PDF
- Responsive layout (mobile-friendly)
- Backend PDF generation using `pdf-lib`

---

## 🏗 Project Structure

react-pdf-filler-app/
├── client/ # React frontend
│ └── App.js
├── server/ # Node.js/Express backend
│ ├── templates/ # Folder for PDF template files
│ └── server.js
├── README.md


---
## Running the application:
Run the Development Server
1. Navigate to the Client Directory
cd client-vite
2. Install Dependencies (if needed)
npm install
3. Start the Development Server
npm run dev
This will start the Vite development server, typically on http://localhost:5173

## 📦 Setup Instructions

### 1. Install Dependencies

From the root of the project:

```bash
cd server
npm install

cd ../client
npm install

2. Run Locally

In one terminal tab:

bash
Copy
Edit
cd server
node server.js

In another terminal tab:

bash
Copy
Edit
cd client
npm start

-----------------------------------------------------
📁 Templates
Put PDF templates inside:

bash
Copy
Edit
server/templates/
Make sure form fields are properly named and match the expected input keys.

-----------------------------------------------------
✅ To-Do / Roadmap
 Add login for internal use

 Remove patient-identifying fields from public UI

 Make mobile-friendly

 Auto-detect available templates in folder


----------------------------------------------------
👨‍⚕️ Author
Built by a physical therapist transitioning into software development (MERN Stack).

yaml
Copy
Edit

---

Let me know if you'd like to auto-fill parts like your name, GitHub URL, or how to add badges.

------------------------------------------------------
## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)


Absolutely! Here's a comprehensive guide for your README:

---

# 📄 Adding New PDF Templates

This guide explains how to add new PDF template files to the application.

## Prerequisites

- PDF template file (with or without AcroForm fields)
- Basic understanding of Git and npm commands

---

## Step 1: Add the PDF File

1. **Place your PDF file** in the `client-vite/public/templates/` directory
   ```
   client-vite/public/templates/YourNewTemplate.pdf
   ```

2. **Naming Convention:**
   - Use PascalCase (e.g., `MyNewTemplate.pdf`)
   - No spaces or special characters
   - Keep names descriptive but concise

---

## Step 2: Update the Service Worker

Add your new template to the cache list in `client-vite/public/sw.js`:

```javascript
// Template PDF files found in /public/templates
const TEMPLATE_FILES = [
  '/templates/AmericareInfiniteTemplate.pdf',
  '/templates/ExtendedTemplate.pdf',
  '/templates/GirlingTemplate.pdf',
  '/templates/OASIS.pdf',
  '/templates/OASISprev.pdf',
  '/templates/RevivalTemplate.pdf',
  '/templates/TestTemplate.pdf',
  '/templates/YourChoiceTemplate.pdf',
  '/templates/YourNewTemplate.pdf',  // ← Add your new template here
];
```

**Important:** Also bump the cache version to force updates:
```javascript
const CACHE_NAME = 'pt-pdf-filler-v6';  // Increment the version number
```

---

## Step 3: Update the Template Dropdown

Add your template to the dropdown in `client-vite/src/App.jsx` (around line 269):

```jsx
<select 
  onChange={handleTemplateChange} 
  value={selectedTemplate}
  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
>
  <option value="GirlingTemplate">Girling Template</option>
  <option value="YourChoiceTemplate">Your Choice Template</option>
  <option value="ExtendedTemplate">Extended Template</option>
  <option value="AmericareInfiniteTemplate">Americare/Infinite</option>
  <option value="OASISDC">OASIS DC</option>
  <option value="RevivalTemplate">Revival Template</option>
  <option value="YourChoiceTx">Your Choice Treatment</option>
  <option value="RevivalTx">Revival Treatment</option>
  <option value="YourNewTemplate">Your New Template</option>  {/* ← Add this */}
</select>
```

**Note:** The `value` should match your filename without the `.pdf` extension.

---

## Step 4: Update Warm-Cache Function

Add your template to the warm-cache list in `client-vite/src/App.jsx` (around line 40):

```javascript
const templateUrls = [
  '/templates/AmericareInfiniteTemplate.pdf',
  '/templates/ExtendedTemplate.pdf',
  '/templates/GirlingTemplate.pdf',
  '/templates/OASIS.pdf',
  '/templates/OASISprev.pdf',
  '/templates/RevivalTemplate.pdf',
  '/templates/TestTemplate.pdf',
  '/templates/YourChoiceTemplate.pdf',
  '/templates/YourChoiceTx.pdf',
  '/templates/RevivalTx.pdf',
  '/templates/InfiniteTx.pdf',
  '/templates/YourNewTemplate.pdf',  // ← Add this
];
```

---

## Step 5: Test Locally

1. **Start the development server:**
   ```bash
   cd client-vite
   npm run dev
   ```

2. **Open the app** in your browser: `http://localhost:5173`

3. **Test your new template:**
   - Select your new template from the dropdown
   - Fill out the form
   - Generate PDF
   - Verify the PDF downloads correctly

4. **Test offline functionality:**
   - Open DevTools (F12)
   - Go to Network tab
   - Check "Offline"
   - Try generating a PDF with your new template
   - Should work without internet connection

---

## Step 6: Deploy to Production

1. **Commit your changes:**
   ```bash
   git add .
   git commit -m "feat: add YourNewTemplate.pdf"
   git push
   ```

2. **Wait for Netlify deployment** (1-2 minutes)

3. **Clear cache on live site:**
   - Visit your site
   - Open DevTools (F12)
   - Application → Service Workers → Unregister
   - Application → Storage → Clear site data
   - Hard refresh: `Ctrl + Shift + R`

---

## Step 7: Test on Mobile

**Clear cache and reinstall:**

**iPhone:**
1. Settings → Safari → Clear History and Website Data
2. Visit the site in Safari
3. Tap Share → Add to Home Screen

**Android:**
1. Chrome → Settings → Privacy → Clear browsing data
2. Visit the site in Chrome
3. Menu → Add to Home screen

---

## Troubleshooting

### Template not showing in dropdown
- Check that the filename matches exactly (case-sensitive)
- Verify the file is in `client-vite/public/templates/`
- Check console for errors

### PDF generation fails
- Verify the PDF file is not corrupted
- Test opening the PDF in a PDF viewer
- Check browser console for errors
- Ensure the PDF has proper AcroForm fields (or content will be empty)

### Template not available offline
- Verify template is in `TEMPLATE_FILES` array in `sw.js`
- Check cache version was bumped
- Clear browser cache and reload
- Check Application → Cache Storage in DevTools

### Changes not showing on live site
- Wait for Netlify deployment to complete
- Clear service worker and cache
- Try incognito/private mode first
- Bump service worker cache version

---

## PDF Template Requirements

### For Best Results:
- **AcroForm Fields:** PDF should have form fields that match your form data field names
- **Field Names:** Should match JavaScript form field names (e.g., `patientName`, `diagnosis`, `treatmentType`)
- **Flattening:** The app automatically flattens fields after filling

### Without AcroForm Fields:
- The PDF will still be downloadable
- But form data won't be automatically filled
- Users will need to fill it manually

---

## Quick Reference Checklist

- [ ] Add PDF file to `client-vite/public/templates/`
- [ ] Update `TEMPLATE_FILES` array in `client-vite/public/sw.js`
- [ ] Bump `CACHE_NAME` version in `sw.js`
- [ ] Add dropdown option in `client-vite/src/App.jsx` (template dropdown)
- [ ] Add to warm-cache URLs in `App.jsx`
- [ ] Test locally with `npm run dev`
- [ ] Test offline functionality
- [ ] Commit and push to Git
- [ ] Clear cache on live site
- [ ] Test on mobile

---

## Example: Complete Addition

Here's a complete example of adding `PhysicalTherapyEval.pdf`:

**1. File location:**
```
client-vite/public/templates/PhysicalTherapyEval.pdf
```

**2. sw.js update:**
```javascript
const CACHE_NAME = 'pt-pdf-filler-v6';  // Bumped from v5

const TEMPLATE_FILES = [
  // ... existing templates
  '/templates/PhysicalTherapyEval.pdf',
];
```

**3. App.jsx dropdown:**
```jsx
<option value="PhysicalTherapyEval">Physical Therapy Evaluation</option>
```

**4. App.jsx warm-cache:**
```javascript
'/templates/PhysicalTherapyEval.pdf',
```

**5. Test and deploy:**
```bash
npm run dev  # Test locally
git add .
git commit -m "feat: add Physical Therapy Evaluation template"
git push
```

---

## Need Help?

If you encounter issues adding templates:
1. Check the browser console for errors
2. Verify all file paths are correct
3. Ensure the PDF is not corrupted
4. Test in incognito mode to rule out caching issues

---

This guide covers the complete process from start to finish. Let me know if you need any clarification! 🚀