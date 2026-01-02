import { Server, Socket } from 'socket.io';
import { SOCKET_EVENTS } from '../config/constants.js';
import { roomService } from '../services/roomService.js';
import { logger } from '../utils/logger.js';

export const setupWebRTCHandlers = (io: Server, socket: Socket) => {
    /**
     * Handle WebRTC offer (initiating peer wants to connect)
     */
    socket.on(SOCKET_EVENTS.WEBRTC_OFFER, (data: { offer: RTCSessionDescriptionInit }) => {
        const partnerId = roomService.getPartner(socket.id);

        if (!partnerId) {
            logger.warn(`User ${socket.id} tried to send offer without partner`);
            return;
        }

        logger.debug(`WebRTC offer from ${socket.id} to ${partnerId}`);

        // Forward offer to partner
        io.to(partnerId).emit(SOCKET_EVENTS.WEBRTC_OFFER, {
            offer: data.offer,
        });
    });

    /**
     * Handle WebRTC answer (receiving peer responding to offer)
     */
    socket.on(SOCKET_EVENTS.WEBRTC_ANSWER, (data: { answer: RTCSessionDescriptionInit }) => {
        const partnerId = roomService.getPartner(socket.id);

        if (!partnerId) {
            logger.warn(`User ${socket.id} tried to send answer without partner`);
            return;
        }

        logger.debug(`WebRTC answer from ${socket.id} to ${partnerId}`);

        // Forward answer to partner
        io.to(partnerId).emit(SOCKET_EVENTS.WEBRTC_ANSWER, {
            answer: data.answer,
        });
    });

    /**
     * Handle ICE candidates (network path information)
     */
    socket.on(SOCKET_EVENTS.WEBRTC_ICE_CANDIDATE, (data: { candidate: RTCIceCandidateInit }) => {
        const partnerId = roomService.getPartner(socket.id);

        if (!partnerId) {
            logger.warn(`User ${socket.id} tried to send ICE candidate without partner`);
            return;
        }

        logger.debug(`ICE candidate from ${socket.id} to ${partnerId}`);

        // Forward ICE candidate to partner
        io.to(partnerId).emit(SOCKET_EVENTS.WEBRTC_ICE_CANDIDATE, {
            candidate: data.candidate,
        });
    });
};