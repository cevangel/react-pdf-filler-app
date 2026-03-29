# Interview Answer: Promises Experience

## Keywords
**async/await, .then()/.catch(), fetch(), PDFDocument.load(), error handling, promise chaining, sequential operations**

---

## Short Answer (Under 5 Sentences)

I use Promises extensively in my React PDF filler app, primarily through `async/await` syntax for sequential operations like loading PDF templates, processing them with pdf-lib, and generating downloadable files. I also use `.then()/.catch()` for promise chaining and error handling, such as when registering service workers. In my app, I chain multiple promises together: `fetch()` to load templates, `PDFDocument.load()` to parse them, `embedFont()` to add fonts, and `save()` to generate final bytes - each step waits for the previous one using `await`. I handle errors with try/catch blocks around async operations, ensuring the app gracefully handles failures like missing template files or network errors. I haven't needed polyfills since I'm targeting modern browsers that natively support Promises, but I understand they're necessary for older browser support.

---

## Expansion Points (For Follow-Up Questions)

### If asked: "Show me an example from your code"

**Answer:** In my `handleSubmit` function, I chain multiple promises:
```javascript
const handleSubmit = async (e) => {
  try {
    const templateBytes = await fetch(templateUrl).then((r) => r.arrayBuffer());
    const pdfDoc = await PDFDocument.load(templateBytes);
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const bytes = await pdfDoc.save();
    // ... download logic
  } catch (err) {
    alert("Error generating PDF");
  }
};
```

**Key points:**
- `fetch()` returns a Promise
- Each `await` waits for the previous promise to resolve
- Try/catch handles any promise rejections
- Sequential operations ensure each step completes before the next

---

### If asked: "What's the difference between async/await and .then()?"

**Answer:** They're the same thing, just different syntax. `async/await` is more readable and easier to debug, while `.then()/.catch()` is more traditional. I use `async/await` for most operations in my app because it reads like synchronous code, but I use `.then()/.catch()` for service worker registration where it's more appropriate. Both handle promises the same way under the hood.

**Example from my code:**
- `async/await`: Used in `handleSubmit` and `warmCache` functions
- `.then()/.catch()`: Used in service worker registration in `main.jsx`

---

### If asked: "Have you used Promise.all() or Promise.race()?"

**Answer:** I haven't used them in this project yet, but I understand their use cases. `Promise.all()` would be useful for loading multiple PDF templates simultaneously (instead of sequentially), and `Promise.race()` could be used for timeout scenarios. In my current implementation, I use `forEach` with async functions for parallel template caching, but `Promise.all()` would be more explicit and provide better error handling.

**Potential improvement:**
```javascript
// Current: forEach with async (works but not ideal)
templateUrls.forEach(async (url) => { await fetch(url); });

// Better: Promise.all() for parallel operations
await Promise.all(templateUrls.map(url => fetch(url)));
```

---

### If asked: "What about polyfills?"

**Answer:** I haven't needed polyfills because I'm targeting modern browsers (Chrome, Firefox, Safari) that natively support Promises. However, I understand that polyfills like `es6-promise` or `core-js` are necessary for older browsers like IE11. If I needed to support legacy browsers, I would add a polyfill through npm and include it in my build process, likely through Vite's configuration or a polyfill service.

**Knowledge points:**
- Promises are supported in all modern browsers (ES6+)
- Polyfills needed for IE11 and older
- Can add via npm packages or CDN
- Build tools like Vite can handle polyfill injection

---

### If asked: "How do you handle promise errors?"

**Answer:** I use try/catch blocks with async/await for most error handling, which catches any promise rejections in the try block. For `.then()/.catch()` chains, I use `.catch()` at the end of the chain. In my PDF generation code, if any step fails (template loading, PDF parsing, font embedding, or saving), the catch block logs the error and shows a user-friendly alert, preventing the app from crashing.

**Example from my code:**
```javascript
try {
  await fetch(templateUrl);  // If this fails...
  await PDFDocument.load();  // ...or this fails...
  await pdfDoc.save();       // ...or this fails...
} catch (err) {              // ...it's caught here
  console.error(err);
  alert("Error generating PDF");
}
```

---

### If asked: "What's a common mistake with promises?"

**Answer:** A common mistake is forgetting to use `await` or `.then()`, which means you're working with a Promise object instead of the actual value. Another mistake is not handling errors, which can lead to unhandled promise rejections. In my code, I always wrap async operations in try/catch blocks and use `await` consistently to ensure I'm working with resolved values, not promise objects.

**Example of the mistake:**
```javascript
// Wrong: result is a Promise, not the actual data
const result = fetch(url);
console.log(result); // Promise { <pending> }

// Correct: await gets the actual value
const result = await fetch(url);
console.log(result); // Response object
```

---

## Quick Reference: Key Points to Remember

✅ **Experience:** Extensive use in production app
✅ **Syntax:** Both `async/await` and `.then()/.catch()`
✅ **Use cases:** File loading, PDF processing, service workers
✅ **Error handling:** Try/catch blocks and .catch() methods
✅ **Polyfills:** Not needed for modern browsers, but understand the concept
✅ **Best practices:** Always handle errors, use await consistently, chain operations properly

---

## Follow-Up Question Preparation

Be ready to discuss:
- Promise chaining vs parallel execution
- Error handling strategies
- When to use Promise.all() vs sequential awaits
- Polyfill requirements for legacy browsers
- Common promise pitfalls and how to avoid them
- Performance implications of promise chains

