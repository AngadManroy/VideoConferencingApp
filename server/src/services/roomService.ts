import type { Room } from "../types/index.js";
import { logger } from "../utils/logger.js"

class RoomService {
    private rooms: Map<string, Room> = new Map(); //room_id -> room
    private userToRoom: Map<string, string> = new Map(); //user_id -> room_id
    private userToPartner: Map<string, string> = new Map(); //user_id -> partner_id

    /**
     * Create Room for 2 users
     */
    createRoom(socketId1: string, socketId2: string): string {
        const roomId = this.generateRoomId(socketId1, socketId2);

        const room: Room = {
            id: roomId,
            users: [socketId1, socketId2],
            createdAt: new Date(),
        }

        this.rooms.set(roomId, room);
        this.userToRoom.set(socketId1, roomId);
        this.userToRoom.set(socketId2, roomId);
        this.userToPartner.set(socketId1, socketId2);
        this.userToPartner.set(socketId2, socketId1);

        logger.info(`Room ${roomId} created for users ${socketId1} and ${socketId2}`);
        return roomId;
    }

    /**
   * Get the partner's socketId for a given user
   */
    getPartner(socketId: string): string | null {
        return this.userToPartner.get(socketId) ?? null;
    }

    /**
   * Get the room ID for a given user
   */
    getRoomId(socketId: string): string | null {
        return this.userToRoom.get(socketId) || null;
    }

    /**
     * Get room details
     */
    getRoom(roomId: string): Room | null {
        return this.rooms.get(roomId) || null;
    }

    /**
   * Remove a user from their current room
   */
    removeUserFromRoom(socketId: string): void {
        const roomId = this.userToRoom.get(socketId);
        const partnerId = this.userToPartner.get(socketId);

        if (roomId) {
            this.rooms.delete(roomId);
            logger.info(`Room ${roomId} deleted`);
        }

        // Clean up mappings for both users
        this.userToRoom.delete(socketId);
        this.userToPartner.delete(socketId);

        if (partnerId) {
            this.userToRoom.delete(partnerId);
            this.userToPartner.delete(partnerId);
        }

        logger.info(`User ${socketId} removed from room ${roomId}`);
    }

    /**
     * Check if a user is in a room
     */
    isUserInRoom(socketId: string): boolean {
        return this.userToRoom.has(socketId);
    }

    /**
     * Get all active rooms count
     */
    getActiveRoomsCount(): number {
        return this.rooms.size;
    }

    /**
     * Generate a unique room ID from two socket IDs
     */
    private generateRoomId(socketId1: string, socketId2: string): string {
        // Sort to ensure consistent room ID regardless of order
        const sorted = [socketId1, socketId2].sort();
        return `room_${sorted[0]}_${sorted[1]}`;
    }

}

//Export a singleton instance
export const roomService = new RoomService();
