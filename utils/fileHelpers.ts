import JSZip from 'jszip';
import { FileItem } from '../types';

/**
 * Triggers a download of a string content as a file
 */
export function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Generates CSV content for Adobe Stock upload
 */
export function generateAdobeStockCSV(items: FileItem[]) {
  const headers = ['Filename', 'Title', 'Keywords', 'Category', 'Releases'];
  const rows = items
    .filter(item => item.status === 'completed' && item.metadata)
    .map(item => {
      // Use .eps extension to match the structured folder output
      const filename = item.file.name.replace(/\.[^/.]+$/, "") + ".eps";
      const title = (item.metadata?.title || '').replace(/"/g, '""');
      const keywords = (item.metadata?.tags || []).join(', ').replace(/"/g, '""');
      return `"${filename}","${title}","${keywords}","",""`;
    });

  return [headers.join(','), ...rows].join('\n');
}

/**
 * Rasterizes an SVG file to a JPEG blob
 */
export async function rasterizeSVG(svgFile: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        // High-res preview size for stock (approx 3000px on the long edge)
        const maxDim = 3000;
        const width = img.naturalWidth || img.width || 1000;
        const height = img.naturalHeight || img.height || 1000;
        const scale = maxDim / Math.max(width, height);
        
        canvas.width = width * scale;
        canvas.height = height * scale;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) return reject('No context');
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        canvas.toBlob((blob) => {
          if (blob) resolve(blob);
          else reject('Blob generation failed');
        }, 'image/jpeg', 0.95);
      };
      img.onerror = () => reject('Failed to render preview');
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject('Failed to read file');
    reader.readAsDataURL(svgFile);
  });
}

/**
 * Generates a structured zip file for Adobe Stock:
 * - /metadata.csv
 * - /eps/ (contains vector files renamed to .eps)
 * - /pin/ (contains jpeg previews)
 */
export async function generateStockZip(items: FileItem[], onProgress?: (p: number) => void) {
  const zip = new JSZip();
  const completedItems = items.filter(item => item.status === 'completed');
  
  // 1. Add CSV
  const csvContent = generateAdobeStockCSV(completedItems);
  zip.file('metadata.csv', csvContent);
  
  const epsFolder = zip.folder('eps');
  const pinFolder = zip.folder('pin');
  
  let processed = 0;
  for (const item of completedItems) {
    const baseName = item.file.name.replace(/\.[^/.]+$/, "");
    
    // 2. Add source file to eps folder and ensure it has the .eps extension
    if (epsFolder) {
      const epsName = `${baseName}.eps`;
      epsFolder.file(epsName, item.file);
    }
    
    // 3. Generate and add preview to pin folder
    try {
      const jpegBlob = await rasterizeSVG(item.file);
      if (pinFolder) {
        pinFolder.file(`${baseName}.jpg`, jpegBlob);
      }
    } catch (err) {
      console.error(`Failed to rasterize ${item.file.name}`, err);
    }
    
    processed++;
    if (onProgress) onProgress((processed / completedItems.length) * 100);
  }
  
  const content = await zip.generateAsync({ type: 'blob' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(content);
  a.download = `adobe_stock_package_${new Date().toISOString().split('T')[0]}.zip`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}