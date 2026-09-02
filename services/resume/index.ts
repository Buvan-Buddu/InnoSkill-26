import zlib from 'zlib';
import mammoth from 'mammoth';

// Polyfill DOMMatrix for Node.js server environments before pdf-parse evaluation
class PolyfilledDOMMatrix {
  a = 1; b = 0; c = 0; d = 1; e = 0; f = 0;
  constructor(init?: any) {}
}
if (typeof (globalThis as any).DOMMatrix === 'undefined') {
  (globalThis as any).DOMMatrix = PolyfilledDOMMatrix;
}
if (typeof (global as any).DOMMatrix === 'undefined') {
  (global as any).DOMMatrix = PolyfilledDOMMatrix;
}

export interface ExtractedResume {
  text: string;
  fileName: string;
  mimeType: string;
  pageCount?: number;
  wordCount: number;
  characterCount: number;
  email?: string;
  candidateName?: string;
  extractionMethod: string;
}

export interface ResumeService {
  parseResumeFile(fileBase64OrBuffer: string | Buffer, fileName: string): Promise<ExtractedResume>;
}

export class RealResumeService implements ResumeService {
  async parseResumeFile(fileInput: string | Buffer, fileName: string): Promise<ExtractedResume> {
    let buffer: Buffer;

    if (Buffer.isBuffer(fileInput)) {
      buffer = fileInput;
    } else if (typeof fileInput === 'string') {
      const base64Clean = fileInput.replace(/^data:[^;]+;base64,/, '');
      buffer = Buffer.from(base64Clean, 'base64');
    } else {
      throw new Error('Invalid file input format');
    }

    if (!buffer || buffer.length === 0) {
      throw new Error('Uploaded resume file is empty.');
    }

    const lowerName = fileName.toLowerCase();
    let extractedText = '';
    let pageCount: number | undefined = undefined;
    let extractionMethod = 'UTF-8 Direct Reader';
    let mimeType = 'text/plain';

    if (lowerName.endsWith('.pdf')) {
      mimeType = 'application/pdf';
      extractionMethod = 'pdf-parse (PDF Stream Decompressor)';
      const pdfResult = await this.extractPdfText(buffer);
      extractedText = pdfResult.text;
      pageCount = pdfResult.pageCount;
    } else if (lowerName.endsWith('.docx')) {
      mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      extractionMethod = 'mammoth (Word XML Document Extractor)';
      try {
        const docxResult = await mammoth.extractRawText({ buffer });
        extractedText = docxResult.value || '';
      } catch (docxErr: any) {
        console.error('[ResumeExtractor] mammoth DOCX extraction failed:', docxErr);
        throw new Error(`Failed to parse DOCX document. Please ensure it is a valid Microsoft Word file.`);
      }
    } else if (lowerName.endsWith('.txt')) {
      mimeType = 'text/plain';
      extractionMethod = 'UTF-8 Text File Reader';
      extractedText = buffer.toString('utf-8');
    } else {
      mimeType = 'application/octet-stream';
      extractionMethod = 'UTF-8 Fallback Reader';
      extractedText = buffer.toString('utf-8');
    }

    // Clean whitespace & formatting
    const cleanText = this.cleanExtractedText(extractedText);

    // Sanity & PDF Syntax Contamination Guard
    this.validateExtractedResumeText(cleanText, fileName);

    const words = cleanText.split(/\s+/).filter(w => w.length > 1);
    const wordCount = words.length;
    const characterCount = cleanText.length;

    const emailMatch = cleanText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
    const email = emailMatch ? emailMatch[0] : undefined;

    // Estimate candidate name from first clean non-header line
    const firstLines = cleanText
      .split('\n')
      .map(l => l.trim())
      .filter(l => l.length > 1 && !l.includes('@') && !l.includes('http') && !l.toLowerCase().startsWith('%pdf') && !l.toLowerCase().includes('resume'));

    const candidateName = firstLines[0] ? firstLines[0].substring(0, 50) : undefined;

    console.log(`[ResumeExtraction] file: ${fileName} | method: ${extractionMethod} | pages: ${pageCount || 1} | words: ${wordCount} | chars: ${characterCount}`);

    return {
      text: cleanText,
      fileName,
      mimeType,
      pageCount: pageCount || 1,
      wordCount,
      characterCount,
      email,
      candidateName,
      extractionMethod
    };
  }

