export function imageToBase64(image: Buffer) {
  return `data:image/png;base64,${image.toString("base64")}`;
}
