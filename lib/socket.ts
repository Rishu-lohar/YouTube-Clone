import { io } from "socket.io-client";

const backendUrl =
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  "https://youtube-clone-crtz.onrender.com";

const socket = io(backendUrl, {
  autoConnect: false,
});

export default socket;