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
        html, body {
          overflow: visible !important;
        }
        body { 
          margin: 1.5rem;
          -webkit-print-color-adjust: exact !important;
          color-adjust: exact !important;
        }
        .no-print, .no-print * { 
          display: none !important; 
        }
        .print-only {
          display: block !important;
        }
        body::after {
          content: "PT FARIKA RIAU PERKASA";
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%) rotate(-45deg);
          font-size: 5rem;
          font-weight: bold;
          color: rgba(0, 0, 0, 0.08) !important;
          z-index: -1000;
          pointer-events: none;
          white-space: nowrap;
          -webkit-print-color-adjust: exact !important;
          color-adjust: exact !important;
        }
      }
    </style>
  `);

  printWindow.document.write('</head><body>');
  printWindow.document.write(printContent.innerHTML);
  printWindow.document.write('</body></html>');
  
  printWindow.document.close();
  
  printWindow.onload = () => {
    // This function runs after the document and its resources (like CSS) are loaded.
    setTimeout(() => { // Give the browser a moment to render styles
      printWindow.focus();
      printWindow.print();
    }, 500);
  };

  printWindow.onafterprint = () => {
    // This runs after the user clicks "Print" or "Cancel".
    printWindow.close();
  };
}
