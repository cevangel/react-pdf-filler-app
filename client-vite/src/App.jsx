// Importing React's useState hook to manage state and axios for making HTTP requests
import { useState, useEffect } from "react";
import axios from "axios"; //sends requests to servers
// CHANGED: We no longer POST to a server. You can safely remove axios later.
//          Keeping it now so your file still matches your original structure.

// CHANGED: Import pdf-lib for client-side PDF fill & flatten (no server needed).
import { PDFDocument, StandardFonts } from "pdf-lib";

/** PDF AcroForm field names -> readable labels (keys must match Acrobat exactly). */
const ACROFORM_FIELD_LABELS = {
  postbp: 'Post-Exercise BP',
  postpulse: 'Post-Exercise Pulse',
  timeIn: 'Time in',
  timeOut: 'Time out',
};

/** HTML time value HH:mm -> +30 minutes, same format (24h). */
function add30MinutesToTimeHHMM(hhmm) {
  if (!hhmm || typeof hhmm !== 'string') return '';
  const parts = hhmm.match(/^(\d{1,2}):(\d{2})$/);
  if (!parts) return '';
  let h = parseInt(parts[1], 10);
  let m = parseInt(parts[2], 10);
  if (h > 23 || m > 59) return '';
  let total = h * 60 + m + 30;
  total = ((total % (24 * 60)) + 24 * 60) % (24 * 60);
  const nh = Math.floor(total / 60);
  const nm = total % 60;
  return `${String(nh).padStart(2, '0')}:${String(nm).padStart(2, '0')}`;
}

/** HH:mm (24h) -> "h:mm AM/PM" for PDF text fields */
function formatTime12FromHHMM(hhmm) {
  if (!hhmm || typeof hhmm !== 'string') return '';
  const parts = hhmm.match(/^(\d{1,2}):(\d{2})$/);
  if (!parts) return hhmm;
  let h = parseInt(parts[1], 10);
  const m = parts[2];
  if (h > 23) return hhmm;
  const ap = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  return `${h12}:${m} ${ap}`;
}

/** YYYY-MM-DD (from date picker value) -> MM/DD/YYYY for PDF text field `date` */
function isoDateToMDY(iso) {
  if (!iso || typeof iso !== 'string') return '';
  const p = iso.trim().split('-');
  if (p.length !== 3) return iso;
  const [y, mo, d] = p;
  if (!y || !mo || !d || y.length !== 4) return iso;
  return `${mo.padStart(2, '0')}/${d.padStart(2, '0')}/${y}`;
}

/** YYYY-MM-DD -&gt; MM-DD-YYYY for download filename (slashes are invalid on Windows paths) */
function isoDateToFilenameDate(iso) {
  if (!iso || typeof iso !== 'string') return '';
  const p = iso.trim().split('-');
  if (p.length !== 3) return '';
  const [y, mo, d] = p;
  if (!y || !mo || !d) return '';
  return `${mo.padStart(2, '0')}-${d.padStart(2, '0')}-${y}`;
}

