export function personaImageSrc(personaId: string) {
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
  return `${basePath}/personas/${personaId}-geometric-v2.png`;
}
