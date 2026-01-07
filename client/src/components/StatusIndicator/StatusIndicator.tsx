import React from "react";
import { ConnectionStatus } from "../../managers/types";
import './StatusIndicator.css';

interface StatusIndicatorProps {
    status: ConnectionStatus
}

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({ status }) => {
    const getStatusText = () => {
        switch (status) {
            case ConnectionStatus.CONNECTED:
                return 'Connected to Stranger';
            case ConnectionStatus.WAITING:
                return 'Looking for partner';
            case ConnectionStatus.DISCONNECTED:
                return 'Not Connected';
            default:
                return 'Unknown';
        }
    }
    return <div className={`status-indicator status-${status}`}>
        <div className="status-dot"></div>
        <span className="status-text">{getStatusText()}</span>
    </div>
}