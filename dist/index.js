// Package imports
import "reflect-metadata";
import config from "./config.js";
import { error, log } from "./utils/logging.js";
import { Client, Collection, IntentsBitField, Partials } from "discord.js";
// Define a new class that extends Client
class CustomClient extends Client {
    cooldowns = [];
    commands = new Collection();
    slashCommands = new Collection();
    selectMenus = new Collection();
    modals = new Collection();
    contextMenus = new Collection();
    buttons = new Collection();
    linkCodes = new Collection();
}
// Initialize the extended client
export const client = new CustomClient({
    intents: [IntentsBitField.Flags.Guilds, IntentsBitField.Flags.GuildMessages, IntentsBitField.Flags.MessageContent, IntentsBitField.Flags.GuildMembers],
    partials: [Partials.Message, Partials.GuildMember, Partials.Channel, Partials.Reaction, Partials.User]
});
// Command & event handlers
import eventHandler from "./handlers/eventHandler.js";
import idkHowToCallThisHandler from "./handlers/idkHowToCallThisHandler.js";
import database from "./handlers/databaseHandler.js";
import { minecraft } from "./minecraft/index.js";
if (database.isInitialized)
    log("Successfully connected to the database");
idkHowToCallThisHandler.init();
eventHandler.function();
minecraft();
// Catching all the errors
process.on("uncaughtException", config.debugMode ? console.error : error);
process.on("unhandledRejection", config.debugMode ? console.error : error);
client.login(config.token);
