/**
 * Centralized logging utility for WhitedgeLMS
 * 
 * Features:
 * - Environment-gated logging (dev only by default)
 * - Structured logging with labels and context
 * - Different log levels (debug, info, warn, error)
 * - Console styling for development
 * - Production-ready (can be extended for external logging services)
 * 
 * Usage:
 * import { logger } from '@/lib/logger';
 * 
 * logger.debug('component', 'User logged in', { userId: 123 });
 * logger.error('api', 'Payment failed', error);
 * logger.warn('storage', 'Upload took longer than expected');
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';
type LogContext = Record<string, any>;

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  source: string;
  message: string;
  context?: LogContext;
  error?: Error;
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development';
  private isServer = typeof window === 'undefined';
  private logHistory: LogEntry[] = [];
  private maxHistorySize = 100;

  /**
   * Debug level logging (most verbose)
   * Use for detailed development information
   */
  debug(source: string, message: string, context?: LogContext): void {
    this.log('debug', source, message, context);
  }

  /**
   * Info level logging (normal operations)
   * Use for important lifecycle events
   */
  info(source: string, message: string, context?: LogContext): void {
    this.log('info', source, message, context);
  }

  /**
   * Warning level logging (potential issues)
   * Use for deprecated features, unusual patterns
   */
  warn(source: string, message: string, context?: LogContext): void {
    this.log('warn', source, message, context);
  }

  /**
   * Error level logging (problems)
   * Use for exceptions, failures
   * Always logged regardless of environment
   */
  error(source: string, message: string, errorOrContext?: Error | LogContext, context?: LogContext): void {
    let error: Error | undefined;
    let finalContext = context;

    if (errorOrContext instanceof Error) {
      error = errorOrContext;
      finalContext = context;
    } else if (typeof errorOrContext === 'object') {
      finalContext = errorOrContext;
    }

    this.log('error', source, message, finalContext, error);
  }

  /**
   * Core logging implementation
   */
  private log(
    level: LogLevel,
    source: string,
    message: string,
    context?: LogContext,
    error?: Error
  ): void {
    // Skip debug/info/warn in production
    if (!this.isDevelopment && level !== 'error') {
      return;
    }

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      source,
      message,
      ...(context && { context }),
      ...(error && { error }),
    };

    this.logHistory.push(entry);
    if (this.logHistory.length > this.maxHistorySize) {
      this.logHistory.shift();
    }

    // Output to console with styling
    this.outputToConsole(entry);

    // TODO: Send error logs to external service in production
    // if (level === 'error') {
    //   this.sendToErrorTracking(entry);
    // }
  }

  /**
   * Output logs to console with appropriate styling
   */
  private outputToConsole(entry: LogEntry): void {
    const { timestamp, level, source, message, context, error } = entry;
    const prefix = `[${timestamp}] [${source.toUpperCase()}]`;

    const colors = {
      debug: '\x1b[36m', // Cyan
      info: '\x1b[32m',  // Green
      warn: '\x1b[33m',  // Yellow
      error: '\x1b[31m', // Red
      reset: '\x1b[0m',
    };

    const color = colors[level];
    const levelStr = level.toUpperCase().padEnd(5);

    if (typeof console !== 'undefined') {
      const logMessage = `${color}${prefix} ${levelStr}${colors.reset} ${message}`;

      switch (level) {
        case 'error':
          console.error(logMessage, context || '', error || '');
          break;
        case 'warn':
          console.warn(logMessage, context || '');
          break;
        case 'info':
          console.info(logMessage, context || '');
          break;
        case 'debug':
        default:
          console.log(logMessage, context || '');
      }
    }
  }

  /**
   * Get log history for debugging/monitoring
   */
  getHistory(filter?: { level?: LogLevel; source?: string; limit?: number }): LogEntry[] {
    let history = [...this.logHistory];

    if (filter?.level) {
      history = history.filter(e => e.level === filter.level);
    }

    if (filter?.source) {
      history = history.filter(e => e.source.toLowerCase().includes(filter.source!.toLowerCase()));
    }

    if (filter?.limit) {
      history = history.slice(-filter.limit);
    }

    return history;
  }

  /**
   * Clear log history
   */
  clearHistory(): void {
    this.logHistory = [];
  }

  /**
   * Get recent errors for error tracking
   */
  getRecentErrors(limit: number = 10): LogEntry[] {
    return this.getHistory({ level: 'error', limit });
  }

  /**
   * Export logs for debugging
   */
  exportLogs(): string {
    return JSON.stringify(this.logHistory, null, 2);
  }

  /**
   * Send to external error tracking service (Sentry, etc.)
   * TODO: Implement when error tracking service is set up
   */
  private sendToErrorTracking(entry: LogEntry): void {
    // if (window.Sentry) {
    //   window.Sentry.captureException(entry.error, {
    //     level: entry.level,
    //     tags: { source: entry.source },
    //     extra: entry.context,
    //   });
    // }
  }
}

