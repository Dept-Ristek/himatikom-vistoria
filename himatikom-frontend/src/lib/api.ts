// API configuration helper - Auto-detect based on hostname
export const getAPIBaseUrl = (): string => {
  if (typeof window === 'undefined') {
    // Server-side: fallback to env variable
    return process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';
  }
  
  // Client-side: detect based on current hostname
  const hostname = window.location.hostname;
  
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    // Local development on desktop
    return 'http://localhost:8000';
  } else {
    // Network IP (for mobile or remote access)
    return `http://${hostname}:8000`;
  }
};

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

export const apiUrl = (endpoint: string): string => {
  const baseUrl = typeof window !== 'undefined' ? getAPIBaseUrl() : API_BASE_URL;
  return `${baseUrl}${endpoint}`;
};

// Convert relative media URL to full URL
export const getMediaUrl = (mediaPath: string): string => {
  if (!mediaPath) return '/images/himatikom.png';
  
  // If already a full URL, return as-is
  if (mediaPath.startsWith('http://') || mediaPath.startsWith('https://')) {
    return mediaPath;
  }
  
  // Extract just the filename from paths like "storage/gallery/sample-image-1.jpg"
  const parts = mediaPath.split('/');
  const filename = parts[parts.length - 1];
  
  // Check if it's a gallery file
  if (mediaPath.includes('gallery')) {
    const baseUrl = typeof window !== 'undefined' ? getAPIBaseUrl() : API_BASE_URL;
    return `${baseUrl}/api/storage/gallery/${filename}`;
  }
  
  // If relative path, prepend API base URL with proper slash
  const baseUrl = typeof window !== 'undefined' ? getAPIBaseUrl() : API_BASE_URL;
  const path = mediaPath.startsWith('/') ? mediaPath : `/${mediaPath}`;
  return `${baseUrl}${path}`;
};
