import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import JSZip from "jszip";
import { saveAs } from "file-saver";

export async function exportCardToPng(element: HTMLElement, filename: string): Promise<Blob> {
  const canvas = await html2canvas(element, {
    scale: 3, // Higher resolution for printing
    useCORS: true,
    backgroundColor: null,
  });
  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob!), "image/png");
  });
}

export async function exportBatchToZip(
  elements: HTMLElement[],
  filenames: string[],
  onProgress?: (current: number, total: number) => void
) {
  const zip = new JSZip();
  const folder = zip.folder("id-cards");

  for (let i = 0; i < elements.length; i++) {
    const blob = await exportCardToPng(elements[i], filenames[i]);
    folder?.file(`${filenames[i]}.png`, blob);
    if (onProgress) onProgress(i + 1, elements.length);
  }

  const content = await zip.generateAsync({ type: "blob" });
  saveAs(content, "event-id-cards.zip");
}

export async function exportBatchToPdf(
  elements: HTMLElement[],
  onProgress?: (current: number, total: number) => void
) {
  // Standard CR80 badge dimensions in mm (85.6mm x 54mm portrait -> 54 x 85.6)
  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: [54, 85.6],
  });

  for (let i = 0; i < elements.length; i++) {
    const canvas = await html2canvas(elements[i], { scale: 3, useCORS: true });
    const imgData = canvas.toDataURL("image/png");

    if (i > 0) pdf.addPage([54, 85.6], "portrait");
    pdf.addImage(imgData, "PNG", 0, 0, 54, 85.6);
    if (onProgress) onProgress(i + 1, elements.length);
  }

  pdf.save("event-badges.pdf");
}