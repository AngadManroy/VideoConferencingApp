export interface User {
    socketId: string;
    roomId?: string;
    partnerId?: string;
}

export interface Room {
    id: string;
    users: [string, string]; // [socketId1, socketId2]
    createdAt: Date;
}

export interface TextMessage {
    text: string;
    timestamp: Date;
}

export interface WebRTCSignal {
    type: 'offer' | 'answer' | 'ice-candidate';
    data: any;
}