import { createServer } from "node:http";
import next from "next";
import { parse } from "node:url";
import { Server, Socket } from "socket.io";

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = 3000;

// Initialize Next.js
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url!, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error("Error occurred handling", req.url, err);
      res.statusCode = 500;
      res.end("internal server error");
    }
  });

  // Attach Socket.IO to the HTTP server
  const io = new Server(httpServer, {
    path: "/api/socket/io", // Custom path to avoid conflicts
    addTrailingSlash: false,
    cors: {
      origin: "*", // Adjust for production later
    },
  });

  // Store io instance globally so Server Actions can access it
  // (This is a simplified approach for a single-server setup)
  (global as any).io = io;

  io.on("connection", (socket) => {
    console.log(`🔌 Client connected: ${socket.id}`);

    socket.on("join-room", (room) => {
      socket.join(room);
      console.log(`👤 Socket ${socket.id} joined ${room}`);
    });

    socket.on("disconnect", () => {
      console.log(`❌ Client disconnected: ${socket.id}`);
    });
  });

  httpServer
    .once("error", (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> 🚀 Ready on http://${hostname}:${port}`);
    });
});
