import { Message } from "discord.js";
import { getKills } from "../minecraft/index.js";
import database from "../handlers/databaseHandler.js";
import config from "../config.js";
import { buildEmbed } from "../utils/configBuilders.js";
import Link from "../tables/link.js";

export default {
    name: "kills",
    description: "Get a player's kills",
    aliases: [],
    permissions: [],
    usage: "kills [username|discord_id|discord_mention]",
    function: async function ({ message, args }: { message: Message, args: string[] }) {
        if (!args.length) return message.channel.send(":x: **Please provide a username!**");

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

        const kills = await getKills(username);
        if (!kills) return message.channel.send(":x: **An error occurred while fetching the kills!**");

        const embed = buildEmbed("kills").setDescription(config.embeds.kills.description.replace(/{user}/g, username).replace(/{kills}/g, kills.toLocaleString()));
        const msg = await message.channel.send({ embeds: [embed] });
        setTimeout(() => {
            msg.delete();
        }, 60000);
    }
}