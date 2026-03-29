# Where Promises Are in Your Code (Even Though You Don't See "Promise")

You're right - the word "Promise" doesn't appear in your code! But promises are being used **implicitly** through special syntax. Here's exactly where:

---

## The Promise Keywords in Your Code

### 1. `async` - Marks a function that uses promises

**Line 267 in App.jsx:**
```javascript
const handleSubmit = async (e) => {
```

**Line 43 in App.jsx:**
```javascript
const warmCache = async () => {
```

**What this means:** These functions can use `await` and will automatically return a Promise.

---

### 2. `await` - Waits for a promise to complete

**Line 274:**
```javascript
const templateBytes = await fetch(templateUrl).then((r) => r.arrayBuffer());
```
- `fetch()` returns a Promise
- `await` waits for it to finish

**Line 277:**
```javascript
const pdfDoc = await PDFDocument.load(templateBytes, { updateMetadata: false });
```
- `PDFDocument.load()` returns a Promise
- `await` waits for it to finish

**Line 280:**
```javascript
const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
```
- `embedFont()` returns a Promise
- `await` waits for it to finish

**Line 340:**
```javascript
const bytes = await pdfDoc.save();
```
- `save()` returns a Promise
- `await` waits for it to finish

**Line 67:**
```javascript
const response = await fetch(url, { cache: 'reload' });
```
- `fetch()` returns a Promise
- `await` waits for it to finish

---

### 3. `.then()` - Promise chain syntax

**Line 274:**
```javascript
const templateBytes = await fetch(templateUrl).then((r) => r.arrayBuffer());
```

**Breaking it down:**
- `fetch(templateUrl)` → returns a Promise
- `.then((r) => r.arrayBuffer())` → chains another Promise operation
- `await` → waits for the final result

**This is the same as:**
```javascript
const response = await fetch(templateUrl);
const templateBytes = await response.arrayBuffer();
```

Both use promises, just different syntax!

---

### 4. `.catch()` - Promise error handling

**In main.jsx (line 34):**
```javascript
navigator.serviceWorker.register('/sw.js')
  .then((registration) => {
    console.log('SW registered successfully');
  })
  .catch((error) => {
    console.error('SW registration failed:', error);
  });
```

**What this means:**
- `register()` returns a Promise
- `.then()` handles success
- `.catch()` handles errors

---

## Functions That Return Promises (Even Though It's Not Written)

These functions return Promises, even though you don't see the word "Promise":

1. **`fetch()`** - Returns `Promise<Response>`
2. **`PDFDocument.load()`** - Returns `Promise<PDFDocument>`
3. **`pdfDoc.embedFont()`** - Returns `Promise<Font>`
4. **`pdfDoc.save()`** - Returns `Promise<Uint8Array>`
5. **`response.arrayBuffer()`** - Returns `Promise<ArrayBuffer>`
6. **`navigator.serviceWorker.register()`** - Returns `Promise<ServiceWorkerRegistration>`

---

## Visual Guide: Your Code with Promises Highlighted

```javascript
// Line 267: async = this function uses promises
const handleSubmit = async (e) => {
  try {
    // Line 274: fetch() returns a Promise, await waits for it
    const templateBytes = await fetch(templateUrl).then((r) => r.arrayBuffer());
    //                      ^^^^^ Promise  ^^^^^ waits  ^^^^ chains another Promise
    
    // Line 277: PDFDocument.load() returns a Promise
    const pdfDoc = await PDFDocument.load(templateBytes);
    //             ^^^^^ waits for Promise
    
    // Line 280: embedFont() returns a Promise
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    //          ^^^^^ waits for Promise
    
    // Line 340: save() returns a Promise
    const bytes = await pdfDoc.save();
    //            ^^^^^ waits for Promise
  } catch (err) {
    // Error handling for any failed promises
  }
};
```

---

## Why You Don't See "Promise"

Modern JavaScript hides the Promise object! When you write:

```javascript
const result = await someFunction();
```

Behind the scenes, JavaScript is doing:
```javascript
const promise = someFunction(); // Returns a Promise
const result = await promise;   // Waits for Promise to resolve
```

But you don't need to write "Promise" - JavaScript handles it automatically!

---

## How to Verify Promises Are Being Used

You can check in the browser console:

```javascript
// In browser console:
console.log(fetch('/templates/test.pdf'));
// Output: Promise { <pending> }

console.log(PDFDocument.load(someBytes));
// Output: Promise { <pending> }
```

These functions return Promise objects, even though your code doesn't explicitly say "Promise"!

---

## Summary

✅ **You ARE using promises** - just not explicitly
✅ **`async`** = function uses promises
✅ **`await`** = wait for a promise
✅ **`.then()`** = chain promises
✅ **`.catch()`** = handle promise errors
✅ **Functions like `fetch()`** = return promises automatically

The word "Promise" doesn't need to appear in your code - the syntax (`async`, `await`, `.then()`, `.catch()`) tells JavaScript you're using promises!

