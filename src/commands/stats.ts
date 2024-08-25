import { Message } from "discord.js";
import { getStats } from "../minecraft/index.js";
import config from "../config.js";
import database from "../handlers/databaseHandler.js";
import { buildEmbed } from "../utils/configBuilders.js";
import Link from "../tables/link.js";

export default {
    name: "stats",
    aliases: ["statistics"],
    description: "Get a player's stats",
    permissions: [],
    usage: "stats [username|discord_id|discord_mention]",
    function: async function({ message, args }: { message: Message, args: string[] }) {
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
            username = linked.ign;
        }

        const stats = await getStats(username).catch((e) => {
            if (e == "Player not found") {
                return "ENOENT";
            }
        }) as {stat: string, value: string}[] | "ENOENT";

        if (stats == "ENOENT") return message.channel.send(":x: **Player not found!**");

        const embed = buildEmbed("stats").setDescription(config.embeds.stats.description.replace(/{user}/g, username).replace(/{stats}/g, stats.map(stat => `**${stat.stat.charAt(0).toUpperCase() + stat.stat.slice(1)}**: ${stat.value}`).join("\n")));
        const msg = await message.channel.send({ embeds: [embed] });
        setTimeout(() => {
            msg.delete();
        }, 60000);
    }
}