import { Message } from "discord.js";
import { isOnline } from "../minecraft/index.js";
import { buildEmbed } from "../utils/configBuilders.js";
import database from "../handlers/databaseHandler.js";
import config from "../config.js";
import Link from "../tables/link.js";

export default {
    name: "online",
    description: "Get a player's online status",
    aliases: [],
    permissions: [],
    usage: "online [username|discord_id|discord_mention]",
    function: async function ({ message, args }: { message: Message, args: string[] }) {
        let username;

        const isDiscordId = args[0].length === 18;
        const mention = message.mentions.users.first();
        const ign = args.join(" ");

        if (isDiscordId) {
            const linked = await database.manager.findOne(Link, { where: { discordId: args[0] } });
            if (!linked) {
                const msg = await message.channel.send(":x: **That user is not linked to an account!**");
                
                setTimeout(() => {
                    msg.delete();
                }, 60000);
                
                return;
            }
        } else if (mention) {
            const linked = await database.manager.findOne(Link, { where: { discordId: mention.id } });
            if (!linked) {
                const msg = await message.channel.send(":x: **That user is not linked to an account!**");
                
                setTimeout(() => {
                    msg.delete();
                }, 60000);
                
                return;
            }
            username = linked.ign;
        } else if (ign) {
            username = ign;
        } else {
            const linked = await database.manager.findOne(Link, { where: { discordId: message.author.id } });
            if (!linked) {
                const msg = await message.channel.send(":x: **You are not linked to an account!**");
                
                setTimeout(() => {
                    msg.delete();
                }, 60000);
                
                return;
            }
        }

        const status = await isOnline(username).catch((e) => {
            if (e == "Player not found") {
                return "ENOENT";
            }
            return null;
        }) as {status: Boolean, location: string};

        if (status == null || status == undefined) return message.channel.send(":x: **An error occurred while fetching the online status!**");

        const embed = buildEmbed("online").setDescription(config.embeds.online.description.replace(/{user}/g, username).replace(/{status}/g, status.status ? `online - ${status.location}` : "offline").replace(/{emoji}/g, status.status ? "🟢" : "🔴"));
        const msg = await message.channel.send({ embeds: [embed] });
        setTimeout(() => {
            msg.delete();
        }, 60000);
    }
}