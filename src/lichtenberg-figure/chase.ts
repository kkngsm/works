export const chase = (
  pixels: Uint8Array,
  width: number,
  height: number
): Uint8Array => {
  const X = (x: number, y: number) => {
    return x + y * width;
  };
  const energy = new Uint8Array(width * height * 4);
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      if (
        pixels[X(x, y) * 4] === 255 &&
        pixels[X(x + 1, y) * 4 + 1] !== 0 &&
        pixels[X(x, y + 1) * 4 + 2] !== 0 &&
        pixels[X(x - 1, y) * 4 + 1] !== 2 &&
        pixels[X(x, y - 1) * 4 + 2] !== 2
      ) {
        energy[X(x, y) * 4] = 1;
        let pos: [number, number] = [
          x + (pixels[X(x, y) * 4 + 1] as number) - 1,
          y + (pixels[X(x, y) * 4 + 2] as number) - 1,
        ];
        let i = 1;
        while (
          (energy[X(pos[0], pos[1]) * 4] as number) < i &&
          (pixels[X(pos[0], pos[1]) * 4 + 1] !== 1 ||
            pixels[X(pos[0], pos[1]) * 4 + 2] !== 1)
        ) {
          const tempPos = X(pos[0], pos[1]) * 4;
          if (i < 256) {
            energy[tempPos] = i;
          } else if (i < 512) {
            energy[tempPos] = 255;
            energy[tempPos + 1] = i - 256;
          } else if (i < 768) {
            energy[tempPos] = 255;
            energy[tempPos + 1] = 255;
            energy[tempPos + 2] = i - 512;
          } else if (i < 1024) {
            energy[tempPos] = 255;
            energy[tempPos + 1] = 255;
            energy[tempPos + 2] = 255;
            energy[tempPos + 3] = i - 1024;
          } else if (i < 1280) {
            energy[tempPos] = 255;
            energy[tempPos + 1] = 255;
            energy[tempPos + 2] = 255;
            energy[tempPos + 3] = 255;
            energy[tempPos + 3] = i - 1024;
          } else {
            energy[tempPos] = 255;
            energy[tempPos + 1] = 255;
            energy[tempPos + 2] = 255;
            energy[tempPos + 3] = 255;
            energy[tempPos + 3] = 255;
          }
          i++;
          pos[0] += (pixels[tempPos + 1] as number) - 1;
          pos[1] += (pixels[tempPos + 2] as number) - 1;
        }
      }
    }
  }
  return energy;
};
