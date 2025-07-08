import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function printElement(elementId: string) {
  const printContent = document.getElementById(elementId);
  if (!printContent) {
    console.error(`Element with id "${elementId}" not found.`);
    return;
  }

  const printWindow = window.open('', '', 'height=800,width=800');
  if (!printWindow) {
    alert('Please allow pop-ups for this website to print.');
    return;
  }

  printWindow.document.write('<html><head><title>Print</title>');

  // Copy all style and link tags from the main document
  const styles = document.head.querySelectorAll('style, link[rel="stylesheet"]');
  styles.forEach(style => {
    printWindow.document.write(style.outerHTML);
  });
  
  // Add specific print styles to ensure only the content is printed well
   printWindow.document.write(`
    <style>
      @media print {
        body { 
          margin: 1.5rem;
          -webkit-print-color-adjust: exact; /* Chrome, Safari */
          color-adjust: exact; /* Firefox */
        }
        .no-print, .no-print * { 
          display: none !important; 
        }
      }
    </style>
  `);

  printWindow.document.write('</head><body>');
  printWindow.document.write(printContent.innerHTML);
  printWindow.document.write('</body></html>');
  printWindow.document.close();
  printWindow.focus();
  
  // Use a timeout to ensure styles are loaded before printing
  setTimeout(() => {
    printWindow.print();
    printWindow.close();
  }, 250);
}
