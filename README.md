# DocuJSON 📄➡️{ }

DocuJSON is a sleek, modern web application that converts unstructured text documents, PDFs, and Word files (`.docx`) into structured JSON objects. It runs entirely in your browser—your documents never leave your machine!

Live Demo: [https://nosdovah.github.io/Document-to-JSON/](https://nosdovah.github.io/Document-to-JSON/)

💡 **Need to convert JSON to a CV/Resume?** Check out [JSON-To-CV](https://nosdovah.github.io/JSON-To-CV/).

---

## ✨ Features

- **📂 Multiple Document Formats**: Drag and drop or upload PDF (`.pdf`), Word (`.docx`), or plain text (`.txt`) files directly.
- **🔍 Smart Auto-Detection**: If you don't provide keywords, the app automatically scans your document and detects keys formatted as `Key: Value` or `Key - Value`.
- **🏷️ Keyword-Based Extraction**: Define specific keywords (separated by commas or newlines) to extract text sections starting with those keywords.
- **⚡ Auto-Formatting**: Automatically cleans up extracted values by removing trailing colons, dashes, and extra whitespace.
- **🔒 Privacy First**: 100% client-side parsing. No data is sent to a backend or external API.
- **💅 Sleek Dark Aesthetic**: A responsive layout built with curated typography and rich dark-mode styles.

---

## 🛠️ Technology Stack

- **Framework**: [React](https://react.dev/) + [Vite](https://vite.dev/)
- **PDF Parser**: [pdfjs-dist](https://github.com/mozilla/pdf.js) (runs inside browser threads)
- **Word Document Parser**: [mammoth.js](https://github.com/mwilliamson/mammoth.js) (converts `.docx` raw text)
- **Deployment**: [gh-pages](https://github.com/tschaub/gh-pages)

---

## 🚀 Getting Started

### Prerequisites

Make sure you have [Node.js](https://nodejs.org/) installed on your machine.

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/Nosdovah/Document-to-JSON.git
   cd Document-to-JSON
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Run the development server locally:
   ```bash
   npm run dev
   ```
   Open [http://localhost:5173/](http://localhost:5173/) in your browser.

---

## 📦 How to Deploy to GitHub Pages

This project is configured for easy deployment to GitHub Pages.

1. Ensure the `base` configuration in `vite.config.js` is set to your repository subdirectory or relative paths (currently configured with `'./'` for maximum portability).
2. Run the deployment script:
   ```bash
   npm run deploy
   ```
   This will automatically build the production assets and push them to the `gh-pages` branch, making your site live on `https://<your-username>.github.io/Document-to-JSON/`.

---

## 💡 How It Works

### Parsing Logic

1. **Keyword Mode**: If you provide keywords (e.g. `Name`, `Skills`), the app searches for their first occurrence in the document. It sorts them chronologically by their index in the text and segments the text. The value for a keyword starts from the end of the keyword itself to the start of the next keyword.
2. **Auto-Detect Mode**: If you don't provide any keywords, the parser scans the text line-by-line using a regex matcher (`/^([A-Za-z0-9\s]+)[:\-]\s*(.*)$/`). Lines that match form new keys, and subsequent non-matching lines are appended to the active key.
