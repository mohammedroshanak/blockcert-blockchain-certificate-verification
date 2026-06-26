import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { type Certificate } from '../context/CertificateContext';

/**
 * Escapes fields for CSV formatting to prevent injection/comma errors
 */
const escapeCSV = (val: any): string => {
  if (val === null || val === undefined) return '';
  let str = String(val);
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    str = str.replace(/"/g, '""');
    return `"${str}"`;
  }
  return str;
};

/**
 * Export certificate registry to standard CSV format
 */
export const exportToCSV = (certificates: Certificate[]): void => {
  const headers = [
    'Certificate ID', 'Student Name', 'Register Number', 'Department', 
    'Course Name', 'Grade', 'Issue Date', 'SHA-256 Hash', 'IPFS CID', 
    'Transaction Hash', 'Signer Address', 'Status'
  ];

  const rows = certificates.map(c => [
    c.id, c.studentName, c.registerNumber, c.department,
    c.courseName, c.grade, c.issueDate, c.hash, c.ipfsCID || 'N/A',
    c.txHash || 'N/A', c.signerAddress || 'N/A', c.status
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(r => r.map(escapeCSV).join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `BlockCert_Ledger_Registry_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Export certificate registry to Excel-compatible XLS format (Tab-Separated Values)
 */
export const exportToExcel = (certificates: Certificate[]): void => {
  const headers = [
    'Certificate ID', 'Student Name', 'Register Number', 'Department', 
    'Course Name', 'Grade', 'Issue Date', 'SHA-256 Hash', 'IPFS CID', 
    'Transaction Hash', 'Signer Address', 'Status'
  ];

  const rows = certificates.map(c => [
    c.id, c.studentName, c.registerNumber, c.department,
    c.courseName, c.grade, c.issueDate, c.hash, c.ipfsCID || 'N/A',
    c.txHash || 'N/A', c.signerAddress || 'N/A', c.status
  ]);

  // Excel parses Tab-Separated Values with a .xls extension natively as a spreadsheet
  const xlsContent = [
    headers.join('\t'),
    ...rows.map(r => r.join('\t'))
  ].join('\n');

  const blob = new Blob([xlsContent], { type: 'application/vnd.ms-excel;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `BlockCert_Ledger_Registry_${new Date().toISOString().split('T')[0]}.xls`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Export certificate registry to a formal landscape PDF report
 */
export const exportToPDF = (certificates: Certificate[]): void => {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  });

  // Title / Header Section
  doc.setFont('Times', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(30, 41, 59); // slate-800
  doc.text('NATIONAL INSTITUTE OF TECHNOLOGY', doc.internal.pageSize.getWidth() / 2, 20, { align: 'center' });
  
  doc.setFontSize(10);
  doc.setFont('Helvetica', 'bold');
  doc.setTextColor(100, 116, 139); // slate-500
  doc.text('OFFICIAL ACADEMIC REGISTRY LEDGER DATABASE', doc.internal.pageSize.getWidth() / 2, 26, { align: 'center' });

  doc.setDrawColor(212, 175, 55); // Gold line separator
  doc.setLineWidth(1.5);
  doc.line(20, 30, doc.internal.pageSize.getWidth() - 20, 30);

  // Subheader Info
  doc.setFontSize(9);
  doc.setFont('Helvetica', 'normal');
  doc.setTextColor(71, 85, 105); // slate-600
  doc.text(`Generated Date: ${new Date().toLocaleString()}`, 20, 38);
  doc.text(`Total Records: ${certificates.length}`, doc.internal.pageSize.getWidth() - 20, 38, { align: 'right' });

  // Prepare table data
  const headers = [['ID', 'Student Name', 'Register No.', 'Department', 'Grade', 'Issue Date', 'SHA-256 Fingerprint']];
  const data = certificates.map(c => [
    c.id,
    c.studentName,
    c.registerNumber,
    c.department,
    c.grade,
    c.issueDate,
    `${c.hash.substring(0, 16)}...`
  ]);

  // Render Table
  (doc as any).autoTable({
    startY: 42,
    head: headers,
    body: data,
    theme: 'grid',
    headStyles: {
      fillColor: [30, 41, 59], // slate-800
      textColor: [255, 255, 255],
      fontSize: 9,
      fontStyle: 'bold',
      halign: 'center'
    },
    bodyStyles: {
      fontSize: 8,
      textColor: [51, 65, 85] // slate-700
    },
    columnStyles: {
      0: { fontStyle: 'bold', font: 'courier', width: 26 },
      2: { font: 'courier', width: 26 },
      6: { font: 'courier', fontSize: 7 }
    },
    margin: { left: 20, right: 20 }
  });

  // Footer Section
  const pageCount = (doc as any).internal.getNumberOfPages();
  doc.setFontSize(8);
  doc.setFont('Helvetica', 'normal');
  doc.setTextColor(148, 163, 184); // slate-400

  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.text(
      `Page ${i} of ${pageCount}`,
      doc.internal.pageSize.getWidth() / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
    doc.text(
      'BLOCKCERT Blockchain Certificate Registry • Confidential Academic Report',
      20,
      doc.internal.pageSize.getHeight() - 10
    );
  }

  // Save the PDF
  doc.save(`BlockCert_Ledger_Registry_${new Date().toISOString().split('T')[0]}.pdf`);
};
