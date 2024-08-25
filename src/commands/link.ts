import { Message } from "discord.js";
import { client } from "../index.js";
import { bot } from "../minecraft/index.js";
import { buildEmbed } from "../utils/configBuilders.js";
import database from "../handlers/databaseHandler.js";
import config from "../config.js";
import Link from "../tables/link.js";

export default {
    name: "link",
    description: "Link your account to the bot",
    aliases: [],
    permissions: [],
    usage: "link <ign>",
    function: async function ({ message, args }: { message: Message, args: string[] }) {
        const alreadyLinked = await database.manager.findOne(Link, { where: { discordId: message.author.id } }) || await database.manager.findOne(Link, { where: { ign: args.join(" ") } });
        if (alreadyLinked) return message.channel.send(":x: **Account already linked!**");

        const ign = args.join(" ");
        const code = `${Math.floor(Math.random() * 1000000)}-${message.author.id}`;

        client.linkCodes.set(code, { ign, user: message.author.id, expires: Date.now() + 300000, discordUsername: message.author.username, guild: message.guildId });

        const embed = buildEmbed("link").setDescription(config.embeds.link.description.replace(/{botName}/g, bot.username).replace(/{code}/g, code));
        const msg = await message.channel.send({ embeds: [embed] });
        setTimeout(() => {
            msg.delete();
        }, 60000);
    }
}