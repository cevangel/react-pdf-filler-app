// Importing React's useState hook to manage state and axios for making HTTP requests
import { useState, useEffect } from "react";
import axios from "axios";

// Define the main component
function App() {
  
  // add dropdown menu for user to choose template
  const[selectedTemplate, setSelectedTemplate] = useState('GirlingTemplate');

  const handleTemplateChange = (e) => {
    setSelectedTemplate(e.target.value);
  }

  // useState hook creates a state variable 'formData' with various form fields.
  // setFormData is the function used to update this state.
  const [formData, setFormData] = useState({
    // PatientName removed for HIPAA safety in public version
    // date: "", removed for HIPAA safety in public version 
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
  });

  const defaultFormData = {
    // PatientName removed for HIPAA safety in public version
    // date: "", removed for HIPAA safety in public version 
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
    // ...add any other default fields for your non-OASIS templates
  };

  // This function is triggered when a user types in any input field.
  const handleChange = (e) => {
    // Dynamically update the field that changed by spreading the old state and updating the field that matches the input's name.
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // This function handles form submission
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default form behavior (page reload)

    try {
      // Send formData to the backend endpoint using POST
      const response = await axios.post(
        "https://react-pdf-filler-app.onrender.com/fill-form", 
      {
        templateName: selectedTemplate,
        ...formData
      }, 
      {
        responseType: "blob", // Expect a PDF blob (binary large object)
      }
    );

      // Create a downloadable PDF from the blob response
      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob); // Create a temp URL
      const link = document.createElement("a"); // Create a download link
      link.href = url;
      link.download = "filled_form.pdf"; // Set the file name
      link.click(); // Trigger the download
    } catch (err) {
      console.error("Error submitting form:", err); // Show error in console if the request fails
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
            <option value="OASIS">OASIS DC</option>
          </select>
        </div>

        {/* NEW: HIPAA warning section with red background and icon */}
        <div className="px-6 py-4 bg-red-50 border-b border-red-200">
          {/* NEW: Flexbox layout for icon and text alignment */}
          {/* flex items-start = flexbox with items aligned to start */}
          <div className="flex items-start">
            {/* NEW: Warning icon container */}
            {/* flex-shrink-0 = prevent icon from shrinking */}
            <div className="flex-shrink-0">
              {/* NEW: SVG warning icon with red color */}
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            {/* NEW: Text content with left margin */}
            {/* ml-3 = margin left 0.75rem */}
            <div className="ml-3">
              {/* NEW: Warning title with red color and medium font weight */}
              {/* text-sm = 14px, text-red-700 = dark red, font-medium = 500 weight */}
              <p className="text-sm text-red-700 font-medium">
                HIPAA Notice
              </p>
              {/* NEW: Warning description with smaller text and lighter red */}
              {/* text-xs = 12px, text-red-600 = medium red, mt-1 = margin top 0.25rem */}
              <p className="text-xs text-red-600 mt-1">
                Do NOT enter identifying patient information (name, address, DOB). 
                This demo is not HIPAA compliant. Enter PHI manually after downloading.
              </p>
            </div>
          </div>
        </div>

        {/* NEW: Form section with proper spacing */}
        {/* px-6 py-4 = consistent padding, space-y-4 = vertical spacing between form elements */}
        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
          {/* NEW: Submit button with gradient background and hover effects */}
          {Object.keys(formData).map((field) => (
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