// Export singleton instance
export const logger = new Logger();

/**
 * Specialized loggers for common use cases
 */

export const authLogger = {
  login: (email: string, success: boolean) =>
    logger.info('auth', success ? `User logged in: ${email}` : `Login failed: ${email}`),
  logout: (userId: string) =>
    logger.info('auth', `User logged out: ${userId}`),
  signup: (email: string) =>
    logger.info('auth', `New signup: ${email}`),
  tokenRefresh: (userId: string, success: boolean) =>
    logger.debug('auth', success ? `Token refreshed: ${userId}` : `Token refresh failed: ${userId}`),
  error: (message: string, error: Error) =>
    logger.error('auth', message, error),
};

export const storageLogger = {
  uploadStart: (fileName: string, size: number) =>
    logger.debug('storage', `Upload started: ${fileName}`, { size }),
  uploadSuccess: (fileName: string, url: string) =>
    logger.info('storage', `Upload successful: ${fileName}`, { url }),
  uploadError: (fileName: string, error: Error) =>
    logger.error('storage', `Upload failed: ${fileName}`, error),
  deleteStart: (path: string) =>
    logger.debug('storage', `Delete started: ${path}`),
  deleteSuccess: (path: string) =>
    logger.info('storage', `Delete successful: ${path}`),
  deleteError: (path: string, error: Error) =>
    logger.error('storage', `Delete failed: ${path}`, error),
};

export const dbLogger = {
  query: (source: string, duration: number) =>
    logger.debug('database', `Query completed`, { source, duration }),
  error: (source: string, message: string, error: Error) =>
    logger.error('database', message, { source }, error),
  transaction: (operation: string, success: boolean) =>
    logger.info('database', `Transaction ${success ? 'committed' : 'rolled back'}`, { operation }),
};

export const paymentLogger = {
  initiatePayment: (courseId: string, amount: number) =>
    logger.info('payment', `Payment initiated`, { courseId, amount }),
  verifyStart: (orderId: string) =>
    logger.debug('payment', `Verifying payment`, { orderId }),
  verifySuccess: (orderId: string, amount: number) =>
    logger.info('payment', `Payment verified`, { orderId, amount }),
  verifyError: (orderId: string, error: Error) =>
    logger.error('payment', `Payment verification failed`, { orderId }, error),
  refund: (orderId: string, amount: number, reason: string) =>
    logger.info('payment', `Refund processed`, { orderId, amount, reason }),
};

export const apiLogger = {
  requestStart: (method: string, path: string, userId?: string) =>
    logger.debug('api', `${method} ${path}`, { userId }),
  requestSuccess: (method: string, path: string, duration: number, statusCode: number) =>
    logger.info('api', `${method} ${path} completed`, { duration, statusCode }),
  requestError: (method: string, path: string, statusCode: number, error: Error) =>
    logger.error('api', `${method} ${path} failed`, { statusCode }, error),
  unauthorized: (path: string, reason: string) =>
    logger.warn('api', `Unauthorized access attempt: ${path}`, { reason }),
  forbidden: (path: string, userId: string) =>
    logger.warn('api', `Forbidden access attempt: ${path}`, { userId }),
};

export const performanceLogger = {
  slowQuery: (query: string, duration: number) =>
    logger.warn('performance', `Slow query detected`, { query, duration }),
  slowEndpoint: (endpoint: string, duration: number) =>
    logger.warn('performance', `Slow API endpoint`, { endpoint, duration }),
  memoryWarning: (usage: number) =>
    logger.warn('performance', `High memory usage`, { usage }),
};
