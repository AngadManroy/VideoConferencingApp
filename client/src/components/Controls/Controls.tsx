import React from "react";
import { ConnectionStatus } from "../../managers/types";
import './Controls.css';

interface ControlsProps {
    status: ConnectionStatus,
    onStart: () => void,
    onNext: () => void,
    onStop: () => void,
}

export const Controls: React.FC<ControlsProps> = ({ status, onStart, onNext, onStop }) => {
    return (
        <div className="controls">
            {status === ConnectionStatus.DISCONNECTED && (
                <button onClick={onStart} className="btn btn-primary">Start</button>
            )}

            {status === ConnectionStatus.WAITING && (
                <div className="waiting-indicator">
                    <div className="spinner"></div>
                    <span>Looking for someone</span>
                </div>
            )}

            {status === ConnectionStatus.CONNECTED && (
                <>
                    <button onClick={onNext} className="btn btn-secondary">Next</button>
                    <button onClick={onStop} className="btn btn-danger">Stop</button>
                </>
            )}
        </div>)
}