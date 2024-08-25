import { Message } from "discord.js";
import { getBal } from "../minecraft/index.js";
import { buildEmbed } from "../utils/configBuilders.js";
import config from "../config.js";
import database from "../handlers/databaseHandler.js";
import Link from "../tables/link.js";

export default {
    name: "bal",
    description: "Get a player's balance",
    aliases: ["balance"],
    permissions: [],
    usage: "bal [username|discord_id|discord_mention]",
    function: async function ({ message, args }: { message: Message, args: string[] }) {
        let username;

        const isDiscordId = args[0].length === 18;
        const mention = message.mentions.users.first();
        const ign = args.join(" ");

        if (isDiscordId) {
            const linked = await database.manager.findOne(Link, { where: { discordId: args[0] } });
            if (!linked) return message.channel.send(":x: **That user is not linked to an account!**");
        } else if (mention) {
            const linked = await database.manager.findOne(Link, { where: { discordId: mention.id } });
            if (!linked) return message.channel.send(":x: **That user is not linked to an account!**");
            username = linked.ign;
        } else if (ign) {
            username = ign;
        } else {
            const linked = await database.manager.findOne(Link, { where: { discordId: message.author.id } });
            if (!linked) return message.channel.send(":x: **You are not linked to an account!**");
        }

        const balance = await getBal(username).catch((e) => {
            if (e == "Player not found") {
                return "ENOENT";
            }
        });

        if (balance == "ENOENT") return message.channel.send(":x: **Player not found!**");

        const embed = buildEmbed("balance").setDescription(config.embeds.balance.description.replace(/{user}/g, username).replace(/{balance}/g, `$${balance}`));
        const msg = await message.channel.send({ embeds: [embed] });

        setTimeout(() => {
            msg.delete();
        }, 60000);
    }
}