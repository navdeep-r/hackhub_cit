import { Hackathon } from "../types";

/**
 * Helper to check if a hackathon is expired 
 */
const isExpired = (h: Hackathon) => {
    if (!h.registrationDeadline) return false;
    return new Date(h.registrationDeadline).getTime() < Date.now();
};

export {isExpired}