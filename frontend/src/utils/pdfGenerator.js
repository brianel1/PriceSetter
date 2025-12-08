import jsPDF from 'jspdf';
import 'jspdf-autotable';

export const generateQuotationPDF = async (quotationData) => {
  const {
    projectTitle,
    modules,
    total,
    summary,
    isStudent,
    quotationNumber,
    clientName = '',
    clientEmail = '',
    clientPhone = ''
  } = quotationData;

  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  let yPos = 20;

  // Colors
  const primaryColor = [41, 98, 255]; // Blue
  const darkGray = [51, 51, 51];
  const lightGray = [128, 128, 128];

  // Try to load logo
  try {
    const logoImg = new Image();
    logoImg.src = '/logo_em.png';
    await new Promise((resolve, reject) => {
      logoImg.onload = resolve;
      logoImg.onerror = reject;
      setTimeout(reject, 2000); // Timeout after 2s
    });
    doc.addImage(logoImg, 'PNG', margin, yPos, 40, 40);
  } catch (e) {
    // If logo fails, just use text
    doc.setFontSize(24);
    doc.setTextColor(...primaryColor);
    doc.setFont('helvetica', 'bold');
    doc.text('EchoMedia', margin, yPos + 15);
  }

  // Company Info (right side)
  doc.setFontSize(10);
  doc.setTextColor(...lightGray);
  doc.setFont('helvetica', 'normal');
  const companyInfo = [
    'EchoMedia',
    'Digital Solutions Provider'
  ];
  companyInfo.forEach((line, i) => {
    doc.text(line, pageWidth - margin, yPos + 5 + (i * 5), { align: 'right' });
  });

  yPos += 50;

  // Quotation Title
  doc.setFontSize(28);
  doc.setTextColor(...darkGray);
  doc.setFont('helvetica', 'bold');
  doc.text('QUOTATION', margin, yPos);

  yPos += 10;

  // Quotation details line
  doc.setDrawColor(...primaryColor);
  doc.setLineWidth(1);
  doc.line(margin, yPos, pageWidth - margin, yPos);

  yPos += 15;

  // Quotation Info
  const today = new Date();
  const quotationNo = quotationNumber || `QT-${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}${String(today.getDate()).padStart(2, '0')}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...darkGray);
  doc.text('Quotation No:', margin, yPos);
  doc.text('Date:', margin, yPos + 6);
  doc.text('Client Type:', margin, yPos + 12);

  doc.setFont('helvetica', 'normal');
  doc.text(quotationNo, margin + 35, yPos);
  doc.text(today.toLocaleDateString('en-MY', { day: '2-digit', month: 'long', year: 'numeric' }), margin + 35, yPos + 6);
  doc.text(isStudent ? 'Student' : 'Regular', margin + 35, yPos + 12);

  // Client Info (right side)
  if (clientName) {
    doc.setFont('helvetica', 'bold');
    doc.text('Bill To:', pageWidth - margin - 60, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(clientName, pageWidth - margin - 60, yPos + 6);
    if (clientEmail) doc.text(clientEmail, pageWidth - margin - 60, yPos + 12);
    if (clientPhone) doc.text(clientPhone, pageWidth - margin - 60, yPos + 18);
  }

  yPos += 35;

  // Project Title
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...primaryColor);
  doc.text('Project:', margin, yPos);
  doc.setTextColor(...darkGray);
  doc.setFont('helvetica', 'normal');
  
  // Handle long project titles
  const titleLines = doc.splitTextToSize(projectTitle || 'Untitled Project', pageWidth - margin * 2 - 20);
  doc.text(titleLines, margin + 20, yPos);
  yPos += titleLines.length * 5 + 5;

  // Summary
  if (summary) {
    doc.setFontSize(10);
    doc.setTextColor(...lightGray);
    const summaryLines = doc.splitTextToSize(summary, pageWidth - margin * 2);
    doc.text(summaryLines, margin, yPos);
    yPos += summaryLines.length * 5 + 10;
  }

  // Modules Table
  const tableData = modules.map((m, i) => [
    i + 1,
    m.name,
    m.level.charAt(0).toUpperCase() + m.level.slice(1),
    `RM ${m.price.toFixed(2)}`
  ]);

  doc.autoTable({
    startY: yPos,
    head: [['#', 'Module / Feature', 'Complexity', 'Price (MYR)']],
    body: tableData,
    margin: { left: margin, right: margin },
    headStyles: {
      fillColor: primaryColor,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 10
    },
    bodyStyles: {
      fontSize: 9,
      textColor: darkGray
    },
    alternateRowStyles: {
      fillColor: [245, 247, 250]
    },
    columnStyles: {
      0: { cellWidth: 15, halign: 'center' },
      1: { cellWidth: 'auto' },
      2: { cellWidth: 35, halign: 'center' },
      3: { cellWidth: 35, halign: 'right' }
    }
  });

  yPos = doc.lastAutoTable.finalY + 10;

  // Total
  doc.setFillColor(245, 247, 250);
  doc.rect(pageWidth - margin - 80, yPos, 80, 20, 'F');
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...darkGray);
  doc.text('TOTAL:', pageWidth - margin - 75, yPos + 13);
  doc.setTextColor(...primaryColor);
  doc.text(`RM ${total.toFixed(2)}`, pageWidth - margin - 5, yPos + 13, { align: 'right' });

  yPos += 35;

  // Terms & Conditions
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...darkGray);
  doc.text('Terms & Conditions:', margin, yPos);

  yPos += 7;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...lightGray);
  const terms = [
    '1. This quotation is valid for 30 days from the date of issue.',
    '2. Payment Terms: 50% deposit upon confirmation, 50% upon project completion.',
    '3. Prices are in Malaysian Ringgit (MYR) and exclude any applicable taxes.',
    '4. Project timeline will be confirmed upon deposit payment.',
    '5. Additional features or changes may incur extra charges.',
    '6. All intellectual property rights transfer upon full payment.'
  ];
  terms.forEach((term, i) => {
    doc.text(term, margin, yPos + (i * 5));
  });

  yPos += 40;

  // Footer
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.5);
  doc.line(margin, yPos, pageWidth - margin, yPos);

  yPos += 8;
  doc.setFontSize(9);
  doc.setTextColor(...lightGray);
  doc.text('Thank you for your business!', pageWidth / 2, yPos, { align: 'center' });
  doc.text('EchoMedia - Your Digital Solutions Partner', pageWidth / 2, yPos + 5, { align: 'center' });

  // Save PDF
  const fileName = `${quotationNo}.pdf`;
  doc.save(fileName);

  return fileName;
};
