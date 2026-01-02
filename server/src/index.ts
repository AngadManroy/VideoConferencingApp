import express from "express";
import { createServer } from "http";
import cors from "cors";
import { CONFIG, SOCKET_EVENTS } from "./config/constants.js";
import { Server } from "socket.io";
import { logger } from "./utils/logger.js";
import { setupChatHandlers } from "./handlers/chatHandler.js";
import { setupWebRTCHandlers } from "./handlers/webrtcHandlers.js";
import { setupConnectionHandlers } from "./handlers/ConnectionHandlers.js";

//Initialize app
const app = express();
const httpServer = createServer(app);

//configure cors
app.use(cors({
    origin: CONFIG.CORS_ORIGIN,
    credentials: true,
}))

//initilalise socket io with cors
const io = new Server(httpServer, {
    cors: {
        origin: CONFIG.CORS_ORIGIN,
        credentials: true,
    },
})

//health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString,
    })
})

//socket io connection handler
io.on(SOCKET_EVENTS.CONNECTION, (socket) => {
    //setup all handlers for the connection
    //~authhandler?
    setupConnectionHandlers(io, socket);
    setupChatHandlers(io, socket);
    setupWebRTCHandlers(io, socket);
    console.log("New client connected", socket.id)
})

// Start server
httpServer.listen(CONFIG.PORT, () => {
    logger.info(`Server running on port ${CONFIG.PORT}`);
    logger.info(`CORS enabled for: ${CONFIG.CORS_ORIGIN}`);
    logger.info(`Environment: ${CONFIG.NODE_ENV}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    logger.info('SIGTERM received, closing server...');
    httpServer.close(() => {
        logger.info('Server closed');
        process.exit(0);
    });
});