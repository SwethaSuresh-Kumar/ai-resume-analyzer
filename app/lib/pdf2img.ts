import * as pdfjsLib from "pdfjs-dist";
import pdfjsWorker from "pdfjs-dist/build/pdf.worker.mjs?url";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

export interface PdfConversionResult {
  imageUrl: string;
  file: File | null;
  error?: string;
}

/**
 * Converts the first page of a PDF file into a high-resolution PNG image.
 */
export async function convertPdfToImage(file: File): Promise<PdfConversionResult> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const page = await pdf.getPage(1);

    const viewport = page.getViewport({ scale: 2 });
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");

    if (!context) throw new Error("Canvas 2D context unavailable");

    canvas.width = viewport.width;
    canvas.height = viewport.height;

    await page.render({ canvasContext: context, viewport, canvas }).promise;

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/png", 1.0)
    );
    if (!blob) throw new Error("Failed to create image blob");

    const imageFile = new File([blob], file.name.replace(/\.pdf$/i, ".png"), {
      type: "image/png",
    });

    return {
      imageUrl: URL.createObjectURL(blob),
      file: imageFile,
    };
  } catch (err) {
    console.error("convertPdfToImage failed:", err);
    return {
      imageUrl: "",
      file: null,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}
