import { socketManager } from "./socketManager";

class WebRTCManager {
    private peerConnection: RTCPeerConnection | null = null;
    private localStream: MediaStream | null = null;
    private onRemoteStreamCallback: ((stream: MediaStream) => void) | null = null;
    private onLocalStreamCallback: ((stream: MediaStream) => void) | null = null;


    //STUN servers for NAT traversal
    private configuration: RTCConfiguration = {
        iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' },
        ]
    }

    /**
     * Initialize Local Media Stream (video+audio)
     */
    async initializeLocalStream(): Promise<MediaStream> {
        try {
            this.localStream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: true
            });

            console.log("Local MediaStream intialized");

            if (this.onLocalStreamCallback) {
                this.onLocalStreamCallback(this.localStream);
            }

            return this.localStream;
        } catch (error) {
            console.error("Error fetching User Media", error);
            throw error;
        }
    }

    /**
     * Create RTC Peer Connection
     */
    createPeerConnection(): void {
        if (this.peerConnection) {
            this.peerConnection.close();
        }

        this.peerConnection = new RTCPeerConnection(this.configuration);

        //Add local stream tracks to peer connection
        if (this.localStream) {
            this.localStream.getTracks().forEach((track) => {
                this.peerConnection!.addTrack(track, this.localStream!);
            });
        }

        //Handle incoming remote streams
        this.peerConnection.ontrack = (event) => {
            console.log("Recieved Remote track");
            const remoteStream = event.streams[0];

            if (remoteStream && this.onRemoteStreamCallback) {
                this.onRemoteStreamCallback(remoteStream);
            }
        };

        //Handle ICE candidates
        this.peerConnection.onicecandidate = (event) => {
            if (event.candidate) {
                console.log('Sending ICE candidate', event.candidate);
                socketManager.sendIceCandidate(event.candidate.toJSON());
            }
        };

        //Handle connection's state changes
        this.peerConnection.onconnectionstatechange = () => {
            console.log('Connection state:', this.peerConnection?.connectionState);
        }

        console.debug("Peer connection created", this.peerConnection);
    }

    /**
     * Create and send offer (initiator)
     */
    async createOffer(): Promise<void> {
        if (!this.peerConnection) {
            console.error('Peer Connection not initialised');
            return;
        }

        try {
            const offer = await this.peerConnection.createOffer();
            await this.peerConnection.setLocalDescription(offer);
            socketManager.sendOffer(offer);
            console.log('Offer created and sent');
        } catch (error) {
            console.error('Error creating offer:', error);
        }
    };

    /**
     * Handle incoming offer and create answer
     */
    async handleOffer(offer: RTCSessionDescriptionInit): Promise<void> {
        if (!this.peerConnection) {
            this.createPeerConnection();
        }

        try {
            await this.peerConnection!.setRemoteDescription(new RTCSessionDescription(offer));
            const answer = await this.peerConnection!.createAnswer();
            await this.peerConnection!.setLocalDescription(answer);
            socketManager.sendAnswer(answer);
            console.log('Offer received, answer sent', offer, answer);
        } catch (error) {
            console.error('Error handling offer:', error);
        }
    }

    /**
     * Handle Incoming answer
     */
    async handleAnswer(answer: RTCSessionDescriptionInit): Promise<void> {
        if (!this.peerConnection) {
            console.log("Peer conenction not initialized");
            return;
        }

        try {
            await this.peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
            console.log("Answer received and set", this.peerConnection);
        } catch (error) {
            console.log("Error handling answer", error);
        }
    }

    /**
     * Handle incoming ICE candidates
     */
    async handleICECandidate(candidate: RTCIceCandidateInit): Promise<void> {
        if (!this.peerConnection) {
            console.log("peer connection not initialized", candidate);
            return;
        }

        try {
            await this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
            console.log("ICE candidate discovered and added to peer connection", candidate);
        } catch (error) {
            console.log("Error handling ICE candidate", error);
        }
    }

    /**
     * Close Peer connections and stop streams
     */
    closeConnection(): void {
        if (this.peerConnection) {
            this.peerConnection.close();
            this.peerConnection = null;
            console.log("Peer connection closed");
            return;
        }
    }

    /**
     * stop local streams
     */
    stopLocalStreams(): void {
        if (this.localStream) {
            this.localStream.getTracks().forEach(track => track.stop());
            this.localStream = null;
            console.log('Local stream stopped');
        }
    }

    /**
     * Set callback for remote stream
     */
    onRemoteStream(callback: (stream: MediaStream) => void): void {
        this.onRemoteStreamCallback = callback;
    }

    /**
     * Set callback for local stream
     */
    onLocalStream(callback: (stream: MediaStream) => void): void {
        this.onLocalStreamCallback = callback;
    }

    /**
     * Get local stream
     */
    getLocalStream(): MediaStream | null {
        return this.localStream;
    }

    /**
     * clean up everything
     */
    cleanup(): void {
        this.closeConnection();
        this.stopLocalStreams();
        this.onLocalStreamCallback = null;
        this.onRemoteStreamCallback = null;
    }

}

export const webRTCManager = new WebRTCManager();