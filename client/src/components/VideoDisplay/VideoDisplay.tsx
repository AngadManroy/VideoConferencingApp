import type React from "react";
import { useEffect, useRef } from "react";
import './VideoDisplay.css';

interface VideoDisplayProps {
    stream: MediaStream | null;
    isLocal?: boolean;
}

export const VideoDisplay: React.FC<VideoDisplayProps> = ({ stream, isLocal = false }) => {
    const VideoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        if (VideoRef.current && stream) {
            VideoRef.current.srcObject = stream;
        }
    }, [stream]);
    return (
        <div className={`video-container ${isLocal ? 'local' : 'remote'}`}>
            <video
                ref={VideoRef}
                autoPlay
                playsInline
                muted={isLocal}
                className="video-element"
            />
            <div className="video-label">
                {isLocal ? 'You' : 'Stranger'}
            </div>
        </div>
    );
};