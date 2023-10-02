export const resizeImage = (file: File, sizes: number[]): Promise<Blob[]> => {
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
          console.log('Service Blobs:', blobs);
        })
        .catch((err) => {
          reject(err);
        });
    };
    img.onerror = (err) => {
      reject(err);
    };
  });
};

const blobToFile = (theBlob: Blob, fileName: string): File => {
  var b: any = theBlob;
  // A Blob() is almost a File() - it's just missing the two properties below which we will add
  b.lastModified = new Date().getTime();
  b.name = fileName;

  // Cast to a File() type
  return theBlob as File;
};


/**
 * Generates icons from a text string using a specific font.
 *
 * @param text - The text string to convert.
 * @param font - The CSS font string.
 * @param sizes - The array of sizes.
 * @returns The array of resized icons as Blob.
 */
export const generateTextIcons = async (text: string, font: string, sizes: number[]): Promise<Blob[]> => {
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
    const largestFile = blobToFile(largestBlob, "largestIcon.png");
    return await resizeImage(largestFile, sizes);
  } else {
    return Promise.reject(new Error('Failed to generate the largest icon'));
  }
};

