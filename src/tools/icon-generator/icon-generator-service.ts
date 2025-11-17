export function resizeImage(file: File, sizes: number[]): Promise<Blob[]> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = URL.createObjectURL(file);
    img.onload = () => {
      const blobs: Blob[] = [];
      const promises = sizes.map((size) => {
        return new Promise<void>((resolve) => {
          const canvas = document.createElement('canvas');
          canvas.width = size;
          canvas.height = size;
          const ctx = canvas.getContext('2d')!;
          ctx.drawImage(img, 0, 0, size, size);
          canvas.toBlob((blob) => {
            if (blob) {
              blobs.push(blob);
            }
            resolve();
          }, 'image/png');
        });
      });
      Promise.all(promises)
        .then(() => {
          resolve(blobs);
        })
        .catch((err) => {
          reject(err);
        });
    };
    img.onerror = (err) => {
      reject(err);
    };
  });
}

/**
 * Downloads a single blob as a file with the specified filename.
 */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Gets the base filename without extension from a file.
 */
export function getBaseFilename(file: File): string {
  const name = file.name;
  const lastDotIndex = name.lastIndexOf('.');
  return lastDotIndex > 0 ? name.substring(0, lastDotIndex) : name;
}

/**
 * Creates a filename for a resized image.
 */
export function createResizedFilename(originalFilename: string, size: number): string {
  const baseName = originalFilename.includes('.')
    ? originalFilename.substring(0, originalFilename.lastIndexOf('.'))
    : originalFilename;
  return `${baseName}_${size}x${size}.png`;
}

function blobToFile(theBlob: Blob, fileName: string): File {
  const b: any = theBlob;
  // A Blob() is almost a File() - it's just missing the two properties below which we will add
  b.lastModified = new Date().getTime();
  b.name = fileName;

  // Cast to a File() type
  return theBlob as File;
}


/**
 * Downloads all blobs as individual files with a delay between downloads.
 */
export async function downloadAllImages(
  blobs: Blob[],
  sizes: number[],
  baseFilename: string,
  delay: number = 500
): Promise<void> {
  for (let i = 0; i < blobs.length; i++) {
    const filename = createResizedFilename(baseFilename, sizes[i]);
    downloadBlob(blobs[i], filename);

    // Add delay between downloads to prevent browser blocking
    if (i < blobs.length - 1) {
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

/**
 * Downloads all blobs as a single zip file.
 */
export async function downloadAllImagesAsZip(
  blobs: Blob[],
  sizes: number[],
  baseFilename: string
): Promise<void> {
  const JSZip = (await import('jszip')).default;
  const zip = new JSZip();

  // Add each image to the zip
  for (let i = 0; i < blobs.length; i++) {
    const filename = createResizedFilename(baseFilename, sizes[i]);
    zip.file(filename, blobs[i]);
  }

  // Generate the zip file
  const zipBlob = await zip.generateAsync({ type: 'blob' });

  // Download the zip file
  const zipFilename = `${baseFilename}_all_images.zip`;
  downloadBlob(zipBlob, zipFilename);
}

/**
 * Generates icons from a text string using a specific font.
 *
 * @param text - The text string to convert.
 * @param font - The CSS font string.
 * @param sizes - The array of sizes.
 * @returns The array of resized icons as Blob.
 */
export async function generateTextIcons (text: string, font: string, sizes: number[]): Promise<Blob[]> {
  const largestSize = Math.max(...sizes);
  let largestBlob: Blob | null = null;

  // Create the largest icon first
  const canvas = document.createElement('canvas');
  canvas.width = largestSize;
  canvas.height = largestSize;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    ctx.fillStyle = 'white'; // Background color
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'black'; // Text color
    ctx.font = font;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, largestSize / 2, largestSize / 2);

    largestBlob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Canvas to Blob conversion failed'));
        }
      });
    });
  }

  // Resize the largest icon to other sizes
  if (largestBlob) {
    const largestFile = blobToFile(largestBlob, 'largestIcon.png');
    return await resizeImage(largestFile, sizes);
  } else {
    return Promise.reject(new Error('Failed to generate the largest icon'));
  }
}

