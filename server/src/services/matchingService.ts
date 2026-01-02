import { logger } from "../utils/logger.js";

class MatchingService {
    private waitingUsers: Set<string> = new Set();

    /**
     * Add User to waiting pool
     */
    addToWaitingPool(socketId: string): void {
        this.waitingUsers.add(socketId);
        logger.info(`User ${socketId} added to waiting pool, WaitingPoolSize: ${this.waitingUsers.size}`);
    }

    /**
     * Remove User from waiting pool
     */
    removeFromWaitingPool(socketId: string): void {
        const removed = this.waitingUsers.delete(socketId);
        if (removed) {
            logger.info(`User ${socketId} removed from waiting pool, WaitingPoolSize: ${this.waitingUsers.size}`);
        }
    }

    /**
     * Find a partner for the user
     * Returns the partner's socket id if found, null otherwise
     */
    findPartner(socketId: string): string | null {
        //Remove the current user from the waiting pool if they're in it
        this.removeFromWaitingPool(socketId);

        //Get the first user in the waiting pool
        const waitingUsersArray = Array.from(this.waitingUsers);
        if (waitingUsersArray.length === 0) {
            logger.debug(`No partner found available for user: ${socketId}`);
            return null;
        }

        //get first user from waiting list
        const partnerId = waitingUsersArray[0]!;

        //remove the partner from waiting pool
        this.removeFromWaitingPool(partnerId);

        logger.info(`Matched ${socketId} with ${partnerId}`);
        return partnerId;
    }

    /**
     * check if a user is in the waiting pool
     */
    isWaiting(socketId: string): boolean {
        return this.waitingUsers.has(socketId);
    }

    /**
   * Get the current size of the waiting pool
   */
    getWaitingPoolSize(): number {
        return this.waitingUsers.size;
    }

    /**
   * Clear the waiting pool (useful for testing/cleanup)
   */
    clearWaitingPool(): void {
        this.waitingUsers.clear();
        logger.info('Waiting pool cleared');
    }
}

//Export a singleton instance
export const matchingService = new MatchingService();