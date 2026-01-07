export interface TEXT_MESSAGE {
    text: string;
    timestamp: Date;
    isMine: boolean;
}
export const SOCKET_EVENTS = {
    //Connection
    CONNECT: 'connect',
    DISCONNECT: 'disconnect',

    //matching
    FIND_PARTNER: 'find-partner',
    MATCHED: 'matched',
    NEXT_PARTNER: 'next-partner',
    PARTNER_DISCONNECTED: 'partener-disconnected',

    //chat
    TEXT_MESSAGE: 'text-message',

    //webrtc
    WEBRTC_OFFER: 'webrtc-offer',
    WEBRTC_ANSWER: 'webrtc-answer',
    WEBRTC_ICE_CANDIDATE: 'webrtc-ice-candidate',
}

export const ConnectionStatus = {
    "CONNECTED": 'connected',
    "DISCONNECTED": 'disconnected',
    "WAITING": 'waiting'
} as const;


export type ConnectionStatus = typeof ConnectionStatus[keyof typeof ConnectionStatus];