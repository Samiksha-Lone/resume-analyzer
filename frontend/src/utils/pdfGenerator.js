import { jsPDF } from 'jspdf';

export const generateAtsResume = (extractedText, rewriteSuggestions = []) => {
  // Create a new jsPDF instance (standard A4, pt units)
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'pt',
    format: 'a4'
  });

  // Settings
  const margin = 50;
  const pageWidth = doc.internal.pageSize.getWidth();
  const maxLineWidth = pageWidth - margin * 2;
  const lineHeight = 14;
  let yPosition = margin;

  // Font setup (Helvetica is clean and ATS-friendly)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  
  // Title
  doc.text('ATS-OPTIMIZED RESUME SUMMARY', margin, yPosition);
  yPosition += lineHeight * 2;

  // Process text logic
  // We'll replace lines in the extracted text with any accepted rewrite suggestions
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);

  // Simple string replacement if exact match found
  let finalizedText = extractedText || '';
  if (rewriteSuggestions && rewriteSuggestions.length > 0) {
    rewriteSuggestions.forEach(suggestion => {
      if (suggestion.original && suggestion.rewrite) {
        // Simple replace (only replaces first instance, usually enough)
        finalizedText = finalizedText.replace(suggestion.original, suggestion.rewrite);
      }
    });
  }

  // Split text into lines that fit the page width
  const lines = doc.splitTextToSize(finalizedText, maxLineWidth);

  // Render lines with pagination
  for (let i = 0; i < lines.length; i++) {
    // Check if we need a new page
    if (yPosition + lineHeight > doc.internal.pageSize.getHeight() - margin) {
      doc.addPage();
      yPosition = margin;
    }
    
    doc.text(lines[i], margin, yPosition);
    yPosition += lineHeight;
  }

  // Save the PDF
  doc.save('hiremetric_optimized_resume.pdf');
};
