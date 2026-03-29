# Using Adobe Acrobat radio buttons with this app

The app can set **radio button groups** in your PDFs. The PDF field must be a radio group created in Adobe Acrobat, and your form data must use the **exact export value** of the option you want selected.

---

## 1. In Adobe Acrobat: set the radio group name and export values

1. Open your PDF in **Adobe Acrobat** (not just Reader).
2. **Prepare Form** (or **Edit PDF** → form tools).
3. Add or select a **radio button** field.
4. **Name the field** (e.g. `painLevel`). All options in the same group must share this **same name**.
5. For **each option** in the group, set its **Export value**:
   - Right‑click the radio → **Properties** → **Options**.
   - Set **Export value** to a unique string (e.g. `0`, `1`, `2`, or `None`, `Mild`, `Moderate`, `Severe`).
   - Use values you can type consistently (no extra spaces). The app will select the option by this value.

Example:

| Option label (what users see) | Export value (what the app uses) |
|-------------------------------|-----------------------------------|
| None                          | `0`                               |
| Mild                          | `1`                               |
| Moderate                      | `2`                               |
| Severe                        | `3`                               |

The **group name** might be something like `painLevel`. The app will set that group by passing the chosen export value (e.g. `"2"`).

---

## 2. In this app: match form data to the PDF

The app fills a radio group when:

- **Key** = the radio group’s **field name** (same for all options in the group).
- **Value** = the **export value** of the option you want selected (exact string).

So in your app’s form state you need a field with that name and one of those values.

**Example:** PDF has a radio group named `painLevel` with export values `0`, `1`, `2`, `3`. To select “Moderate”:

- In `formData`: `painLevel: "2"`  
  (or whatever export value you gave to “Moderate” in Acrobat).

The app already tries **text field → checkbox → radio group** for each key in `formData`, so once `painLevel` is in `formData` and your UI sets it to `"2"`, the PDF radio group will be filled on “Generate PDF”.

---

## 3. Add a control in the React form

Add a field to `formData` and a control that sets it.

**Option A – Dropdown (select)**

```jsx
// In formData state, add:
painLevel: "",

// In your form JSX:
<label className="block text-sm font-medium text-gray-700">Pain Level</label>
<select
  name="painLevel"
  value={formData.painLevel}
  onChange={handleChange}
  className="w-full px-3 py-2 border border-gray-300 rounded-md..."
>
  <option value="">Select...</option>
  <option value="0">None</option>
  <option value="1">Mild</option>
  <option value="2">Moderate</option>
  <option value="3">Severe</option>
</select>
```

The `value` in each `<option>` must match the **export value** in Acrobat.

**Option B – Radio buttons in the UI**

```jsx
// Same formData key
painLevel: "",

// In your form JSX:
<label className="block text-sm font-medium text-gray-700">Pain Level</label>
<div className="flex gap-4">
  {[
    { value: "0", label: "None" },
    { value: "1", label: "Mild" },
    { value: "2", label: "Moderate" },
    { value: "3", label: "Severe" },
  ].map(({ value, label }) => (
    <label key={value} className="flex items-center gap-2">
      <input
        type="radio"
        name="painLevel"
        value={value}
        checked={formData.painLevel === value}
        onChange={handleChange}
      />
      <span>{label}</span>
    </label>
  ))}
</div>
```

Again, `value` must match the PDF export value.

Your existing `handleChange` already does `setFormData(prev => ({ ...prev, [name]: value }))`, so both the select and the radio inputs will set `formData.painLevel` and the PDF radio group will get the correct option when you generate the PDF.

---

## 4. Summary

| Step | What to do |
|------|------------|
| **Acrobat** | One radio group = one **field name**. Each option has an **Export value**. |
| **formData** | One key = that **field name**; value = **export value** of the option to select. |
| **UI** | Add a `<select>` or `<input type="radio">` with `name` = that field name and `value` = export value; use `handleChange` so `formData` stays in sync. |

If a PDF field doesn’t fill:

- Confirm the **field name** in Acrobat (e.g. `painLevel`) matches the key in `formData`.
- Confirm the **export value** in Acrobat matches the value you set (e.g. `"2"`) exactly (case and spaces).
