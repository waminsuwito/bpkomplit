
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
          width: 100%;
          height: auto;
          overflow: visible !important;
          background-color: #fff !important;
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
        .break-inside-avoid {
          break-inside: avoid;
        }
        div, .border, .rounded-lg, .overflow-x-auto {
            border: none !important;
            border-radius: 0 !important;
            box-shadow: none !important;
            overflow: visible !important;
        }
        table {
            width: 100% !important;
            border-collapse: collapse !important;
        }
        th, td {
            border: 1px solid #ccc !important;
            padding: 8px !important;
            color: #000 !important;
        }
        thead {
            background-color: #f2f2f2 !important;
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
  
  // Create a temporary container to manipulate the content
  const tempContainer = document.createElement('div');
  tempContainer.innerHTML = printContent.innerHTML;

  // Find the logo image and reliably set its src
  const logoImg = tempContainer.querySelector('img[alt*="Logo"]');
  if (logoImg) {
    // This is the most reliable way: use the local path for printing
    logoImg.setAttribute('src', '/logo.png');
  }

  printWindow.document.write(tempContainer.innerHTML);
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

/**
 * Calculates the distance between two GPS coordinates in meters using the Haversine formula.
 * @param lat1 Latitude of the first point.
 * @param lon1 Longitude of the first point.
 * @param lat2 Latitude of the second point.
 * @param lon2 Longitude of the second point.
 * @returns The distance in meters.
 */
export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // Earth's radius in metres
  const φ1 = lat1 * Math.PI / 180; // φ, λ in radians
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  const d = R * c; // in metres
  return d;
}
