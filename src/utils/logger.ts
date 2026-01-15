import pino from 'pino';

export const logger = pino({
    level: process.env.LOG_LEVEL || 'info',
    transport: process.env.NODE_ENV === 'development' ? {
        target: 'pino-pretty',
        options: {
            colorize: true,
            translateTime: 'HH:MM:ss',
            ignore: 'pid,hostname',
        },
    } : undefined,
});

// Helper function to create a child logger for a specific component
export const createLogger = (component: string) => {
    return logger.child({ component });
};

export default logger;
