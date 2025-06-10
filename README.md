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
