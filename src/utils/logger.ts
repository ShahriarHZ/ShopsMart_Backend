/* Lightweight structured logger. Swap for winston/pino later if needed. */

type LogMeta = unknown;

const timestamp = (): string => new Date().toISOString();

export const logger = {
  info: (message: string, meta?: LogMeta): void => {
    // eslint-disable-next-line no-console
    console.log(`[INFO] ${timestamp()} - ${message}`, meta ?? '');
  },
  warn: (message: string, meta?: LogMeta): void => {
    // eslint-disable-next-line no-console
    console.warn(`[WARN] ${timestamp()} - ${message}`, meta ?? '');
  },
  error: (message: string, meta?: LogMeta): void => {
    // eslint-disable-next-line no-console
    console.error(`[ERROR] ${timestamp()} - ${message}`, meta ?? '');
  },
  debug: (message: string, meta?: LogMeta): void => {
    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.debug(`[DEBUG] ${timestamp()} - ${message}`, meta ?? '');
    }
  },
};
