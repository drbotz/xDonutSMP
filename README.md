# xDonutSMP

**xDonutSMP** is a custom-built Discord bot tailored for managing and enhancing gameplay on a Minecraft Survival Multiplayer (SMP) server. It integrates server statistics, player economy features, and a control panel with Discord's UI to offer seamless management tools and interactivity for server staff and players.

---

## ✨ Features

- **Economy System**: Query and manage in-game currency balances (`bal`, `add`, `remove`).
- **Player Stats**: Track player deaths, kills, playtime, and online status.
- **Account Linking**: Link Minecraft IGN to Discord accounts.
- **Ticketing System**: Open, edit, and manage support tickets.
- **Interactive Panel**: GUI with buttons (e.g., Submit, Cancel, Approve) for easier control.
- **Server Sync**: Live online tracking and command integration.

---

## 🚀 Installation

### Requirements

- Node.js v18+
- Discord Bot Token
- MongoDB URI (for persistence)

### Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/yourusername/xDonutSMP.git
   cd xDonutSMP
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure environment**:
   Create a `.env` file in the root:
   ```env
   DISCORD_TOKEN=your_discord_token
   MONGO_URI=your_mongodb_uri
   GUILD_ID=your_server_id
   ```

4. **Start the bot**:
   ```bash
   npm run start
   ```

---

## 🔧 Configuration

The main configuration file is `config.js` inside the `dist` folder. You can customize settings like default prefixes, embed colors, and panel behavior.

---

## 📄 Commands

Located in the `dist/commands/` directory:

- `/bal` – View a player's balance.
- `/add <user> <amount>` – Add balance to a player.
- `/remove <user> <amount>` – Remove balance from a player.
- `/link <ign>` – Link Minecraft username to your account.
- `/unlink` – Unlink your account.
- `/playtime <user>` – View a user's total playtime.
- `/kills` and `/deaths` – View kill/death stats.
- `/online` – Display currently online players.
- `/check` – Check the status of your ticket.
- `/edit`, `/delete`, `/close` – Manage tickets.
- `/rename`, `/move` – Modify channel names or move tickets.

---

## 💡 Interactive Buttons

Found in `dist/buttons/`:

- `submit.js`: Submit a ticket or form.
- `cancel.js`: Cancel ticket creation.
- `approve.js` / `deny.js`: Accept or reject user requests.
- `report.js`: Report a player or issue.
- `restart.js`: Restart the bot or services.

---

## 🚛 Development

### TypeScript & Build

This project is written in TypeScript. Use the following command to compile:

```bash
npm run build
```

This will output compiled JavaScript to the `dist/` directory.

### Folder Structure

```
xDonutSMP/
├── dist/              # Compiled JS output
├── src/               # TypeScript source code
├── commands/          # Discord commands
├── buttons/           # UI button interactions
├── config/            # Config files
├── utils/             # Utility functions
├── tsconfig.json      # TypeScript config
├── package.json       # Project metadata
```

---

## ✍️ Contributing

1. Fork the repository.
2. Create your feature branch:
   ```bash
   git checkout -b feature/AmazingFeature
   ```
3. Commit your changes.
4. Push to the branch:
   ```bash
   git push origin feature/AmazingFeature
   ```
5. Open a Pull Request.

---

## 🌐 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

## 📚 Additional Notes

- You must host the bot yourself unless otherwise arranged.
- Ensure the bot has permissions to read/write/manage channels and send messages.
- MongoDB is required for persistent user data.

Happy managing your SMP!
