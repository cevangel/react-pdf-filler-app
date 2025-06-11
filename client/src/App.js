// Importing React's useState hook to manage state and axios for making HTTP requests
import { useState } from "react";
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
        "https://react-pdf-filler-app.onrender.com", 
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
    <div>  {/*wrap in div, return must have one root element */}
    <select onChange={handleTemplateChange} value={selectedTemplate}>
      <option value="GirlingTemplate">GirlingTemplate</option>
      <option value="YourChoiceTemplate">Your Choice Template</option>
      <option value="ExtendedTemplate">Extended Template</option>
      <option value="AmericareInfiniteTemplate">Americare/Infinite</option>
    </select>
    <p style= {{ color: "red", fontWeight: "bold" }}>
    ⚠️ Do NOT enter identifying patient information (example: name, address, DOB).
    This demo is not HIPAA compliant. Enter PHI manually **after** downloading the PDF.
    </p>
    <form onSubmit={handleSubmit}>
      {/* Dynamically generate input fields based on formData keys */}
      {Object.keys(formData).map((field) => (
        <input
          key={field}                  // React key for optimization
          name={field}                 // Name should match the object key
          placeholder={field}          // Placeholder text shows the field name
          value={formData[field]}      // Controlled input tied to state
          onChange={handleChange}      // Update state on user input
        />
      ))}
      <button type="submit">Generate PDF</button> {/* Submit button */}
    </form>
    </div>
  );
}

export default App; // Make this component available for use in other files
