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
  
  // HEADER BRANDING
  // Draw Logo Icon (Hexagon)
  const logoX = margin;
  const logoY = 14;
  const logoSize = 7;
  
  doc.setDrawColor(0, 191, 255); // #00BFFF
  doc.setLineWidth(0.6);
  
  // Draw Hexagon with better spacing
  const points = [];
  for (let i = 0; i < 6; i++) {
    const angle = (i * 60 * Math.PI) / 180;
    points.push([
      logoX + logoSize + (logoSize * Math.cos(angle)),
      logoY + logoSize + (logoSize * Math.sin(angle))
    ]);
  }
  
  for (let i = 0; i < 6; i++) {
    const next = (i + 1) % 6;
    doc.line(points[i][0], points[i][1], points[next][0], points[next][1]);
  }
  
  // Draw internal cross lines
  doc.setLineWidth(0.3);
  doc.line(logoX + logoSize, logoY + logoSize - 3, logoX + logoSize, logoY + logoSize + 3);
  doc.line(logoX + logoSize - 3, logoY + logoSize, logoX + logoSize + 3, logoY + logoSize);

  // Brand Name
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(28, 28, 28);
  doc.text('ScoreSync', logoX + logoSize * 2 + 10, logoY + logoSize + 1);
  
  // Tagline
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(120, 120, 120);
  doc.text('AI-POWERED RESUME OPTIMIZATION', logoX + logoSize * 2 + 10, logoY + logoSize + 7);

  // Line separator
  doc.setDrawColor(230, 230, 230);
  doc.setLineWidth(0.1);
  doc.line(margin, 35, doc.internal.pageSize.getWidth() - margin, 35);

  let yPosition = 60;

  // Font setup (Helvetica is clean and ATS-friendly)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(0, 0, 0);
  
  // Title
  doc.text('ATS-OPTIMIZED RESUME SUMMARY', margin, yPosition);
  yPosition += 20;

  // Process text logic
  // We'll replace lines in the extracted text with any accepted rewrite suggestions
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);

  // Robust text detection
  let finalizedText = extractedText || '';
  
  // If no text, try to build something from the summary or other fields
  if (!finalizedText || finalizedText.trim().length === 0) {
    if (rewriteSuggestions && rewriteSuggestions.summary) {
      finalizedText = "RESUME SUMMARY & INSIGHTS\n\n" + rewriteSuggestions.summary;
    } else if (typeof rewriteSuggestions === 'string') {
      finalizedText = rewriteSuggestions;
    } else {
      finalizedText = "No full resume text was captured for this analysis version. Please re-analyze the resume to generate a full optimized document.";
    }
  }

  if (rewriteSuggestions && Array.isArray(rewriteSuggestions)) {
    rewriteSuggestions.forEach(suggestion => {
      if (suggestion.original && suggestion.rewrite) {
        finalizedText = finalizedText.replace(suggestion.original, suggestion.rewrite);
      }
    });
  }

  // Split text into lines that fit the page width
  const lines = doc.splitTextToSize(finalizedText, maxLineWidth);

  // Render lines with pagination
  if (lines && lines.length > 0) {
    for (let i = 0; i < lines.length; i++) {
      // Check if we need a new page
      if (yPosition + lineHeight > doc.internal.pageSize.getHeight() - margin) {
        doc.addPage();
        yPosition = margin;
      }
      
      const line = lines[i] || '';
      doc.text(line, margin, yPosition);
      yPosition += lineHeight;
    }
  } else {
    doc.text("Document content could not be rendered.", margin, yPosition);
  }

  // FOOTER BRANDING
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(180, 180, 180);
    doc.text(
      `Page ${i} of ${pageCount} | Powered by ScoreSync AI`,
      margin,
      doc.internal.pageSize.getHeight() - 10
    );
  }

  // Save the PDF
  doc.save('scoresync_optimized_resume.pdf');
};
