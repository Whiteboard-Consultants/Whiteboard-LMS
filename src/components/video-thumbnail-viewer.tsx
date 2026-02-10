'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Play } from 'lucide-react';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import type { VideoInfo } from '@/lib/video-utils';
import { getYouTubeThumbnailFallbacks, getYouTubeThumbnailViaOEmbed } from '@/lib/video-utils';
import { updateVideoProgress, getVideoProgress } from '@/app/student/actions';
import { VIDEO_COMPLETION_THRESHOLD, VIDEO_PROGRESS_SAVE_INTERVAL_SECONDS, VIDEO_PROGRESS_DEBOUNCE_MS } from '@/lib/constants';

// Declare YouTube IFrame API types
declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

interface VideoThumbnailViewerProps {
  videoInfo: VideoInfo;
  originalUrl: string;
  title?: string;
  className?: string;
  enrollmentId?: string;
  lessonId?: string;
  userId?: string;
  onProgressUpdate?: (progress: number) => void;
}

/**
 * Component that displays a video thumbnail with a play button overlay
 * Clicking opens the video in an embedded player or new tab
 * Tracks video watching progress for enrolled students
 * Supports YouTube IFrame API for progress tracking on YouTube videos
 */
export function VideoThumbnailViewer({
  videoInfo,
  originalUrl,
  title = 'Video Lesson',
  className = '',
  enrollmentId,
  lessonId,
  userId,
  onProgressUpdate,
}: VideoThumbnailViewerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentThumbnailUrl, setCurrentThumbnailUrl] = useState(videoInfo.thumbnailUrl);
  const [thumbnailFallbacks, setThumbnailFallbacks] = useState<string[]>([]);
  const [thumbnailLoaded, setThumbnailLoaded] = useState(false);
  const [watchProgress, setWatchProgress] = useState(0);
  const [totalDuration, setTotalDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [ytApiReady, setYtApiReady] = useState(false);
  const [ytContainerReady, setYtContainerReady] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const ytPlayerRef = useRef<any>(null);
  const ytContainerRef = useRef<HTMLDivElement | null>(null);
  const progressTimeoutRef = useRef<NodeJS.Timeout>();
  const progressIntervalRef = useRef<NodeJS.Timeout>();
  const lastProgressUpdateRef = useRef<number>(0);
  const savedProgressRef = useRef<number>(0);

  // Save video progress periodically - defined early so it can be used in effects
  const saveProgress = useCallback(async (currentTime: number, duration: number) => {
    if (!enrollmentId || !lessonId || !userId) return;

    // Only save if at least VIDEO_PROGRESS_SAVE_INTERVAL_SECONDS have passed since last update
    if (Math.abs(currentTime - lastProgressUpdateRef.current) < VIDEO_PROGRESS_SAVE_INTERVAL_SECONDS && currentTime < duration * (1 - VIDEO_COMPLETION_THRESHOLD)) {
      return;
    }

    lastProgressUpdateRef.current = currentTime;

    try {
      await updateVideoProgress(enrollmentId, lessonId, Math.round(currentTime), Math.round(duration), userId);
      console.log('Video progress saved:', { currentTime, duration, percentage: (currentTime / duration * 100).toFixed(2) });
    } catch (error) {
      console.error('Error saving video progress:', error);
    }
  }, [enrollmentId, lessonId, userId]);

  // Load initial progress from database
  useEffect(() => {
    const loadProgress = async () => {
      console.log('VideoThumbnailViewer loadProgress called with:', { enrollmentId, lessonId, userId });
      if (enrollmentId && lessonId) {
        try {
          const progress = await getVideoProgress(enrollmentId, lessonId);
          console.log('Loaded video progress from DB:', progress);
          if (progress) {
            setWatchProgress(progress.watch_time_seconds);
            setTotalDuration(progress.total_duration_seconds);
            savedProgressRef.current = progress.watch_time_seconds;
          }
        } catch (error) {
          console.error('Error loading video progress:', error);
        }
      } else {
        console.log('Missing enrollmentId or lessonId - progress tracking disabled');
      }
      setIsLoading(false);
    };

    loadProgress();
  }, [enrollmentId, lessonId, userId]);

  // Resume video from last watched position when dialog opens
  useEffect(() => {
    if (isOpen && videoRef.current && watchProgress > 0 && totalDuration > 0) {
      console.log('Resuming video from:', { watchProgress, totalDuration });
      videoRef.current.currentTime = watchProgress;
    }
  }, [isOpen, watchProgress, totalDuration]);

  // Load YouTube IFrame API
  useEffect(() => {
    if (videoInfo.platform === 'youtube' && !window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
      
      window.onYouTubeIframeAPIReady = () => {
        console.log('YouTube IFrame API ready');
        setYtApiReady(true);
      };
    } else if (window.YT && window.YT.Player) {
      setYtApiReady(true);
    }
  }, [videoInfo.platform]);

  // Callback ref to detect when container is rendered
  const ytContainerCallback = useCallback((node: HTMLDivElement | null) => {
    ytContainerRef.current = node;
    if (node) {
      setYtContainerReady(true);
    }
  }, []);

  // Initialize YouTube player when all conditions are met
  useEffect(() => {
    if (!isOpen || videoInfo.platform !== 'youtube' || !ytApiReady || !ytContainerReady || ytPlayerRef.current) {
      return;
    }

    if (!ytContainerRef.current) {
      console.log('YouTube container ref not available');
      return;
    }

    console.log('Initializing YouTube player with video ID:', videoInfo.videoId);
    
    const startTime = savedProgressRef.current > 0 ? Math.floor(savedProgressRef.current) : 0;
    console.log('Starting from saved position:', startTime, 'seconds');
    
    try {
      ytPlayerRef.current = new window.YT.Player(ytContainerRef.current, {
        videoId: videoInfo.videoId,
        playerVars: {
          autoplay: 1,
          start: startTime,
          rel: 0,
          modestbranding: 1,
          enablejsapi: 1,
          origin: window.location.origin,
        },
        events: {
          onReady: (event: any) => {
            console.log('YouTube player ready');
            const duration = event.target.getDuration();
            if (duration > 0) {
              setTotalDuration(duration);
            }
            // Start progress tracking interval
            progressIntervalRef.current = setInterval(() => {
              if (ytPlayerRef.current && ytPlayerRef.current.getCurrentTime) {
                try {
                  const currentTime = ytPlayerRef.current.getCurrentTime();
                  const videoDuration = ytPlayerRef.current.getDuration();
                  setWatchProgress(currentTime);
                  setTotalDuration(videoDuration);
                  
                  if (onProgressUpdate && videoDuration > 0) {
                    onProgressUpdate((currentTime / videoDuration) * 100);
                  }
                  
                  // Save progress periodically
                  saveProgress(currentTime, videoDuration);
                } catch (e) {
                  console.log('Error getting video time:', e);
                }
              }
            }, 1000);
          },
          onStateChange: (event: any) => {
            // YT.PlayerState.ENDED = 0
            if (event.data === 0) {
              // Video ended - save final progress
              try {
                const duration = ytPlayerRef.current?.getDuration();
                if (duration) {
                  saveProgress(duration, duration);
                }
              } catch (e) {
                console.log('Error saving final progress:', e);
              }
            }
          },
          onError: (event: any) => {
            console.error('YouTube player error:', event.data);
          },
        },
      });
    } catch (error) {
      console.error('Error creating YouTube player:', error);
    }
  }, [isOpen, videoInfo.platform, videoInfo.videoId, ytApiReady, ytContainerReady, saveProgress, onProgressUpdate]);

  // Cleanup when dialog closes
  useEffect(() => {
    if (isOpen) return;
    
    // Dialog just closed - cleanup player
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = undefined;
    }
    
    if (ytPlayerRef.current) {
      try {
        const currentTime = ytPlayerRef.current.getCurrentTime?.();
        const duration = ytPlayerRef.current.getDuration?.();
        if (currentTime && duration) {
          saveProgress(currentTime, duration);
        }
        ytPlayerRef.current.destroy?.();
      } catch (e) {
        console.log('Error cleaning up YouTube player:', e);
      }
      ytPlayerRef.current = null;
    }
    
    setYtContainerReady(false);
  }, [isOpen, saveProgress]);

  // Load thumbnail
  useEffect(() => {
    console.log('VideoThumbnailViewer mounted with:', { videoInfo, originalUrl, title });
    
    if (videoInfo.platform === 'youtube') {
      const initializeThumbnail = async () => {
        try {
          const oEmbedThumbnail = await getYouTubeThumbnailViaOEmbed(videoInfo.videoId);
          if (oEmbedThumbnail) {
            console.log('Got oEmbed thumbnail:', oEmbedThumbnail);
            setCurrentThumbnailUrl(oEmbedThumbnail);
          } else {
            const fallbacks = getYouTubeThumbnailFallbacks(videoInfo.videoId);
            setThumbnailFallbacks(fallbacks.slice(1));
          }
        } catch (error) {
          console.error('Error fetching oEmbed thumbnail:', error);
          const fallbacks = getYouTubeThumbnailFallbacks(videoInfo.videoId);
          setThumbnailFallbacks(fallbacks.slice(1));
        }
      };
      
      initializeThumbnail();
    }
  }, [videoInfo, originalUrl, title]);

  const handleThumbnailError = () => {
    console.log('Thumbnail failed to load:', currentThumbnailUrl);
    
    if (thumbnailFallbacks.length > 0) {
      const nextUrl = thumbnailFallbacks[0];
      setThumbnailFallbacks(prev => prev.slice(1));
      setCurrentThumbnailUrl(nextUrl);
      console.log('Trying fallback thumbnail:', nextUrl);
    } else {
      console.log('All thumbnail fallbacks exhausted');
    }
  };

  // Handle video time update
  const handleTimeUpdate = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const video = e.currentTarget;
    const currentTime = video.currentTime;
    const duration = video.duration;

    if (!isNaN(duration)) {
      setWatchProgress(currentTime);
      setTotalDuration(duration);
      
      // Update parent component
      if (onProgressUpdate) {
        onProgressUpdate(currentTime / duration * 100);
      }

      // Debounced progress save
      if (progressTimeoutRef.current) {
        clearTimeout(progressTimeoutRef.current);
      }
      progressTimeoutRef.current = setTimeout(() => {
        saveProgress(currentTime, duration);
      }, VIDEO_PROGRESS_DEBOUNCE_MS);
    }
  };

  // Handle video metadata loaded
  const handleLoadedMetadata = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const video = e.currentTarget;
    setTotalDuration(video.duration);
  };

  // When dialog closes, save final progress
  const handleDialogChange = (open: boolean) => {
    if (!open && videoRef.current && enrollmentId && lessonId && userId) {
      // Save final progress when closing
      const currentTime = videoRef.current.currentTime;
      const duration = videoRef.current.duration;
      saveProgress(currentTime, duration);
    }
    setIsOpen(open);
  };

  const progressPercentage = totalDuration > 0 ? (watchProgress / totalDuration) * 100 : 0;

  return (
    <>
      <div className={`relative group cursor-pointer overflow-hidden rounded-lg ${className}`}>
        {/* Thumbnail Image */}
        <img
          src={currentThumbnailUrl}
          alt={title}
          className={`w-full aspect-video object-cover bg-gray-900 group-hover:opacity-75 transition-opacity ${
            !thumbnailLoaded ? 'opacity-0' : 'opacity-100'
          }`}
          onError={handleThumbnailError}
          onLoad={() => {
            console.log('Thumbnail loaded successfully:', currentThumbnailUrl);
            setThumbnailLoaded(true);
          }}
        />

        {/* Fallback Background while loading */}
        <div
          className={`absolute inset-0 bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center transition-opacity ${
            !thumbnailLoaded ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <Play className="h-16 w-16 text-gray-500" />
        </div>

        {/* Play Button Overlay */}
        <div
          className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/30 transition-colors"
          onClick={() => setIsOpen(true)}
        >
          <div className="bg-white/90 rounded-full p-4 group-hover:bg-white transition-all group-hover:scale-110">
            <Play className="h-8 w-8 text-red-600 fill-red-600" />
          </div>
        </div>

        {/* Video Title Overlay */}
        {title && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
            <p className="text-white font-medium text-sm">{title}</p>
          </div>
        )}

        {/* Progress Bar */}
        {!isLoading && progressPercentage > 0 && progressPercentage < 100 && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-700/50">
            <div
              className="h-full bg-red-500 transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        )}

        {/* Completed Badge */}
        {progressPercentage >= VIDEO_COMPLETION_THRESHOLD * 100 && (
          <div className="absolute top-2 right-2 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
            Watched
          </div>
        )}
      </div>

      {/* Video Player Dialog */}
      <Dialog open={isOpen} onOpenChange={handleDialogChange}>
        <DialogContent className="max-w-4xl p-0 bg-black">
          <VisuallyHidden>
            <DialogTitle>{title}</DialogTitle>
          </VisuallyHidden>
          
          {/* Progress indicator inside dialog */}
          {progressPercentage > 0 && (
            <div className="absolute top-0 left-0 right-0 z-10">
              <Progress value={progressPercentage} className="h-1 rounded-none bg-gray-800" />
            </div>
          )}
          
          <div className="aspect-video flex flex-col">
            {videoInfo.platform === 'youtube' ? (
              // YouTube player with API for progress tracking
              <div ref={ytContainerCallback} className="w-full h-full" />
            ) : videoInfo.platform === 'vimeo' ? (
              // Vimeo still uses iframe (no progress tracking)
              <iframe
                src={videoInfo.embedUrl}
                title={title}
                className="w-full h-full"
                allowFullScreen
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              />
            ) : (
              <video
                ref={videoRef}
                src={originalUrl}
                controls
                autoPlay
                className="w-full h-full"
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
              >
                Your browser does not support the video element.
              </video>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Fallback Button for opening in new tab */}
      <div className="mt-4 flex gap-2">
        <Button asChild variant="outline" className="flex-1">
          <a href={originalUrl} target="_blank" rel="noopener noreferrer">
            Open in New Tab
          </a>
        </Button>
        {videoInfo.platform === 'youtube' || videoInfo.platform === 'vimeo' ? (
          <Button variant="default" onClick={() => setIsOpen(true)} className="flex-1">
            Watch Here
          </Button>
        ) : null}
      </div>
    </>
  );
}
