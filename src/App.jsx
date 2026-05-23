import { useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.mjs?url';
import mammoth from 'mammoth';
import './index.css';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

function App() {
  const [documentText, setDocumentText] = useState('');
  const [keywordsText, setKeywordsText] = useState('');
  const [outputJson, setOutputJson] = useState('');
  const [error, setError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsProcessing(true);
    setError('');
    
    const fileExtension = file.name.split('.').pop().toLowerCase();
    
    try {
      let extractedText = '';
      
      if (fileExtension === 'pdf') {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
        
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          const pageText = textContent.items.map(item => item.str).join(' ');
          extractedText += pageText + '\n';
        }
      } else if (fileExtension === 'docx' || fileExtension === 'doc') {
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        extractedText = result.value;
      } else {
        // Fallback for .txt or other formats
        extractedText = await file.text();
      }
      
      setDocumentText(extractedText);
      // Automatically attempt to convert if we extracted text successfully
      autoConvert(extractedText, keywordsText);
    } catch (err) {
      console.error(err);
      setError("Error parsing file: " + err.message + ". For Word documents, ensure it's a valid .docx format.");
    } finally {
      setIsProcessing(false);
    }
  };

  const autoConvert = (text, keywordsInput) => {
      try {
        if (!text.trim()) {
          throw new Error("Please provide the document text or upload a file.");
        }

        const keywords = keywordsInput
          .split(/[\n,]+/)
          .map(k => k.trim())
          .filter(k => k.length > 0);

        let result = {};

        if (keywords.length > 0) {
          // KEYWORD-BASED PARSING
          const foundKeywords = [];
          
          for (const kw of keywords) {
            const idx = text.indexOf(kw);
            if (idx !== -1) {
              foundKeywords.push({ keyword: kw, index: idx });
            }
          }
          
          if (foundKeywords.length === 0) {
            throw new Error("None of the specified keywords were found in the document.");
          }
          
          foundKeywords.sort((a, b) => a.index - b.index);
          
          for (let i = 0; i < foundKeywords.length; i++) {
            const current = foundKeywords[i];
            const next = foundKeywords[i + 1];
            
            const startIdx = current.index + current.keyword.length;
            const endIdx = next ? next.index : text.length;
            
            let value = text.substring(startIdx, endIdx);
            value = value.replace(/^[\s:\-]+/, '').trim();
            result[current.keyword] = value;
          }
        } else {
          // AUTO-DETECT PARSING (No keywords provided)
          const lines = text.split('\n');
          let currentKey = null;

          for (const line of lines) {
            // Match pattern like "Key:" or "Key -" at start of line
            const match = line.match(/^([A-Za-z0-9\s]+)[:\-]\s*(.*)$/);
            
            if (match) {
              currentKey = match[1].trim();
              result[currentKey] = match[2].trim();
            } else if (currentKey && line.trim() !== '') {
              // Append multiline values
              result[currentKey] += '\n' + line.trim();
            }
          }

          if (Object.keys(result).length === 0) {
            // Fallback if no colon/hyphen pattern is found
            result = { "Document Content": text.trim() };
          }
        }
        
        setOutputJson(JSON.stringify(result, null, 2));
        setError("");
      } catch (err) {
        setError(err.message);
        setOutputJson("");
      }
  };

  const convertToJson = () => {
    autoConvert(documentText, keywordsText);
  };

  return (
    <div className="app-container">
      <header className="header">
        <h1>DocuJSON</h1>
        <p>Convert unstructured text or uploaded documents (.pdf, .docx) to structured JSON</p>
      </header>

      <main className="main-content">
        <div className="panel">
          <h2>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
            Input Document
          </h2>
          
          <div className="file-upload-wrapper">
            <label htmlFor="fileUpload" className="file-upload-button">
              {isProcessing ? 'Processing File...' : 'Upload Document (.pdf, .docx, .txt)'}
            </label>
            <input 
              type="file" 
              id="fileUpload" 
              accept=".pdf,.doc,.docx,.txt" 
              onChange={handleFileUpload} 
              disabled={isProcessing}
            />
          </div>

          <div className="input-group">
            <label htmlFor="documentText">Or paste your text document here</label>
            <textarea 
              id="documentText"
              value={documentText}
              onChange={(e) => setDocumentText(e.target.value)}
              placeholder={"Name: John Doe\nAge: 30\nExperience: 5 years of software engineering."}
            />
          </div>

          <div className="input-group">
            <label htmlFor="keywordsText">Keywords (Optional - comma or newline separated)</label>
            <textarea 
              id="keywordsText"
              value={keywordsText}
              onChange={(e) => setKeywordsText(e.target.value)}
              placeholder={"Leave blank to auto-detect keys from patterns like 'Key: Value'\nOr specify keys like:\nName\nAge\nExperience"}
              style={{ minHeight: '80px' }}
            />
          </div>

          <button className="btn-primary" onClick={convertToJson}>
            Convert to JSON
          </button>
          
          {error && <div className="error-message">{error}</div>}
        </div>

        <div className="panel">
          <h2>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>
            JSON Output
          </h2>
          <pre className="json-output">
            {outputJson || "// Your JSON will appear here..."}
          </pre>
        </div>
      </main>
    </div>
  );
}

export default App;
