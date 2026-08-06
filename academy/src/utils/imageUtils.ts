export function getDirectImageUrl(url: string | null | undefined): string | undefined {
  if (!url) return undefined;
  
  try {
    // Check if it's a Google Drive URL
    // e.g., https://drive.google.com/file/d/1eRqdzFBsxOUoF0nQwxuHDWyJPBbQIS3O/view
    const driveMatch = url.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);
    if (driveMatch && driveMatch[1]) {
      const fileId = driveMatch[1];
      return `https://drive.google.com/uc?export=view&id=${fileId}`;
    }
    
    // Also handle open?id= format just in case
    const openMatch = url.match(/drive\.google\.com\/open\?id=([a-zA-Z0-9_-]+)/);
    if (openMatch && openMatch[1]) {
      const fileId = openMatch[1];
      return `https://drive.google.com/uc?export=view&id=${fileId}`;
    }
  } catch (e) {
    console.error("Error parsing image URL", e);
  }
  
  // Return original URL if it's not a recognizable Google Drive URL or if parsing fails
  return url;
}
