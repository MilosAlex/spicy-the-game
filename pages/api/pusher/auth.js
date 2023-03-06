import { pusher } from "../../../lib/pusher";

export default async function handler(req, res) {
    console.log("auth request", req.body);

    // see https://pusher.com/docs/channels/server_api/authenticating-users
    const { socket_id, channel_name, username, user_id } = req.body;

    // use JWTs here to authenticate users before continuing

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