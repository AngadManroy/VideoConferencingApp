import { io, Socket } from "socket.io-client";
import { SOCKET_EVENTS } from "./types";

const SERVER_URL = 'http://localhost:3000';

class SocketManager {
    private socket: Socket | null = null;
    private eventHandlers: Map<string, (...args: any[]) => void> = new Map();

    /**
     * Initialise socket connection
     */
    connect(): void {
        if (this.socket?.connected) {
            console.log("Socket already running");
            return;
        }

        this.socket = io(SERVER_URL, {
            transports: ['websocket'],
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
        })

        this.socket.on(SOCKET_EVENTS.CONNECT, () => {
            console.log("Connected to server: ", this.socket?.id)
        })

        this.socket.on(SOCKET_EVENTS.DISCONNECT, () => {
            console.log("disconnected from server: ", this.socket?.id)
        })

        this.eventHandlers.forEach((handler, event) => {
            this.socket!.on(event, handler);//debug
        })

    }

    /**
     * Disconenct from server
     */
    disconnect(): void {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }

    /**
     * Register an event Handler
     */

    on(event: string, handler: (...args: any[]) => void): void {
        this.eventHandlers.set(event, handler);
        if (this.socket) {
            this.socket.on(event, handler);
        }
    }

    /**
     * Remove event handler
     */
    off(event: string): void {
        this.eventHandlers.delete(event);
        if (this.socket) {
            this.socket.off(event);
        }
    }

    /**
     * find a partner
     */
    findPartner(): void {
        if (!this.socket) {
            console.error("socket not connected");
            return;
        }
        console.log("FINDING A PARTNER....");
        this.socket.emit(SOCKET_EVENTS.FIND_PARTNER);
    }

    /**
     * Request a new partner
     */
    nextPartner(): void {
        if (!this.socket) {
            console.error("socket not connected");
            return;
        }
        console.log("FINDING NEW PARTNER...");
        this.socket.emit(SOCKET_EVENTS.NEXT_PARTNER);
    }

    /**
     * Send a text message to partner
     */
    sendMessage(text: string): void {
        if (!this.socket) {
            console.error("socket not connected");
            return;
        }
        this.socket.emit(SOCKET_EVENTS.TEXT_MESSAGE, { text });
    }

    /**
     * send WebRTC offer
     */
    sendOffer(offer: RTCSessionDescriptionInit): void {
        if (!this.socket) {
            console.error("socket not connected");
            return;
        }
        this.socket.emit(SOCKET_EVENTS.WEBRTC_OFFER, { offer });
    }

    /**
     * send WebRTC answer
     */
    sendAnswer(answer: RTCSessionDescriptionInit): void {
        if (!this.socket) {
            console.error("socket not connected");
            return;
        }
        this.socket.emit(SOCKET_EVENTS.WEBRTC_ANSWER, { answer });
    }

    /**
     * send ICE candidate
     */
    sendIceCandidate(candidate: RTCIceCandidateInit): void {
        if (!this.socket) {
            console.error("socket not connected");
            return;
        }
        this.socket.emit(SOCKET_EVENTS.WEBRTC_ICE_CANDIDATE, { candidate });
    }

    /**
     * check if socket is connected
     */
    isConnected(): boolean {
        return this.socket?.connected ?? false;
    }

    getSocketId(): string | null {
        return this.socket?.id ?? null;
    }
}

export const socketManager = new SocketManager();