import type { Server, Socket } from "socket.io";
import { SOCKET_EVENTS } from "../config/constants.js";
import { roomService } from "../services/roomService.js";
import { logger } from "../utils/logger.js";

export const setupChatHandlers = (io: Server, socket: Socket) => {
    /**
     * Handle Text Message from users
     */
    socket.on(SOCKET_EVENTS.TEXT_MESSAGE, (data: { text: string }) => {
        const partnerId = roomService.getPartner(socket.id);

        if (!partnerId) {
            logger.warn(`User ${socket.id} is trying to send a message without a partner`);
            return;
        }

        logger.debug(`Message from ${socket.id} to ${partnerId}: ${data.text}`);

        //Forward message to the partner
        io.to(partnerId).emit(SOCKET_EVENTS.TEXT_MESSAGE, {
            text: data.text,
            timestamp: new Date(),
        });
    });
};