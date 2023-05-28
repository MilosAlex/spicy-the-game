import { pusher } from "../../../lib/pusher";

// Handles the authentication request from Pusher.
export default async function handler(req, res) {
    const { socket_id, channel_name, username, user_id } = req.body;

    const presenceData = {
        user_id,
        user_info: {
            username,
        },
    };

    try {
        const auth = pusher.authorizeChannel(socket_id, channel_name, presenceData);
        res.send(auth);
    } catch (error) {
        console.error(error)
    }

}