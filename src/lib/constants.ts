/**
 * Application-wide constants
 */

// Video Progress Settings
/** Percentage of video that must be watched to mark lesson as complete */
export const VIDEO_COMPLETION_THRESHOLD = 0.9; // 90%

/** Minimum seconds between progress saves to avoid excessive database writes */
export const VIDEO_PROGRESS_SAVE_INTERVAL_SECONDS = 10;

/** Debounce timeout for video progress saves (milliseconds) */
export const VIDEO_PROGRESS_DEBOUNCE_MS = 2000;
