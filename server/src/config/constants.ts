export const CONFIG = {
    PORT: process.env.PORT || 3000,
    CORS_ORIGIN: process.env.CORS_ORIGIN || "http://localhost:5173", //React deafult port
    NODE_ENV: process.env.NODE_ENV || "development",
} as const;

export const SOCKET_EVENTS = {
    // Connection
    CONNECTION: 'connection',
    DISCONNECT: 'disconnect',

    //Matching
    FIND_PARTNER: 'find-partner',
    MATCHED: 'matched',
    PARTNER_DISCONNECTED: 'partner-disconnected',
    NEXT_PARTNER: 'next-partner',

    //Chat
    TEXT_MESSAGE: 'text-message',

    //WebRTC
    WEBRTC_OFFER: 'webrtc-offer',
    WEBRTC_ANSWER: 'webrtc-answer',
    WEBRTC_ICE_CANDIDATE: 'webrtc-ice-candidate',
} as const;