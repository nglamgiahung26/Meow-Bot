require("dotenv").config();
const express = require("express");
const session = require("express-session");
const axios = require("axios");
const path = require("path");

const app = express();
const PORT = Number(process.env.PORT || 3000);
const CLIENT_ID = process.env.DISCORD_CLIENT_ID;
const CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET;
const REDIRECT_URI = process.env.DISCORD_REDIRECT_URI;
const SESSION_SECRET = process.env.SESSION_SECRET;

if (!CLIENT_ID || !CLIENT_SECRET || !REDIRECT_URI || !SESSION_SECRET) {
  console.error("Thiếu biến môi trường cấu hình Discord/Session.");
  process.exit(1);
}

app.use(express.json());
app.use(session({
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { httpOnly: true, sameSite: "lax", secure: false, maxAge: 7 * 24 * 60 * 60 * 1000 }
}));

// Phục vụ các file tĩnh trong thư mục public
app.use(express.static(path.join(__dirname, "public")));

// Route trang chủ hiển thị index.html
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

function loginRequired(req, res, next) {
  if (!req.session.user || !req.session.accessToken) {
    return res.status(401).json({ error: "not_logged_in" });
  }
  next();
}

app.get("/login", (req, res) => {
  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    response_type: "code",
    scope: "identify guilds"
  });
  res.redirect(`https://discord.com/oauth2/authorize?${params}`);
});

app.get("/callback", async (req, res) => {
  if (!req.query.code) return res.redirect("/?error=no_code");

  try {
    const token = await axios.post(
      "https://discord.com/api/oauth2/token",
      new URLSearchParams({
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        grant_type: "authorization_code",
        code: req.query.code,
        redirect_uri: REDIRECT_URI
      }).toString(),
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    );

    const accessToken = token.data.access_token;
    const user = await axios.get("https://discord.com/api/users/@me", {
      headers: { Authorization: `Bearer ${accessToken}` }
    });

    req.session.user = user.data;
    req.session.accessToken = accessToken;
    res.redirect("/");
  } catch (error) {
    console.error(error.response?.data || error.message);
    res.redirect("/?error=oauth_failed");
  }
});

app.get("/logout", (req, res) => {
  req.session.destroy(() => res.redirect("/"));
});

app.get("/api/me", loginRequired, (req, res) => {
  const u = req.session.user;
  res.json({ id: u.id, username: u.username, global_name: u.global_name, avatar: u.avatar });
});

app.get("/api/servers", loginRequired, async (req, res) => {
  try {
    const response = await axios.get("https://discord.com/api/users/@me/guilds", {
      headers: { Authorization: `Bearer ${req.session.accessToken}` }
    });

    // Manage Server permission = 0x20. Owners are included too.
    const manageable = response.data.filter(guild => {
      const permissions = BigInt(guild.permissions || "0");
      return guild.owner === true || (permissions & BigInt(0x20)) === BigInt(0x20);
    });

    res.json(manageable.map(guild => ({
      id: guild.id,
      name: guild.name,
      icon: guild.icon,
      owner: guild.owner === true
    })));
  } catch (error) {
    console.error(error.response?.data || error.message);
    res.status(502).json({ error: "discord_api_failed" });
  }
});

// Placeholder: later this will call Meow-bot to verify/approve the selected server.
app.post("/api/servers/:guildId/select", loginRequired, (req, res) => {
  res.json({
    ok: true,
    status: "pending_bot_approval",
    guildId: req.params.guildId
  });
});

app.listen(PORT, () => {
  console.log(`Meow-bot Web: http://localhost:${PORT}`);
});
