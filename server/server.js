const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { PDFDocument } = require('pdf-lib');

const app = express();
const PORT = process.env.PORT || 3001;



app.use(cors());
app.use(express.json());

app.post('/fill-form', async (req, res) => {
  try {
    const { templateName } = req.body;
    const filePath = path.join(__dirname, 'templates', `${templateName}.pdf`);
    const existingPdfBytes = fs.readFileSync(filePath);
    const pdfDoc = await PDFDocument.load(existingPdfBytes);

    const form = pdfDoc.getForm();

    const fields = [
      "diagnosis", "reassessDate", "timeIn", "bedMob", "transfers", "bp", "pulse", "temp", 
      "oxySat", "pmh", "mmt", "rom", "gait"
    ];

    form.getFields().forEach(field => {
      console.log(`${field.getName()} - ${field.constructor.name}`);
    });

    const checkboxes = ["CheckBox", "Checkbox"];

    checkboxes.forEach(fieldName => {
      try {
        const checkbox = form.getCheckBox(fieldName);
        if (req.body[fieldName]) {
          checkbox.check(); // ✅ Check the box
        } else {
          checkbox.uncheck(); // ❌ Uncheck if false
        }
      } catch (err) {
        console.warn(`⚠️ Could not update checkbox ${fieldName}: ${err.message}`);
      }
    });
    
    fields.forEach(fieldName => {
      const duplicateFields = [];
      const valueForDuplicates = req.body["reassessDate"] || "Test";

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
          const value = req.body[fieldName] || "Test";
          maybeField.setText(value); // ❗ Safe operation
        } else {
          console.warn(`Skipping non-text or missing field: ${fieldName}`);
        }
      } catch (fieldErr) {
        console.warn(`⚠️ Skipping field "${fieldName}" due to error: ${fieldErr.message}`);
      }
    });

    // ⚠️ Do NOT call form.flatten() or updateAppearances

    const pdfBytes = await pdfDoc.save();

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename=filled-form.pdf',
    });

    res.send(Buffer.from(pdfBytes));
  } catch (err) {
    console.error("PDF generation error:", err);
    res.status(500).send("Failed to fill PDF form");
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
