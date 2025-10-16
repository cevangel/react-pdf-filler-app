// Importing React's useState hook to manage state and axios for making HTTP requests
import { useState, useEffect } from "react";
import axios from "axios"; //sends requests to servers
// CHANGED: We no longer POST to a server. You can safely remove axios later.
//          Keeping it now so your file still matches your original structure.

// CHANGED: Import pdf-lib for client-side PDF fill & flatten (no server needed).
import { PDFDocument, StandardFonts } from "pdf-lib";

// Define the main component
function App() {
  
  // add dropdown menu for user to choose template
  const[selectedTemplate, setSelectedTemplate] = useState('GirlingTemplate');
  
  // Online/offline status for HIPAA field visibility
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  // Manual offline mode for HIPAA protection
  const [manualOfflineMode, setManualOfflineMode] = useState(false);

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
    // New template fields
    doctorAndNumber: "",
    recentHxAndCC: "",
    DME: "",
    other: "",
  };

  // This function is triggered when a user types in any input field.
  const handleChange = (e) => {
    // Dynamically update the field that changed by spreading the old state and updating the field that matches the input's name.
    setFormData({ ...formData, [e.target.name]: e.target.value });
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

        // Attempt to set text fields
        for (const [key, value] of Object.entries(formData)) {
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
            // Not a checkbox either — ignore silently
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
      
      // Generate filename based on online/offline status and available data
      let filename;
      if (showHipaaFields && formData.patientName && formData.treatmentType && formData.date) {
        // When HIPAA fields are visible and filled: "[patientName] [treatment type] [date]"
        const cleanPatientName = formData.patientName.replace(/[^a-zA-Z0-9\s]/g, '').trim();
        const cleanTreatmentType = formData.treatmentType.replace(/[^a-zA-Z0-9\s]/g, '').trim();
        const cleanDate = formData.date.replace(/[^a-zA-Z0-9]/g, '').replace(/(\d{4})(\d{2})(\d{2})/, '$1.$2.$3');
        filename = `${cleanPatientName} ${cleanTreatmentType} ${cleanDate}.pdf`;
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
                    <strong>HIPAA PROTECTED:</strong> Patient name and date fields are visible. 
                    {manualOfflineMode ? ' Manual offline mode enabled - ' : ' Device offline - '}
                    All data stays on your device and is not transmitted over the network.
                  </>
                ) : (
                  <>
                    <strong>ONLINE:</strong> Patient name and date fields are hidden for HIPAA compliance. 
                    Use the "Offline Function" button above to enable HIPAA-safe mode.
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
          {showHipaaFields && (
            <>
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">
                  Patient Name:
                </label>
                <input
                  name="patientName"
                  placeholder="Enter patient name"
                  value={formData.patientName}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
              </div>
              
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">
                  Date:
                </label>
                <input
                  name="date"
                  type="date"
                  value={formData.date}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
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

          {/* Standard form fields for all templates */}
          {Object.keys(formData)
            .filter(field => !field.includes('eatingOralHygiene') && 
                            !field.includes('toiletingBathing') && 
                            !field.includes('stairs') && 
                            !field.includes('adlMedical') &&
                            field !== 'patientName' && 
                            field !== 'date' &&
                            field !== 'treatmentType')
            .map((field) => (
              <div key={field} className="space-y-1">
                <label className="block text-sm font-medium text-gray-700 capitalize">
                  {field.replace(/([A-Z])/g, ' $1').trim()}:
                </label>
                <input
                  name={field}
                  placeholder={`Enter ${field.replace(/([A-Z])/g, ' $1').toLowerCase().trim()}`}
                  value={formData[field]}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
              </div>
            ))}

          {/* OASIS-specific form fields - only show when OASIS template is selected */}
          {selectedTemplate === 'OASIS' && (
            <>
              <div className="border-t border-gray-200 pt-4 mt-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">OASIS-Specific Fields</h3>
              </div>
              
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">
                  Eating/Oral Hygiene/Upper Body Dressing:
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
                <label className="block text-sm font-medium text-gray-700">
                  Toileting/Bathing/Lower Body Dressing/Footwear:
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
                <label className="block text-sm font-medium text-gray-700">
                  Stairs:
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
                <label className="block text-sm font-medium text-gray-700">
                  ADL/Medical/Safety Supervision:
                </label>
                <input
                  name="adlMedicalSafetySupervision"
                  placeholder="Enter ADL/Medical/Safety Supervision"
                  value={formData.adlMedicalSafetySupervision}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
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
    </div>
  );
}

export default App; // Make this component available for use in other files
