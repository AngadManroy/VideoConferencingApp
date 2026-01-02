const getTimeStamp = () => new Date().toISOString();

export const logger = {
    info: (message: string, ...args: any[]) => {
        console.log(`[${getTimeStamp()}] INFO:`, message, ...args);
    },
    error: (message: string, ...args: any[]) => {
        console.error(`[${getTimeStamp()}] ERROR:`, message, ...args);
    },
    warn: (message: string, ...args: any[]) => {
        console.warn(`[${getTimeStamp()}] WARN:`, message, ...args);
    },
    debug: (message: string, ...args: any[]) => {
        console.debug(`[${getTimeStamp()}] DEBUG:`, message, ...args);
    },
}