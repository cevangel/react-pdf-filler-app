# 📝 React PDF Filler App

A React web application that helps physical therapists quickly fill out evaluation PDF forms using a web interface. The app generates downloadable, pre-filled PDF files with clinical fields like BP, ROM, MMT, and more.

## 🎯 What This App Does

This application provides a user-friendly form interface where physical therapists can:
- Select from multiple PDF template types (Girling, OASIS, Revival, etc.)
- Fill out clinical evaluation data through a web form
- Generate and download completed PDFs with all form fields automatically filled
- Work offline (PWA support) for HIPAA compliance
- Access coding guides for OASIS-specific fields

**Main Flow:** User fills form → App loads PDF template → pdf-lib fills form fields → PDF is generated and downloaded client-side (no server needed)

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm (comes with Node.js)

### Installation & Running

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd react-pdf-filler-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   cd client-vite
   npm install
   ```

3. **Start the development server**
   ```bash
   cd client-vite
   npm run dev
   ```

4. **Open your browser**
   - Navigate to `http://localhost:5173`
   - The app should load and be ready to use!

### Alternative: Install All at Once

From the root directory:
```bash
npm run install:all  # Installs root, client, and server dependencies
npm run dev          # Starts the client development server
```

## 📦 Project Structure

```
react-pdf-filler-app/
├── client-vite/          # React frontend (Vite)
│   ├── src/
│   │   ├── App.jsx      # Main application component
│   │   └── main.jsx     # Entry point
│   ├── public/
│   │   └── templates/   # PDF template files
│   └── package.json
├── server/              # Express backend (optional, not currently used)
│   ├── templates/       # PDF templates (backup)
│   └── server.js
├── package.json         # Root package.json with convenience scripts
└── README.md
```

## 🛠 Available Scripts

### Root Level
- `npm run install:all` - Install all dependencies (root, client, server)
- `npm run dev` - Start client development server
- `npm run build` - Build client for production
- `npm run lint` - Run ESLint on client code
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting without changing files

### Client (client-vite/)
- `npm run dev` - Start Vite dev server (http://localhost:5173)
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🎨 Code Quality

### Linting
This project uses **ESLint** to catch potential bugs and enforce code quality:
- **What it does:** Analyzes your code for errors, potential bugs, and style issues
- **Configuration:** `client-vite/eslint.config.js`
- **Run it:** `npm run lint` (from root) or `cd client-vite && npm run lint`

### Formatting
This project uses **Prettier** to maintain consistent code style:
- **What it does:** Automatically formats your code (spacing, quotes, semicolons, etc.)
- **Configuration:** `.prettierrc` in root directory
- **Run it:** `npm run format` (formats all files) or `npm run format:check` (checks only)

**Why both?** ESLint catches logic errors and enforces best practices. Prettier handles code style. They work together to keep code clean and consistent.

## 🔒 Security & Privacy

⚠️ **HIPAA Notice:** This is a demo app and **not HIPAA compliant** for production use. 

- **No secrets/keys in code:** All sensitive data should be added manually after download
- **Client-side processing:** PDF generation happens entirely in the browser (no data sent to servers)
- **Offline mode:** App can work offline for additional privacy protection
- **No PHI in repo:** Patient names and dates are only visible when offline mode is enabled

## 📋 Features

- ✅ Multiple PDF template support
- ✅ Client-side PDF generation (no server required)
- ✅ Offline/PWA support
- ✅ Responsive design (mobile-friendly)
- ✅ OASIS coding guides
- ✅ Automatic date formatting
- ✅ Dynamic form fields based on template selection

## 🌐 Demo

**Live Demo:** [Add your deployed URL here]

Example: `https://your-app.netlify.app` or `https://your-app.vercel.app`

## 🏗 How It Works (Technical Overview)

1. **User Input:** User fills out form fields in React component
2. **Template Selection:** User selects a PDF template from dropdown
3. **PDF Loading:** App fetches PDF template from `/public/templates/`
4. **Form Filling:** pdf-lib library fills AcroForm fields matching form data keys
5. **PDF Generation:** Filled PDF is flattened and converted to bytes
6. **Download:** Browser triggers download of the generated PDF file

All processing happens client-side - no backend server is required for PDF generation.

## 📚 Technologies Used

- **React 19** - UI framework
- **Vite** - Build tool and dev server
- **pdf-lib** - PDF manipulation library
- **Tailwind CSS** - Styling
- **ESLint** - Code linting
- **Prettier** - Code formatting

## 🤝 Contributing

This is a portfolio project. For questions or suggestions, please open an issue.

## 📄 License

ISC

## 👨‍⚕️ Author

Built by a physical therapist transitioning into software development (MERN Stack).

---

## 📖 Additional Resources

- [**Run locally**](RUN_LOCALLY.md) - Short steps to run the app on your machine
- [**Radio buttons**](RADIO_BUTTONS.md) - Use Adobe Acrobat radio groups with this app
- [FAQ](client-vite/FAQ.md) - Detailed information about HIPAA, privacy, and offline mode
- [Interview Guide](INTERVIEW_GUIDE.md) - Technical explanations for interviews (data flow, validation, error handling, promises)
- [Promises Guide](PROMISES_GUIDE.md) - Complete explanation of how promises are used in this app
- [Linting & Formatting Guide](LINTING_AND_FORMATTING.md) - Explanation of ESLint and Prettier
