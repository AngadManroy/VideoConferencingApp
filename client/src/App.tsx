import { useEffect, useRef, useState } from "react"
import { ConnectionStatus, SOCKET_EVENTS, type TEXT_MESSAGE } from "./managers/types";
import { Controls } from "./components/Controls/Controls";
import { socketManager } from "./managers/socketManager";
import { webRTCManager } from "./managers/webRTCManager";
import { StatusIndicator } from "./components/StatusIndicator/StatusIndicator";
import { VideoDisplay } from "./components/VideoDisplay/VideoDisplay";
import './App.css'
import { ChatBox } from "./components/ChatBox/ChatBox";

export default function App() {
  const [status, setStatus] = useState<ConnectionStatus>(ConnectionStatus.DISCONNECTED);
  const [localStream, setLocalStram] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [messages, setMessages] = useState<TEXT_MESSAGE[]>([]);
  const isInitialized = useRef(false);

  useEffect(() => {
    //Prevent double initialization in strict mode
    if (isInitialized.current) return;
    isInitialized.current = true;

    //connect to socket io server
    socketManager.connect();

    //setup WebRTC callbacks
    webRTCManager.onLocalStream((stream) => {
      console.log('Local stream received', stream);
      setLocalStram(stream);
    })

    webRTCManager.onRemoteStream((stream) => {
      console.log('Remote stream received', stream);
      setRemoteStream(stream);
    })

    //Setup Socket IO events and listeners
    const handleMatched = async (data: { partnerId: string, roomId: string }) => {
      console.log('Matched with partner', data.partnerId);
      setStatus(ConnectionStatus.CONNECTED);
      setMessages([]); //clear previous chat

      //create peer connection and send offer
      webRTCManager.createPeerConnection();
      if (socketManager.getSocketId()! < data.partnerId) {
        await webRTCManager.createOffer();
      }
    }

    const handlePartnerDisconnected = () => {
      console.log("Partner Disconnected");
      webRTCManager.closeConnection();
      setRemoteStream(null);
      setStatus(ConnectionStatus.DISCONNECTED);
    }

    const handleTextMessage = (data: { text: string, timestamp: Date }) => {
      console.log("Received Text", data.text);
      setMessages((prev) => [
        ...prev,
        {
          text: data.text,
          timestamp: data.timestamp,
          isMine: false,
        }
      ])
    }

    const handleWebRTCOffer = async (data: { offer: RTCSessionDescriptionInit }) => {
      console.log("Received WebRTC offer", data.offer);
      //create a peer connection before handling offer
      webRTCManager.createPeerConnection();
      await webRTCManager.handleOffer(data.offer);
    }

    const handleWebRTCAnswer = async (data: { answer: RTCSessionDescriptionInit }) => {
      console.log('Received WebRTC answer');
      await webRTCManager.handleAnswer(data.answer);
    }

    const handleWebRTCIceCandidate = async (data: { candidate: RTCIceCandidateInit }) => {
      console.log('Received ICE candidate');
      await webRTCManager.handleICECandidate(data.candidate);
    };

    // Register event handlers
    socketManager.on(SOCKET_EVENTS.MATCHED, handleMatched);
    socketManager.on(SOCKET_EVENTS.PARTNER_DISCONNECTED, handlePartnerDisconnected);
    socketManager.on(SOCKET_EVENTS.TEXT_MESSAGE, handleTextMessage);
    socketManager.on(SOCKET_EVENTS.WEBRTC_OFFER, handleWebRTCOffer);
    socketManager.on(SOCKET_EVENTS.WEBRTC_ANSWER, handleWebRTCAnswer);
    socketManager.on(SOCKET_EVENTS.WEBRTC_ICE_CANDIDATE, handleWebRTCIceCandidate);

    // Cleanup on unmount
    return () => {
      socketManager.off(SOCKET_EVENTS.MATCHED);
      socketManager.off(SOCKET_EVENTS.PARTNER_DISCONNECTED);
      socketManager.off(SOCKET_EVENTS.TEXT_MESSAGE);
      socketManager.off(SOCKET_EVENTS.WEBRTC_OFFER);
      socketManager.off(SOCKET_EVENTS.WEBRTC_ANSWER);
      socketManager.off(SOCKET_EVENTS.WEBRTC_ICE_CANDIDATE);
      webRTCManager.cleanup();
      socketManager.disconnect();
    };

  }, []);

  const handleStart = async () => {
    try {
      //initialise local stream
      await webRTCManager.initializeLocalStream();

      //find a partner
      setStatus(ConnectionStatus.WAITING);
      socketManager.findPartner();
    } catch (error) {
      console.error("Error starting", error);
      alert("Could not access camera/microphone. Please allow Permissions");
    }
  }

  const handleSendMessage = (text: string) => {
    socketManager.sendMessage(text);

    //Add to Local Messages
    setMessages((prev) => [
      ...prev,
      {
        text: text,
        timestamp: new Date(),
        isMine: true,
      }
    ])
  }

  const handleNext = () => {
    //cleanup current connection
    webRTCManager.closeConnection();
    setRemoteStream(null);
    setMessages([]);

    //Get new partner
    setStatus(ConnectionStatus.WAITING);
    socketManager.nextPartner();
  }

  const handleStop = () => {
    //cleanup everything
    webRTCManager.cleanup();
    socketManager.disconnect();

    setStatus(ConnectionStatus.DISCONNECTED);
    setLocalStram(null);
    setRemoteStream(null);
    setMessages([]);

    //Reconnect socket for next time
    setTimeout(() => {
      socketManager.connect();
    }, 100);
  }

  return (
    <div className="app">
      <header className="header">
        <h1>P2P Video Conferencing</h1>
        <StatusIndicator status={status} />
      </header>
      <div className="main-content">
        <div className="video-section">
          <VideoDisplay stream={remoteStream} />
          <VideoDisplay stream={localStream} isLocal={true} />
        </div>
        <div className="sidebar">
          <ChatBox
            messages={messages}
            onSendMessage={handleSendMessage}
            disabled={status !== ConnectionStatus.CONNECTED}
          />
        </div>
      </div>
      <footer className="footer">
        <Controls
          status={status}
          onStart={handleStart}
          onNext={handleNext}
          onStop={handleStop} />
      </footer>
    </div>
  )
}