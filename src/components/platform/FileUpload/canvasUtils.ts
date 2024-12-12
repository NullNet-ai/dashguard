export async function createImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", (error) => reject(error));
    image.src = url;
  });
}
export function getRadianAngle(degreeValue: number) {
  return (degreeValue * Math.PI) / 180;
}

/**
 * Returns the new bounding area of a rotated rectangle.
 */
export function rotateSize(width: number, height: number, rotation: number) {
  const rotRad = getRadianAngle(rotation);

  return {
    width:
      Math.abs(Math.cos(rotRad) * width) + Math.abs(Math.sin(rotRad) * height),
    height:
      Math.abs(Math.sin(rotRad) * width) + Math.abs(Math.cos(rotRad) * height),
  };
}

export type CropState = {
  crop: { x: number; y: number };
  zoom: number;
  rotation: number[];
  croppedAreaPixels: PixelCrop | null;
};

export type PixelCrop = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export async function canvasPreview(
  image: HTMLImageElement,
  canvas: HTMLCanvasElement,
  crop: PixelCrop,
  rotation = 0,
  zoom = 1,
): Promise<Blob> {
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("No 2d context");
  }

  const rotRad = (rotation * Math.PI) / 180;

  const rotatedWidth = crop.width * zoom;
  const rotatedHeight = crop.height * zoom;

  canvas.width = rotatedWidth;
  canvas.height = rotatedHeight;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate(rotRad);
  ctx.scale(zoom, zoom);

  const centerX = -crop.width / 2;
  const centerY = -crop.height / 2;

  ctx.drawImage(
    image,
    crop.x,
    crop.y,
    crop.width,
    crop.height,
    centerX,
    centerY,
    crop.width,
    crop.height,
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error("Canvas is empty"));
        }
      },
      "image/jpeg",
      1,
    );
  });
}
// export async function canvasPreview(
//   image: HTMLImageElement,
//   canvas: HTMLCanvasElement,
//   crop: PixelCrop,
//   rotation = 0,
//   zoom = 1,
// ): Promise<Blob> {
//   // Create a canvas for rotation
//   const rotatedCanvas = document.createElement("canvas");
//   const rotatedCtx = rotatedCanvas.getContext("2d");
//   if (!rotatedCtx) {
//     throw new Error("No 2d context");
//   }

//   // Calculate rotated size
//   const rotRad = (rotation * Math.PI) / 180;

//   // Calculate scaled dimensions
// const scaledWidth = image.width * zoom;
// const scaledHeight = image.height * zoom;

//   // Calculate rotated canvas size
// const { width: rotatedWidth, height: rotatedHeight } = calculateRotatedSize(
//   scaledWidth,
//   scaledHeight,
//   rotation,
// );

//   // Set up rotated canvas
//   rotatedCanvas.width = rotatedWidth;
//   rotatedCanvas.height = rotatedHeight;

//   // Clear and prepare rotated context
//   rotatedCtx.clearRect(0, 0, rotatedWidth, rotatedHeight);
//   rotatedCtx.save();

//   // Center and rotate
//   rotatedCtx.translate(rotatedWidth / 2, rotatedHeight / 2);
//   rotatedCtx.rotate(rotRad);
//   rotatedCtx.scale(zoom, zoom);

//   // Draw image centered
//   rotatedCtx.drawImage(image, -image.width / 2, -image.height / 2);

//   rotatedCtx.restore();

//   // Create cropped canvas
//   const croppedCanvas = document.createElement("canvas");
//   const croppedCtx = croppedCanvas.getContext("2d");
//   if (!croppedCtx) {
//     throw new Error("No 2d context for cropped canvas");
//   }

//   // Set cropped canvas to exact crop dimensions
//   croppedCanvas.width = crop.width;
//   croppedCanvas.height = crop.height;

//   // Clear the canvas
//   croppedCtx.clearRect(0, 0, croppedCanvas.width, croppedCanvas.height);

//   // Draw the cropped area from the rotated canvas
//   croppedCtx.drawImage(
//     rotatedCanvas,
//     crop.x,
//     crop.y,
//     crop.width,
//     crop.height,
//     0,
//     0,
//     crop.width,
//     crop.height,
//   );

//   // Return as blob
//   return new Promise((resolve, reject) => {
//     croppedCanvas.toBlob(
//       (blob) => {
//         if (blob) {
//           resolve(blob);
//         } else {
//           reject(new Error("Canvas is empty"));
//         }
//       },
//       "image/png",
//       1,
//     );
//   });
// }

// Utility function to calculate rotated size
function calculateRotatedSize(
  width: number,
  height: number,
  rotation: number,
): { width: number; height: number } {
  const rotRad = (rotation * Math.PI) / 180;

  // Calculate the absolute dimensions after rotation
  const absWidth =
    Math.abs(width * Math.cos(rotRad)) + Math.abs(height * Math.sin(rotRad));
  const absHeight =
    Math.abs(width * Math.sin(rotRad)) + Math.abs(height * Math.cos(rotRad));

  return {
    width: Math.ceil(absWidth),
    height: Math.ceil(absHeight),
  };
}

// Utility function to calculate rotated size (assuming you have this)
// function rotateSize(
//   width: number,
//   height: number,
//   rotation: number
// ): { width: number; height: number } {
//   const rotRad = (rotation * Math.PI) / 180;
//   return {
//     width: Math.abs(width * Math.cos(rotRad) + height * Math.sin(rotRad)),
//     height: Math.abs(width * Math.sin(rotRad) + height * Math.cos(rotRad))
//   };
// }

export function blobToFile(blob: Blob, fileName: string): File {
  return new File([blob], fileName, {
    type: blob.type,
    lastModified: Date.now(),
  });
}
