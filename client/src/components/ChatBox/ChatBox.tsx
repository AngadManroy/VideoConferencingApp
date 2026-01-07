import type React from "react";
import { useEffect, useRef, useState } from "react";
import type { TEXT_MESSAGE } from "../../managers/types";
import './Chatbox.css';

interface ChatBoxProps {
    messages: TEXT_MESSAGE[];
    onSendMessage: (text: string) => void;
    disabled: boolean;
}

export const ChatBox: React.FC<ChatBoxProps> = ({
    messages,
    onSendMessage,
    disabled
}) => {
    const [inputText, setInputText] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }, [messages]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();//stops from refreshing the page, default form behaviour

        if (inputText.trim() && !disabled) {
            onSendMessage(inputText);
            setInputText('');
        }
    }

    console.log('messages', messages);
    return <div className="chat-box">
        <div className="chat-header">
            <h3>Chat</h3>
        </div>

        <div className="messages-container">
            {messages.length === 0 ? (
                <div className="no-messages">No Messages yet. Say Hi! 👋</div>
            ) : (
                messages.map((message, index) => {
                    return (
                        <div key={index} className={`message ${message.isMine ? 'mine' : 'theirs'}`}>
                            <div className="message-content">{message.text}</div>
                            <div className="message-time">{new Date(message.timestamp).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit'
                            })}
                            </div>
                        </div>
                    )
                })
            )}
            <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSubmit} className="message-input-form">
            <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={disabled ? 'Connect to Chat...' : 'Type a message...'}
                disabled={disabled}
                className="message-input"
            />
            <button
                type="submit"
                disabled={disabled}
                className="send-button"
            >
                Send
            </button>
        </form>
    </div>
}