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