// Define the main component
function App() {
  
  // add dropdown menu for user to choose template
  const[selectedTemplate, setSelectedTemplate] = useState('GirlingTemplate');
  
  // Online/offline status for HIPAA field visibility
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  // Manual offline mode for HIPAA protection (default on: show date/bed mobility and treat as HIPAA-safe UI)
  const [manualOfflineMode, setManualOfflineMode] = useState(true);

  // After user edits time out, stop auto-updating it from time in (until refresh)
  const [timeOutUserEdited, setTimeOutUserEdited] = useState(false);
  
  // Infographic modal state
  const [showInfographic, setShowInfographic] = useState(false);
  const [infographicField, setInfographicField] = useState('');

  // Online/offline detection and warm-cache
  useEffect(() => {
    // Set up online/offline event listeners
    const handleOnline = () => {
      setIsOnline(true);
      console.log('App: Connection restored - HIPAA fields hidden');
    };
    
    const handleOffline = () => {
      setIsOnline(false);
      console.log('App: Connection lost - HIPAA fields visible');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Warm-cache all templates
    const warmCache = async () => {
      if ('serviceWorker' in navigator && 'caches' in window) {
        console.log('App: Warming cache for all templates...');
        
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
          '/templates/ReAssessRevival.pdf',
          '/templates/ReAssessInfinite.pdf',
          '/templates/DischargeRevival.pdf',
        ];

        // Prefetch templates in background (best-effort)
        templateUrls.forEach(async (url) => {
          try {
            const response = await fetch(url, { cache: 'reload' });
            if (response.ok) {
              console.log('App: Successfully warmed cache for:', url);
            }
          } catch (error) {
            console.log('App: Failed to warm cache for:', url, error.message);
          }
        });
      }
    };

    // Warm cache after a short delay to not interfere with initial load
    const timeoutId = setTimeout(warmCache, 2000);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearTimeout(timeoutId);
    };
  }, []);

  // Auto-fill date with today's date on mount (only if empty)
  useEffect(() => {
    setFormData(prev => {
      if (!prev.date) {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        const dateString = `${year}-${month}-${day}`;
        return { ...prev, date: dateString };
      }
      return prev;
    });
  }, []);

  // Auto-select "Discharge Summary" treatment type when OASIS DC template is selected
  useEffect(() => {
    if (selectedTemplate === 'OASISDC') {
      setFormData(prev => ({ ...prev, treatmentType: 'DC' }));
    }
  }, [selectedTemplate]);

  const handleTemplateChange = (e) => {
    setSelectedTemplate(e.target.value);
  }

  // Toggle manual offline mode for HIPAA protection
  const toggleOfflineMode = () => {
    setManualOfflineMode(!manualOfflineMode);
    console.log('App: Manual offline mode toggled:', !manualOfflineMode);
  }

  // Combined logic: show HIPAA fields when either actually offline OR manually in offline mode
  const showHipaaFields = !isOnline || manualOfflineMode;

  // useState hook creates a state variable 'formData' with various form fields.
  // setFormData is the function used to update this state.
  const [formData, setFormData] = useState({
    // HIPAA-sensitive fields (only visible when offline)
    patientName: "",
    date: "",
    // Non-sensitive fields
    treatmentType: "",
    diagnosis: 'M62.81',
    bp: "",
    pulse: "",
    postbp: "",
    postpulse: "",
    pmh: "",
    rom: "WFL",
    timeIn: "",
    mmt: "3+/5",
    timeOut: "",
    bedMob: "",
    transfers: "",
    gait: "",
    reassessDate: "",
    CheckBox: true,
    // OASIS-specific fields
    eatingOralHygieneUpperBodyDressing: "",
    toiletingBathingLowerBodyDressingFootwear: "",
    stairs: "",
    adlMedicalSafetySupervision: "",
    // OASIS DC additional fields
    noPressureUlcer: false,
    pressureUlcerNum: "",
    ADLMedSup: "",
    grooming: "",
    independentAOx3: false,
    // PDF fields set by independentAOx3 checkbox (managed programmatically)
    indep: false,
    dischageDisp: "",
    bims3: "",
    bims2: "",
    bims1: "",
    msChange: "",
    ms0: "",
    indep0: "",
    // ReAssess-specific fields
    continuingFunctionalProblems: "",
    progressMadeTowardPreviousGoals: "",
    revisedGoals: "",
    // New template fields
    doctorAndNumber: "",
    recentHxAndCC: "",
    DME: "",
    other: "",
  });

  const defaultFormData = {
    // HIPAA-sensitive fields (only visible when offline)
    patientName: "",
    date: "",
    // Non-sensitive fields
    treatmentType: "",
    diagnosis: 'M62.81',
    bp: "",
    pulse: "",
    postbp: "",
    postpulse: "",
    pmh: "",
    rom: "WFL",
    timeIn: "",
    mmt: "3+/5",
    timeOut: "",
    bedMob: "",
    transfers: "",
    gait: "",
    reassessDate: "",
    CheckBox: true,
    // OASIS-specific fields
    eatingOralHygieneUpperBodyDressing: "",
    toiletingBathingLowerBodyDressingFootwear: "",
    stairs: "",
    adlMedicalSafetySupervision: "",
    // OASIS DC additional fields
    noPressureUlcer: false,
    pressureUlcerNum: "",
    ADLMedSup: "",
    grooming: "",
    independentAOx3: false,
    // PDF fields set by independentAOx3 checkbox (managed programmatically)
    indep: false,
    dischageDisp: "",
    bims3: "",
    bims2: "",
    bims1: "",
    msChange: "",
    ms0: "",
    indep0: "",
    // ReAssess-specific fields
    continuingFunctionalProblems: "",
    progressMadeTowardPreviousGoals: "",
    revisedGoals: "",
    // New template fields
    doctorAndNumber: "",
    recentHxAndCC: "",
    DME: "",
    other: "",
  };

  // This function is triggered when a user types in any input field.
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
  
    if (type === 'checkbox') {
      // ... your existing checkbox logic ...
    } else {
      // SPECIAL CASE: bed mobility dropdown
      if (name === 'bedMobLevel') {
        setFormData(prev => {
          const level = value;
          return {
            ...prev,
            bedMobLevel: level,
            // Optional: also keep a text summary if your PDF has a text field `bedMob`
            bedMob: level,
            // Map level to specific PDF checkbox fields
            bedIndep: level === 'Independent',
            bedSBA: level === 'SBA',
            bedMin: level === 'Min A',
            bedMod: level === 'Mod A',
            bedMax: level === 'Max A',
            bedDep: level === 'Dependent',
          };
        });
        return;
      }

      if (name === 'timeIn') {
        setFormData((prev) => ({
          ...prev,
          timeIn: value,
          timeOut: timeOutUserEdited ? prev.timeOut : add30MinutesToTimeHHMM(value),
        }));
        return;
      }

      if (name === 'timeOut') {
        setTimeOutUserEdited(true);
        setFormData((prev) => ({ ...prev, timeOut: value }));
        return;
      }
  
      // Default behavior for other text/select fields
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };
  
  // Function to show infographic for Bed Mob/Transfers/Gait
  const showInfographicHelper = (fieldName) => {
    setInfographicField(fieldName);
    setShowInfographic(true);
  };

  // CHANGED: Pure client-side submit handler using pdf-lib.
  //          Replaces the previous axios POST to your server.
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default form behavior (page reload)

    try {
      // CHANGED: Load the selected template directly from /public/templates
      // Place your PDFs at: client-vite/public/templates/<TemplateName>.pdf
      const templateUrl = `/templates/${selectedTemplate}.pdf`;
      const templateBytes = await fetch(templateUrl).then((r) => r.arrayBuffer());

      // CHANGED: Load into a PDFDocument we can edit
      const pdfDoc = await PDFDocument.load(templateBytes, { updateMetadata: false });

      // CHANGED: Embed a base font to render consistent appearances
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

      // CHANGED: Try to fill AcroForm fields by matching names to your formData keys.
      // Any key that doesn't exist on the PDF will be skipped safely.
      let usedAcroForm = false;
      try {
        const form = pdfDoc.getForm();

        // Extract month, day, year from date field with spaces between characters
        const dateData = { ...formData };
        if (formData.date) {
          const dateParts = formData.date.split('-');
          if (dateParts.length === 3) {
            // Add spaces between each character for formatting
            dateData.month = dateParts[1].split('').join(' '); // YYYY-MM-DD format
            dateData.day = dateParts[2].split('').join(' ');
            dateData.year = dateParts[0].split('').join(' ');
            // Single AcroForm text field `date` typically expects one readable string
            dateData.date = isoDateToMDY(formData.date);
          }
        }
        if (dateData.timeIn) {
          dateData.timeIn = formatTime12FromHHMM(dateData.timeIn);
        }
        if (dateData.timeOut) {
          dateData.timeOut = formatTime12FromHHMM(dateData.timeOut);
        }

        // Attempt to set text fields
        for (const [key, value] of Object.entries(dateData)) {
          // Skip non-texty values if needed (you can keep pulse etc. if present in PDF)
          // We try text field first, then checkbox.
          try {
            const tf = form.getTextField(key);
            tf.setText(value == null ? "" : String(value));
            tf.updateAppearances(font, { fontSize: 9 });
            usedAcroForm = true;
            continue; // move to next key if text field found
          } catch {
            // Not a text field; try as a checkbox
          }

          try {
            const cb = form.getCheckBox(key);
            // Accept booleans or "true"/"false" strings
            const isChecked =
              typeof value === "boolean"
                ? value
                : String(value).toLowerCase() === "true";
            isChecked ? cb.check() : cb.uncheck();
            usedAcroForm = true;
            continue;
          } catch {
            // Not a checkbox; try radio group
          }

          try {
            const rg = form.getRadioGroup(key);
            const optionValue = value == null ? "" : String(value).trim();
            if (optionValue) {
              rg.select(optionValue);
              usedAcroForm = true;
            }
            continue;
          } catch {
            // Not a radio group — skip
          }
        }

        // Flatten only if we actually used form fields
        if (usedAcroForm) {
          form.flatten(); // CHANGED: bake values into the page so they print everywhere
        }
      } catch {
        // CHANGED: No AcroForm present — optional: draw text at coordinates.
        // If your template(s) lack fields, we can add a coordinate map fallback.
        // For now we just skip; ask and I’ll wire a drawText fallback map for you.
      }

      // CHANGED: Save & trigger a download right in the browser (no server round-trip)
      const bytes = await pdfDoc.save();
      const blob = new Blob([bytes], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      
      // Filename: "patientName treatmentType MM-DD-YYYY.pdf" (hyphens in date; / is invalid in Windows paths)
      let filename;
      const nameTrim = (formData.patientName || '').trim();
      const txTrim = (formData.treatmentType || '').trim();
      const dateTrim = (formData.date || '').trim();
      if (nameTrim && txTrim && dateTrim) {
        const cleanPatientName = nameTrim.replace(/[^a-zA-Z0-9\s-]/g, '').replace(/\s+/g, ' ').trim();
        const cleanTreatmentType = txTrim.replace(/[^a-zA-Z0-9\s-]/g, '').replace(/\s+/g, ' ').trim();
        const datePart = isoDateToFilenameDate(dateTrim);
        filename = `${cleanPatientName} ${cleanTreatmentType} ${datePart}.pdf`;
      } else if (formData.treatmentType) {
        // When treatment type is available but not HIPAA fields: "[treatment type] [template]"
        const cleanTreatmentType = formData.treatmentType.replace(/[^a-zA-Z0-9\s]/g, '').trim();
        filename = `${cleanTreatmentType} ${selectedTemplate}.pdf`;
      } else {
        // Default fallback: "[template]_filled.pdf"
        filename = `${selectedTemplate}_filled.pdf`;
      }
      
      link.download = filename;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      // CHANGED: Client-side error handling (e.g., missing PDF in /public/templates)
      console.error("Error generating PDF in the browser:", err);
      alert("Sorry, something went wrong generating the PDF.");
    }
  };

  // The component renders a form
  return (
    // py-8 px-4 = vertical padding 2rem, horizontal padding 1rem (mobile-friendly)
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      {/* NEW: Card container with max width, centered, white background, rounded corners, and shadow */}
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg overflow-hidden">  
        {/* NEW: Header section with gradient background */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
          {/* NEW: Main title with large text, bold font, white color, and center alignment */}
          <h1 className="text-2xl font-bold text-white text-center">
            📝 PDF Form Filler
          </h1>
          {/* NEW: Subtitle with smaller text and lighter blue color */}
          <p className="text-blue-100 text-sm text-center mt-1">
            Physical Therapy Evaluation Forms
          </p>
          <p className="text-center mt-3">
            <a
              href="/pt-eval.html"
              className="inline-block text-sm font-medium text-white bg-white/15 hover:bg-white/25 border border-white/40 rounded-lg px-3 py-1.5 transition-colors"
            >
              Open PT eval note builder (local HTML)
            </a>
          </p>
        </div>

        {/* NEW: Template selection section with border bottom */}
        <div className="px-6 py-4 border-b border-gray-200">
          {/* NEW: Label with proper spacing and typography */}
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Template:
          </label>
          {/* NEW: Styled select dropdown with focus states */}
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
            <option value="YourChoiceTx">Your Choice Treatement</option>
            <option value="RevivalTx">Revival Treatement</option>
            <option value="InfiniteTx">Infinite Treatement</option>
            <option value="ReAssessRevival">ReAssess Revival</option>
            <option value="ReAssessInfinite">ReAssess Infinite</option>
            <option value="DischargeRevival">Discharge Revival</option>
          </select>
          
          {/* Offline Function Button */}
          <div className="mt-4">
            <button
              type="button"
              onClick={toggleOfflineMode}
              className={`w-full px-4 py-2 rounded-md font-medium text-sm transition-all duration-200 ${
                manualOfflineMode
                  ? 'bg-green-600 hover:bg-green-700 text-white border-2 border-green-600'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border-2 border-gray-300'
              }`}
            >
              {manualOfflineMode ? (
                <>
                  🔒 Offline Mode Active - HIPAA Protected
                </>
              ) : (
                <>
                  🌐 Enable Offline Function (HIPAA Safe Mode)
                </>
              )}
            </button>
            <p className="text-xs text-gray-500 mt-1 text-center">
              {manualOfflineMode 
                ? "All data stays on your device - no network transmission" 
                : "Click to work offline and protect patient data"
              }
            </p>
          </div>
        </div>

        {/* Dynamic HIPAA warning based on connection status and manual mode */}
        <div className={`px-6 py-4 border-b ${showHipaaFields ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
          <div className="flex items-start">
            <div className="flex-shrink-0">
              {/* Dynamic icon based on HIPAA field visibility */}
              {showHipaaFields ? (
                <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              )}
            </div>
            <div className="ml-3">
              <p className={`text-sm font-medium ${showHipaaFields ? 'text-green-700' : 'text-red-700'}`}>
                {showHipaaFields ? 'HIPAA Protected Mode Active' : 'HIPAA Notice - Online Mode'}
              </p>
              <p className={`text-xs mt-1 ${showHipaaFields ? 'text-green-600' : 'text-red-600'}`}>
                {showHipaaFields ? (
                  <>
                    <strong>HIPAA PROTECTED:</strong> Extra fields (date, bed mobility) are visible. 
                    {manualOfflineMode ? ' Manual offline mode enabled - ' : ' Device offline - '}
                    All data stays on your device and is not transmitted over the network.
                  </>
                ) : (
                  <>
                    <strong>ONLINE:</strong> Use the &ldquo;Offline Function&rdquo; button above to hide
                    sensitive fields and enable HIPAA-safe mode. Patient name and date below are only used
                    locally for the PDF; nothing is uploaded by this app.
                  </>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* NEW: Form section with proper spacing */}
        {/* px-6 py-4 = consistent padding, space-y-4 = vertical spacing between form elements */}
        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
          {/* HIPAA-sensitive fields - visible when offline OR manual offline mode */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              Patient name
            </label>
            <input
              name="patientName"
              type="text"
              autoComplete="off"
              placeholder="Full name as it should appear on the PDF"
              value={formData.patientName}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            />
          </div>

          {showHipaaFields && (
            <>
              <div className="space-y-1">
  <label className="block text-sm font-medium text-gray-700">
    Bed Mobility
  </label>
  <select
    name="bedMobLevel"
    value={formData.bedMobLevel}
    onChange={handleChange}
    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
  >
    <option value="">Select bed mobility...</option>
    <option value="Independent">Independent</option>
    <option value="SBA">SBA</option>
    <option value="CGA">CGA</option>        {/* text-only unless you add a bedCGA field */}
    <option value="Min A">Min A</option>
    <option value="Mod A">Mod A</option>
    <option value="Max A">Max A</option>
    <option value="Dependent">Dependent</option>
  </select>
</div>
              
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">
                  Date (MM/DD/YYYY on PDF)
                </label>
                <input
                  name="date"
                  type="date"
                  value={formData.date}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
                {formData.date ? (
                  <p className="text-xs text-gray-600">
                    On PDF: <span className="font-medium">{isoDateToMDY(formData.date)}</span>
                  </p>
                ) : null}
              </div>
            </>
          )}

          {/* Treatment Type field - always visible */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              Treatment Type:
            </label>
            <select
              name="treatmentType"
              value={formData.treatmentType}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            >
              <option value="">Select treatment type...</option>
              <option value="IE">Initial Evaluation</option>
              <option value="Tx">Treatment</option>
              <option value="ReAssess">Reassessment</option>
              <option value="DC">Discharge Summary</option>
              <option value="ReEval">Re-evaluation</option>
            </select>
          </div>

          {/* Time in/out: native time pickers; PDF gets 12h text (e.g. 2:30 PM) */}
          {!(selectedTemplate === 'OASISDC') && (
            <>
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">
                  {ACROFORM_FIELD_LABELS.timeIn}
                </label>
                <input
                  name="timeIn"
                  type="time"
                  step={60}
                  value={formData.timeIn}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
                <p className="text-xs text-gray-500">
                  Time out defaults to 30 minutes after time in. Editing time out turns off auto-update.
                </p>
              </div>
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">
                  {ACROFORM_FIELD_LABELS.timeOut}
                </label>
                <input
                  name="timeOut"
                  type="time"
                  step={60}
                  value={formData.timeOut}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
              </div>
            </>
          )}

          {/* Standard form fields for all templates */}
          {Object.keys(formData)
            .filter(field => !field.includes('eatingOralHygiene') && 
                            !field.includes('toiletingBathing') && 
                            !field.includes('stairs') && 
                            !field.includes('adlMedical') &&
                            field !== 'patientName' && 
                            field !== 'date' &&
                            field !== 'treatmentType' &&
                            field !== 'timeIn' &&
                            field !== 'timeOut' &&
                            field !== 'continuingFunctionalProblems' &&
                            field !== 'progressMadeTowardPreviousGoals' &&
                            field !== 'revisedGoals' &&
                            field !== 'noPressureUlcer' &&
                            field !== 'pressureUlcerNum' &&
                            field !== 'ADLMedSup' &&
                            field !== 'grooming' &&
                            field !== 'independentAOx3' &&
                            field !== 'indep' &&
                            field !== 'dischageDisp' &&
                            field !== 'bims3' &&
                            field !== 'bims2' &&
                            field !== 'bims1' &&
                            field !== 'msChange' &&
                            field !== 'ms0' &&
                            field !== 'indep0' &&
                            // Hide these fields when OASIS DC is selected
                            !(selectedTemplate === 'OASISDC' && (
                              field === 'diagnosis' ||
                              field === 'bp' ||
                              field === 'pulse' ||
                              field === 'postbp' ||
                              field === 'postpulse' ||
                              field === 'pmh' ||
                              field === 'rom' ||
                              field === 'timeIn' ||
                              field === 'timeOut' ||
                              field === 'reassessDate' ||
                              field === 'doctorAndNumber' ||
                              field === 'recentHxAndCC' ||
                              field === 'DME'
                            )))
            .map((field) => {
              const isOasisField = selectedTemplate === 'OASISDC' && (field === 'bedMob' || field === 'transfers' || field === 'gait');
              const fieldLabel =
                ACROFORM_FIELD_LABELS[field] ??
                field.replace(/([A-Z])/g, ' $1').trim();
              return (
                <div key={field} className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700 capitalize flex items-center gap-2">
                    {fieldLabel}:
                    {isOasisField && (
                      <button
                        type="button"
                        onClick={() => showInfographicHelper(field)}
                        className="text-blue-500 hover:text-blue-700 focus:outline-none"
                        title="Click for coding guide"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </button>
                    )}
                  </label>
                  <input
                    name={field}
                    placeholder={`Enter ${fieldLabel.toLowerCase()}`}
                    value={formData[field]}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  />
                </div>
              );
            })}

          {/* OASIS-specific form fields - only show when OASIS DC template is selected */}
          {selectedTemplate === 'OASISDC' && (
            <>
              <div className="border-t border-gray-200 pt-4 mt-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">OASIS DC-Specific Fields</h3>
              </div>
              
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                  Eating/Oral Hygiene/Upper Body Dressing:
                  <button
                    type="button"
                    onClick={() => showInfographicHelper('eatingOralHygieneUpperBodyDressing')}
                    className="text-blue-500 hover:text-blue-700 focus:outline-none"
                    title="Click for GG0130 Self-Care coding guide"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </button>
                </label>
                <input
                  name="eatingOralHygieneUpperBodyDressing"
                  placeholder="Enter Eating/Oral Hygiene/Upper Body Dressing"
                  value={formData.eatingOralHygieneUpperBodyDressing}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                  Toileting/Bathing/Lower Body Dressing/Footwear:
                  <button
                    type="button"
                    onClick={() => showInfographicHelper('toiletingBathingLowerBodyDressingFootwear')}
                    className="text-blue-500 hover:text-blue-700 focus:outline-none"
                    title="Click for GG0130 Self-Care coding guide"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </button>
                </label>
                <input
                  name="toiletingBathingLowerBodyDressingFootwear"
                  placeholder="Enter Toileting/Bathing/Lower Body Dressing/Footwear"
                  value={formData.toiletingBathingLowerBodyDressingFootwear}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                  Stairs (12 steps):
                  <button
                    type="button"
                    onClick={() => showInfographicHelper('stairs')}
                    className="text-blue-500 hover:text-blue-700 focus:outline-none"
                    title="Click for coding guide"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </button>
                </label>
                <input
                  name="stairs"
                  placeholder="Enter Stairs"
                  value={formData.stairs}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                  ADL/Medical/Safety Supervision:
                  <button
                    type="button"
                    onClick={() => showInfographicHelper('adlMedicalSafetySupervision')}
                    className="text-blue-500 hover:text-blue-700 focus:outline-none"
                    title="Click for coding guide"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </button>
                </label>
                <input
                  name="adlMedicalSafetySupervision"
                  placeholder="Enter ADL/Medical/Safety Supervision"
                  value={formData.adlMedicalSafetySupervision}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
              </div>

              {/* No Pressure Ulcer Checkbox */}
              <div className="space-y-1">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    name="noPressureUlcer"
                    checked={formData.noPressureUlcer}
                    onChange={handleChange}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">No Pressure Ulcer &gt;= Stage 2?</span>
                </label>
              </div>

              {/* Independent, AOx3 Checkbox */}
              <div className="space-y-1">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    name="independentAOx3"
                    checked={formData.independentAOx3}
                    onChange={handleChange}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Independent, AOx3, no disruptive behaviors/pain</span>
                </label>
              </div>

              {/* Types/Sources of Assistance Dropdown */}
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">
                  Types/Sources of Assistance:
                </label>
                <select
                  name="ADLMedSup"
                  value={formData.ADLMedSup}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                >
                  <option value="">Select assistance type...</option>
                  <option value="0">0. No assist needed (Indep/No needs)</option>
                  <option value="1">1. Non-agency caregiver(s) currently provide assistance</option>
                  <option value="2">2. Non-agency caregiver(s) need training/support to provide assistance</option>
                  <option value="3">3. Non-agency caregiver(s) not likely to provide assistance OR unclear</option>
                  <option value="4">4. Assistance needed but no non-agency caregiver(s) available</option>
                </select>
              </div>

              {/* Grooming/Dressing Dropdown */}
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">
                  Grooming/Dressing Upper and Lower Body:
                </label>
                <select
                  name="grooming"
                  value={formData.grooming}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                >
                  <option value="">Select grooming level...</option>
                  <option value="0">0. Able to do unaided with/without AD or adapted methods</option>
                  <option value="1">1. Able if placed within reach</option>
                  <option value="2">2. Needs assist</option>
                  <option value="3">3. Entirely dependent</option>
                </select>
              </div>
            </>
          )}

          {/* ReAssess-specific form fields - only show when ReAssessInfinite template is selected */}
          {selectedTemplate === 'ReAssessInfinite' && (
            <>
              <div className="border-t border-gray-200 pt-4 mt-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">ReAssessment Fields</h3>
              </div>
              
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">
                  Continuing Functional Problems:
                </label>
                <textarea
                  name="continuingFunctionalProblems"
                  placeholder="Enter continuing functional problems..."
                  value={formData.continuingFunctionalProblems}
                  onChange={handleChange}
                  rows="4"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm resize-vertical"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">
                  Progress Made Toward Previous Goals:
                </label>
                <textarea
                  name="progressMadeTowardPreviousGoals"
                  placeholder="Enter progress made toward previous goals..."
                  value={formData.progressMadeTowardPreviousGoals}
                  onChange={handleChange}
                  rows="4"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm resize-vertical"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">
                  Revised Goals:
                </label>
                <textarea
                  name="revisedGoals"
                  placeholder="Enter revised goals..."
                  value={formData.revisedGoals}
                  onChange={handleChange}
                  rows="4"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm resize-vertical"
                />
              </div>
            </>
          )}
          {/* w-full = full width, bg-gradient-to-r = right gradient, from-blue-600 to-indigo-600 = blue to indigo */}
          {/* text-white = white text, font-medium = 500 weight, py-3 px-4 = padding */}
          {/* rounded-md = medium border radius, hover:from-blue-700 hover:to-indigo-700 = darker on hover */}
          {/* focus:outline-none = remove default focus outline, focus:ring-2 = blue focus ring */}
          {/* transition-all duration-200 = smooth transitions, shadow-lg = large shadow */}
          <button 
            type="submit" 
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium py-3 px-4 rounded-md hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 shadow-lg"
          >
            📄 Generate PDF
          </button>
        </form>

        {/* NEW: Footer section with light gray background */}
        {/* px-6 py-3 = padding, bg-gray-50 = light gray background, border-t border-gray-200 = top border */}
        <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
          {/* NEW: Footer text with small size and gray color */}
          {/* text-xs = 12px, text-gray-500 = medium gray, text-center = center alignment */}
          <p className="text-xs text-gray-500 text-center">
            Built for Physical Therapists • MERN Stack
          </p>
        </div>
      </div>

      {/* Infographic Modal */}
      {showInfographic && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setShowInfographic(false)}>
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800">
                {(infographicField === 'eatingOralHygieneUpperBodyDressing' || infographicField === 'toiletingBathingLowerBodyDressingFootwear') ? (
                  'GG0130. Self-Care Coding Guide'
                ) : (
                  `OASIS DC Coding Guide - ${
                    infographicField === 'bedMob' ? 'Bed Mobility' : 
                    infographicField === 'transfers' ? 'Transfers' : 
                    infographicField === 'gait' ? 'Gait' :
                    infographicField === 'stairs' ? 'Stairs' :
                    infographicField === 'adlMedicalSafetySupervision' ? 'ADL/Medical/Safety Supervision' :
                    'Activity'
                  }`
                )}
              </h2>
              <button
                onClick={() => setShowInfographic(false)}
                className="text-gray-500 hover:text-gray-700 focus:outline-none"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6">
              {(infographicField === 'eatingOralHygieneUpperBodyDressing' || infographicField === 'toiletingBathingLowerBodyDressingFootwear') && (
                <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm font-semibold text-blue-900 mb-2">GG0130. Self-Care</p>
                  <p className="text-sm text-blue-800">
                    Code the patient's usual performance at Discharge for each activity using the 6-point scale. 
                    If activity was not attempted at Discharge, code the reason.
                  </p>
                </div>
              )}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Safety and Quality of Performance</h3>
                <p className="text-sm text-gray-600 mb-4">
                  {(infographicField === 'eatingOralHygieneUpperBodyDressing' || infographicField === 'toiletingBathingLowerBodyDressingFootwear') ? (
                    <>
                      If helper assistance is required because patient's performance is unsafe or of poor quality, 
                      score according to amount of assistance provided. Activities may be completed with or without assistive devices.
                    </>
                  ) : (
                    <>
                      If helper assistance is required because a patient's performance is unsafe or of poor quality, the score should be assigned according to the amount of assistance provided. Activities may be completed with or without assistive devices.
                    </>
                  )}
                </p>
                <div className="space-y-3">
                  <div className="border-l-4 border-blue-500 pl-4">
                    <p className="font-semibold text-gray-800">06. Independent</p>
                    <p className="text-sm text-gray-600">The patient completes the activity by themself with no assistance from a helper.</p>
                  </div>
                  <div className="border-l-4 border-blue-400 pl-4">
                    <p className="font-semibold text-gray-800">05. Setup or clean-up assistance</p>
                    <p className="text-sm text-gray-600">A helper sets up or cleans up; the patient completes the activity. The helper assists only prior to or following the activity.</p>
                  </div>
                  <div className="border-l-4 border-blue-300 pl-4">
                    <p className="font-semibold text-gray-800">04. Supervision or touching assistance</p>
                    <p className="text-sm text-gray-600">A helper provides verbal cues and/or touching/steadying and/or contact guard assistance as the patient completes the activity. Assistance may be provided throughout the activity or intermittently.</p>
                  </div>
                  <div className="border-l-4 border-yellow-400 pl-4">
                    <p className="font-semibold text-gray-800">03. Partial/moderate assistance</p>
                    <p className="text-sm text-gray-600">A helper does LESS THAN HALF the effort. The helper lifts, holds, or supports the trunk or limbs, but provides less than half the effort.</p>
                  </div>
                  <div className="border-l-4 border-orange-400 pl-4">
                    <p className="font-semibold text-gray-800">02. Substantial/maximal assistance</p>
                    <p className="text-sm text-gray-600">A helper does MORE THAN HALF the effort. The helper lifts or holds the trunk or limbs and provides more than half the effort.</p>
                  </div>
                  <div className="border-l-4 border-red-500 pl-4">
                    <p className="font-semibold text-gray-800">01. Dependent</p>
                    <p className="text-sm text-gray-600">A helper does ALL of the effort. The patient does none of the effort to complete the activity. Alternatively, the assistance of 2 or more helpers is required for the patient to complete the activity.</p>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">If activity was not attempted, code reason:</h3>
                <div className="space-y-2">
                  <div>
                    <p className="font-semibold text-gray-800">07. Patient refused</p>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">09. Not applicable</p>
                    <p className="text-sm text-gray-600">Not attempted, and the patient did not perform this activity prior to the current illness, exacerbation, or injury.</p>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">10. Not attempted due to environmental limitations</p>
                    <p className="text-sm text-gray-600">(e.g., lack of equipment, weather constraints)</p>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">88. Not attempted due to medical conditions or safety concerns</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App; // Make this component available for use in other files
