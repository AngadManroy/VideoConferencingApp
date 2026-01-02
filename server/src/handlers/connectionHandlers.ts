import type { Server, Socket } from "socket.io";
import { matchingService } from "../services/matchingService.js";
import { roomService } from "../services/roomService.js";
import { logger } from "../utils/logger.js";
import { SOCKET_EVENTS } from "../config/constants.js";

export const setupConnectionHandlers = (io: Server, socket: Socket) => {
    logger.info("New client connected: ", socket.id)

    /**
     * Handle user requesting partner
     */

    socket.on(SOCKET_EVENTS.FIND_PARTNER, () => {
        logger.info(`User ${socket.id} looking for partner`);

        //trying to find a partner
        const partnerId = matchingService.findPartner(socket.id);

        if (partnerId) {
            //Partner found, create a room
            const roomId = roomService.createRoom(socket.id, partnerId);

            //Notify both users about the match
            socket.emit(SOCKET_EVENTS.MATCHED, { partnerId, roomId });
            io.to(partnerId).emit(SOCKET_EVENTS.MATCHED, { partnerId: socket.id, roomId });

            logger.info(`Match made client_1: ${socket.id} and client_2: ${partnerId} in room_id: ${roomId}`)
        } else {
            //No Partner available, add to waiting pool
            matchingService.addToWaitingPool(socket.id);
            logger.info(`User ${socket.id} added to waiting pool`);

        }
    });

    /**
     * Handle user requesting new partner
     */
    socket.on(SOCKET_EVENTS.NEXT_PARTNER, () => {
        logger.info(`User ${socket.id} requesting a new partner`);

        const partnerId = roomService.getPartner(socket.id);

        //Notify the partner that they have been disconnected
        if (partnerId) {
            io.to(partnerId).emit(SOCKET_EVENTS.PARTNER_DISCONNECTED);
            logger.info(`Notified ${partnerId} of disconnection`);
        }

        // Remove both users from current room
        roomService.removeUserFromRoom(socket.id);

        // Remove from waiting pool if they're in it
        matchingService.removeFromWaitingPool(socket.id);

        // Automatically start looking for new partner
        const newPartnerId = matchingService.findPartner(socket.id);

        if (newPartnerId) {
            const roomId = roomService.createRoom(socket.id, newPartnerId);
            socket.emit(SOCKET_EVENTS.MATCHED, { partnerId: newPartnerId, roomId })
            io.to(newPartnerId).emit(SOCKET_EVENTS.MATCHED, { partnerId: socket.id, roomId })
            logger.info(`New Match created client_1: ${socket.id} and client_2: ${newPartnerId} in room_id: ${roomId}`)
        } else {
            matchingService.addToWaitingPool(socket.id);
            logger.info(`User ${socket.id} added to waiting pool`);
        }
    })

    /**
     * Handle user disconnecting
     */
    socket.on(SOCKET_EVENTS.DISCONNECT, () => {
        logger.info(`User ${socket.id} disconnected`);

        const partnerId = roomService.getPartner(socket.id);

        // Notify partner if they had one
        if (partnerId) {
            io.to(partnerId).emit(SOCKET_EVENTS.PARTNER_DISCONNECTED);
            logger.info(`Notified ${partnerId} of partner disconnect`);
        }

        // Clean up
        roomService.removeUserFromRoom(socket.id);
        matchingService.removeFromWaitingPool(socket.id);

        logger.info(`Cleanup completed for ${socket.id}`);
    })
}