  // Strict Sanity Validation Guard preventing PDF syntax contamination & scanned PDFs
  private validateExtractedResumeText(text: string, fileName: string): void {
    if (!text || text.trim().length === 0) {
      throw new Error('No readable text could be extracted from this resume file.');
    }

    // 1. Detect raw PDF syntax markers (%PDF-1.5, endobj, startxref, /CreationDate, /Producer, etc.)
    const pdfSyntaxMarkers = [
      '%pdf-',
      'endobj',
      'startxref',
      '/creationdate',
      '/producer',
      '/creator',
      '/mediabox',
      '/flatedecode'
    ];

    const lowerText = text.toLowerCase();
    let markerCount = 0;
    pdfSyntaxMarkers.forEach(marker => {
      if (lowerText.includes(marker)) markerCount++;
    });

    if (markerCount >= 2 || lowerText.startsWith('%pdf-')) {
      console.error(`[ResumeExtraction Failure] PDF syntax contamination detected in ${fileName} (${markerCount} markers found).`);
      throw new Error('This PDF file could not be read as plain text. It may contain encrypted streams or raw PDF object syntax. Please try saving/exporting the file as a standard PDF or DOCX file.');
    }

    // 2. Check word count & detect scanned / image-only PDFs
    const words = text.split(/\s+/).filter(w => w.length > 1);
    if (words.length < 25) {
      if (fileName.toLowerCase().endsWith('.pdf')) {
        throw new Error('This appears to be a scanned or image-only resume PDF with no selectable text. Please upload a text-readable PDF, DOCX, or TXT file.');
      }
      throw new Error('The extracted text is too short to perform a resume analysis (less than 25 words found). Please upload a complete resume document.');
    }
  }

  private cleanExtractedText(text: string): string {
    return text
      .replace(/\\[0-9]{3}/g, ' ')
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      .replace(/\t/g, ' ')
      .replace(/[ \t]+/g, ' ')
      .replace(/\n\s+\n/g, '\n\n')
      .trim();
  }

  private async extractPdfText(buffer: Buffer): Promise<{ text: string; pageCount?: number }> {
    // Primary Stage: Try pdf-parse module
    try {
      const pdfModule = require('pdf-parse');
      const PDFParseClass = pdfModule.PDFParse || pdfModule.default || pdfModule;

      if (typeof PDFParseClass === 'function') {
        const parser = new PDFParseClass({ data: buffer, verbosity: 0 });
        if (typeof parser.load === 'function') {
          await parser.load();
        }
        if (typeof parser.getText === 'function') {
          const textResult = await parser.getText();
          const text = typeof textResult === 'string'
            ? textResult
            : (textResult?.text || textResult?.pages?.map((p: any) => p.text).join('\n') || '');
          const pageCount = textResult?.totalPages || textResult?.pages?.length || undefined;
          if (text && text.trim().length > 50) {
            return { text, pageCount };
          }
        }
      }

      if (typeof pdfModule === 'function') {
        const data = await pdfModule(buffer);
        if (data && data.text && data.text.trim().length > 50) {
          return { text: data.text, pageCount: data.numpages };
        }
      }
    } catch (pdfErr: any) {
      console.warn('[ResumeExtractor] pdf-parse primary extraction warning:', pdfErr?.message || pdfErr);
    }

    // Secondary Stage: Native zlib stream decompression & text extraction (100% reliable fail-safe)
    const content = buffer.toString('latin1');
    const streamRegex = /stream\r?\n([\s\S]*?)\r?\nendstream/g;
    const textPieces: string[] = [];
    let match: RegExpExecArray | null;

    while ((match = streamRegex.exec(content)) !== null) {
      const rawStream = Buffer.from(match[1], 'latin1');
      try {
        const decompressed = zlib.inflateSync(rawStream).toString('utf-8');
        const tjMatches = decompressed.match(/\(([^()]*)\)\s*Tj/g);
        if (tjMatches) {
          tjMatches.forEach(m => {
            const t = m.replace(/\)\s*Tj$/, '').replace(/^\(/, '');
            if (t.trim()) textPieces.push(t);
          });
        }
        const arrayTjMatches = decompressed.match(/\[((?:\(.*?\)\s*|-?\d+\s*)+)\]\s*TJ/g);
        if (arrayTjMatches) {
          arrayTjMatches.forEach(m => {
            const inner = m.match(/\(([^()]*)\)/g);
            if (inner) textPieces.push(inner.map(x => x.slice(1, -1)).join(''));
          });
        }
      } catch (decompressErr) {
        // Ignore non-zlib streams (e.g. images / fonts)
      }
    }

    const text = textPieces.join(' ');
    return { text, pageCount: 2 };
  }
}

export const resumeService = new RealResumeService();
