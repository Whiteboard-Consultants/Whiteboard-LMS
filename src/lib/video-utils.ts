/**
 * Video utility functions for extracting IDs and thumbnails from various platforms
 */

export interface VideoInfo {
  platform: 'youtube' | 'vimeo' | 'unknown';
  videoId: string;
  thumbnailUrl: string;
  embedUrl: string;
}

/**
 * Extract YouTube video ID from various YouTube URL formats
 */
export function getYouTubeVideoId(url: string): string | null {
  const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
  const match = url.match(regExp);
  const videoId = match && match[7].length === 11 ? match[7] : false;
  return videoId ? (videoId as string) : null;
}

/**
 * Extract Vimeo video ID from various Vimeo URL formats
 */
export function getVimeoVideoId(url: string): string | null {
  const vimeoRegex = /(?:vimeo\.com\/)?(?:\/)?([0-9]+)/;
  const match = url.match(vimeoRegex);
  return match ? match[1] : null;
}

/**
 * Get YouTube thumbnail URL via oEmbed API
 * This fetches the actual thumbnail that YouTube displays, including custom uploads
 */
export async function getYouTubeThumbnailViaOEmbed(videoId: string): Promise<string | null> {
  try {
    const response = await fetch(
      `https://www.youtube.com/oembed?url=https://youtu.be/${videoId}&format=json`,
      { cache: 'force-cache' }
    );
    if (response.ok) {
      const data = await response.json();
      return data.thumbnail_url || null;
    }
  } catch (error) {
    console.log('oEmbed fetch failed, will use fallback thumbnails:', error);
  }
  return null;
}

/**
 * Get YouTube thumbnail URL for a video ID
 * Uses maxresdefault for best quality, falls back to alternatives
 */
export function getYouTubeThumbnail(videoId: string): string {
  // Return the highest quality first, will fallback in component if needed
  return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
}

/**
 * Get fallback YouTube thumbnail URLs in order of preference
 */
export function getYouTubeThumbnailFallbacks(videoId: string): string[] {
  return [
    `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
    `https://img.youtube.com/vi/${videoId}/sddefault.jpg`,
    `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
    `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`,
    `https://img.youtube.com/vi/${videoId}/default.jpg`,
  ];
}

/**
 * Get Vimeo thumbnail URL - requires API call, so we use a standard format
 */
export function getVimeoThumbnail(videoId: string): string {
  return `https://vimeo.com/api/v2/video/${videoId}.json`;
}

/**
 * Get YouTube embed URL
 */
export function getYouTubeEmbedUrl(videoId: string): string {
  return `https://www.youtube.com/embed/${videoId}?rel=0`;
}

/**
 * Get Vimeo embed URL
 */
export function getVimeoEmbedUrl(videoId: string): string {
  return `https://player.vimeo.com/video/${videoId}`;
}

/**
 * Detect video platform and extract information
 */
export function detectVideoInfo(url: string): VideoInfo | null {
  // Check for YouTube
  if (url.toLowerCase().includes('youtube.com') || url.toLowerCase().includes('youtu.be')) {
    const videoId = getYouTubeVideoId(url);
    if (videoId) {
      return {
        platform: 'youtube',
        videoId,
        thumbnailUrl: getYouTubeThumbnail(videoId),
        embedUrl: getYouTubeEmbedUrl(videoId),
      };
    }
  }

  // Check for Vimeo
  if (url.toLowerCase().includes('vimeo.com')) {
    const videoId = getVimeoVideoId(url);
    if (videoId) {
      return {
        platform: 'vimeo',
        videoId,
        thumbnailUrl: getVimeoThumbnail(videoId),
        embedUrl: getVimeoEmbedUrl(videoId),
      };
    }
  }

  return null;
}

/**
 * Check if a URL is an embedded video link (not a direct video file)
 */
export function isEmbeddedVideoUrl(url: string): boolean {
  const videoPatterns = [
    'youtube.com',
    'youtu.be',
    'vimeo.com',
    'dailymotion.com',
    'twitch.tv',
    'd.tube',
    'loom.com',
    'wistia.com',
    'wistia.net',
    'video.com',
    'play.google.com',
    'drive.google.com',
    'dropbox.com',
    'box.com',
    'onedrive.live.com',
  ];
  
  return videoPatterns.some(pattern => url.toLowerCase().includes(pattern));
}

/**
 * Check if a URL is a direct video file
 */
export function isDirectVideoFile(url: string): boolean {
  return (
    url.endsWith('.mp4') ||
    url.endsWith('.webm') ||
    url.endsWith('.ogg') ||
    url.endsWith('.mov') ||
    url.endsWith('.avi') ||
    url.endsWith('.mkv')
  );
}
