const express = require('express'); // Import Express framework
const cors = require('cors'); // Import CORS middleware for cross-origin requests
const fs = require('fs'); // Node.js file system module
const path = require('path'); // Node.js path module for file paths
const { PDFDocument } = require('pdf-lib'); // Import PDF-lib for PDF manipulation

const app = express(); // Create Express app instance
const PORT = process.env.PORT || 3001; // Set server port

app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // Parse incoming JSON requests

// Route to fill PDF form fields and return the filled PDF
app.post('/fill-form', async (req, res) => {
  console.log(req.body); // Log incoming request body for debugging

  try {
    const { templateName } = req.body; // Extract template name from request
    const filePath = path.join(__dirname, 'templates', `${templateName}.pdf`); // Build path to PDF template
    const existingPdfBytes = fs.readFileSync(filePath); // Read PDF template as bytes
    const pdfDoc = await PDFDocument.load(existingPdfBytes); // Load PDF document

    const form = pdfDoc.getForm(); // Get the form object from the PDF

    // List of text field names to fill
    const fields = [
      "diagnosis", "reassessDate", "timeIn", "bedMob", "transfers", "bp", "pulse", "temp", 
      "oxySat", "pmh", "mmt", "rom", "gait",
      // OASIS-specific fields
      "eatingOralHygieneUpperBodyDressing", "toiletingBathingLowerBodyDressingFootwear", 
      "stairs", "adlMedicalSafetySupervision",
      // New template fields
      "doctorAndNumber", "recentHxAndCC", "DME", "other"
    ];

    // Log all field names and their types for debugging
    console.log("=== PDF FIELDS DEBUG ===");
    form.getFields().forEach(field => {
      console.log(field.getName(), field.constructor.name);
    });
    console.log("=== END PDF FIELDS ===");
    
    // Check specifically for the problematic fields
    console.log("=== CHECKING SPECIFIC FIELDS ===");
    console.log("Looking for 'doctorAndNumber':", req.body.doctorAndNumber);
    console.log("Looking for 'recentHxAndCC':", req.body.recentHxAndCC);

    // List of checkbox field names to fill
    const checkboxes = ["CheckBox", "Checkbox"];

    // Loop through checkboxes and set their state based on request body
    checkboxes.forEach(fieldName => {
      try {
        const checkbox = form.getCheckBox(fieldName);
        if (req.body[fieldName]) {
          checkbox.check(); // Check the box if value is truthy
        } else {
          checkbox.uncheck(); // Uncheck if value is falsy
        }
      } catch (err) {
        // Warn if checkbox field is missing or error occurs
        console.warn(`⚠️ Could not update checkbox ${fieldName}: ${err.message}`);
      }
    });
    
    // Loop through text fields and set their values
    fields.forEach(fieldName => {
      const duplicateFields = []; // Placeholder for duplicate field names (currently unused)
      const valueForDuplicates = req.body["reassessDate"] || "Test"; // Value for duplicates

      // Set value for duplicate fields if any (currently does nothing)
      duplicateFields.forEach((fieldName) => {
        try {
          const field = form.getField(fieldName);
          if (field && field.constructor.name === "PDFTextField") {
            field.setText(valueForDuplicates);
          }
        } catch (err) {
          console.warn(`⚠️ Could not set value for ${fieldName}: ${err.message}`);
        }
      });
      
      try {
        const maybeField = form.getField(fieldName);

        if (maybeField && maybeField.constructor.name === 'PDFTextField') {
          const value = req.body[fieldName] || "Test"; // Use provided value or fallback
          console.log(`✅ Setting field "${fieldName}" to value: "${value}"`); // Debug log
          maybeField.setText(value); // Set text field value
        } else {
          // Warn if field is not a text field or missing
          console.warn(`Skipping non-text or missing field: ${fieldName}`);
        }
      } catch (fieldErr) {
        // Warn if error occurs while setting field
        console.warn(`⚠️ Skipping field "${fieldName}" due to error: ${fieldErr.message}`);
      }
    });

    form.updateFieldAppearances(); // Update field appearances for correct rendering

    const pdfBytes = await pdfDoc.save(); // Save the modified PDF as bytes

    // Set response headers for PDF file download
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename=filled-form.pdf',
    });

    res.send(Buffer.from(pdfBytes)); // Send the filled PDF as response
  } catch (err) {
    // Handle errors and send error response
    console.error("PDF generation error:", err);
    res.status(500).send("Failed to fill PDF form");
  }
});

// Start the Express server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
