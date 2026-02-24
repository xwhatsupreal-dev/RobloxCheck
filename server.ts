import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Roblox Proxy Routes
  app.post("/api/roblox/check", async (req, res) => {
    const { username } = req.body;
    if (!username) {
      return res.status(400).json({ error: "Username is required" });
    }

    try {
      // 1. Get UserId from Username
      const userResponse = await fetch("https://users.roblox.com/v1/usernames/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ usernames: [username], excludeBannedUsers: true }),
      });

      const userData = await userResponse.json();
      if (!userData.data || userData.data.length === 0) {
        return res.status(404).json({ error: "User not found" });
      }

      const userId = userData.data[0].id;
      const displayName = userData.data[0].displayName;

      // 2. Get Presence
      const presenceResponse = await fetch("https://presence.roblox.com/v1/presence/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userIds: [userId] }),
      });

      const presenceData = await presenceResponse.json();
      const presence = presenceData.userPresences[0];

      // 3. Get Thumbnail
      const thumbResponse = await fetch(`https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${userId}&size=420x420&format=Png&isCircular=false`);
      const thumbData = await thumbResponse.json();
      const imageUrl = thumbData.data?.[0]?.imageUrl || "";

      // presenceType: 0 = Offline, 1 = Online, 2 = InGame, 3 = InStudio
      let status = "Offline";
      let gameName = "";

      if (presence.userPresenceType === 1) status = "Online";
      if (presence.userPresenceType === 2) {
        status = "In Game";
        gameName = presence.lastLocation || "Unknown Game";
      }
      if (presence.userPresenceType === 3) status = "In Studio";

      res.json({
        userId,
        username,
        displayName,
        status,
        gameName,
        presenceType: presence.userPresenceType,
        imageUrl
      });
    } catch (error) {
      console.error("Roblox API Error:", error);
      res.status(500).json({ error: "Failed to fetch Roblox data" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
