class PeerService {
    constructor() {
        this.peer = new RTCPeerConnection({
            iceServers: [
                { urls: ['stun:stun.l.google.com:19302', 'stun:global.stun.twilio.com:3478'] },
                // Add your TURN server configuration if needed
            ]
            
        });
        // this.setupDataChannel();

    }
    async getAnswer(offer) {
        if (this.peer) {
            try {
                if (!offer) {
                    throw new Error('Invalid offer provided.');
                }

                await this.peer.setRemoteDescription(new RTCSessionDescription(offer));
                const ans = await this.peer.createAnswer();
                await this.peer.setLocalDescription(new RTCSessionDescription(ans));
                return ans;
            } catch (error) {
                console.error('Error in getAnswer:', error);
                throw error;
            }
        }
    }
    async getoffer() {
        if (this.peer) {
            const offer = await this.peer.createOffer();
            await this.peer.setLocalDescription(new RTCSessionDescription(offer));
            return offer;
        }
    }

    async setLocalDescription(ans) {
        if (this.peer) {
            if (ans) {
                await this.peer.setRemoteDescription(new RTCSessionDescription(ans));
            } else {
                console.error('Invalid answer provided.');
            }
        }
    }
    async handleIceCandidate(candidate) {
        if (this.peer) {
            try {
                const iceCandidate = new RTCIceCandidate(candidate);
                await this.peer.addIceCandidate(iceCandidate);
            } catch (error) {
                console.error('Error adding ICE candidate:', error);
                
            }
        }
    }
    async setupDataChannel() {
        this.dataChannel = this.peer.createDataChannel('chat'); // Create a data channel with label 'chat'
        // this.dataChannel.onopen = () => {
        //     console.log('Data channel opened');
        //     // You can perform actions when the data channel is opened, like sending initial messages
        // };
        this.dataChannel.onmessage = (event) => {
            console.log('Received message:', event.data);
            // Handle incoming messages
        };
        this.dataChannel.onclose = () => {
            console.log('Data channel closed');
            // You can handle the closure of the data channel here
        };
    }
    async sendMessage(message) {
        if (this.dataChannel && this.dataChannel.readyState === 'open') {
            console.log(this.dataChannel.readyState)
            this.dataChannel.send(message);
            console.log('Message sent:', message);

        } else {
            console.error('Data channel is not open or not available');
        }
    }

}

export default new PeerService();
