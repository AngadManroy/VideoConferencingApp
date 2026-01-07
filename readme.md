

Important Browser's WebRTC API's methods to know and used in this project:
RTCPeerConnection: connectionstatechange event:

Link: https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection/connectionstatechange_event
The connectionstatechange event is sent to the onconnectionstatechange event handler on an RTCPeerConnection object after a new track has been added to an RTCRtpReceiver which is part of the connection. The new connection state can be found in connectionState, and is one of the string values: new, connecting, connected, disconnected, failed, or closed.

This event is not cancelable and does not bubble.