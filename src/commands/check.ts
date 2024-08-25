import { ApplicationCommandOptionType, ChatInputCommandInteraction, Message } from "discord.js";
import database from "../handlers/databaseHandler.js";
import { buildEmbed } from "../utils/configBuilders.js";
import Scammer from "../tables/scammer.js";
import config from "../config.js";
import { getUUID } from "../utils/getUUID.js";

export default {
    name: "check",
    description: "Check if a user is a scammer",
    aliases: ["scammer"],
    usage: "check <ign|mention|userid>",
    function: async function({ message, args }: { message: Message, args: string[] }) {
        const ign = args.join(" ");
        const mention = message.mentions.users.first();
        const userid = args[0];

        if (!ign && !mention && !userid) return message.channel.send(":x: **You must provide a user IGN, mention or ID!**");

        if (ign) {
            const uuid = await getUUID(ign);
            if (!uuid) return message.channel.send(":x: **That user doesn't exist!**");

            const scammer = await database.manager.find(Scammer, { where: { scammerUUID: uuid } });
            if (!scammer.length) return message.channel.send(":x: **That user isn't a scammer!**");

            const scammerEmbed = buildEmbed("scammer")
                .setDescription(config.embeds.scammer.description.replace(/{scammerIGN}/g, scammer[0].scammerIGN).replace(/{scammerUUID}/g, scammer[0].scammerUUID).replace(/{scams}/g, scammer.map(s => `[${s.id}](${s.messageURL})`).join(" - ")));

            const msg = await message.channel.send({ embeds: [scammerEmbed] });

            setTimeout(() => {
                msg.delete();
            }, 60000);
        } else if (mention) {
            const scammer = await database.manager.find(Scammer, { where: { scammerDiscord: mention.id } });
            if (!scammer.length) return message.channel.send(":x: **That user isn't a scammer!**");

            const scammerEmbed = buildEmbed("scammer")
                .setDescription(config.embeds.scammer.description.replace(/{scammerIGN}/g, scammer[0].scammerIGN).replace(/{scammerUUID}/g, scammer[0].scammerUUID).replace(/{scams}/g, scammer.map(s => `[${s.id}](${s.messageURL})`).join(" - ")));

            const msg = await message.channel.send({ embeds: [scammerEmbed] });

            setTimeout(() => {
                msg.delete();
            }, 60000);
        } else if (userid) {
            const scammer = await database.manager.find(Scammer, { where: { scammerDiscord: userid } });
            if (!scammer.length) return message.channel.send(":x: **That user isn't a scammer!**");

            const scammerEmbed = buildEmbed("scammer")
                .setDescription(config.embeds.scammer.description.replace(/{scammerIGN}/g, scammer[0].scammerIGN).replace(/{scammerUUID}/g, scammer[0].scammerUUID).replace(/{scams}/g, scammer.map(s => `[${s.id}](${s.messageURL})`).join(" - ")));

            const msg = await message.channel.send({ embeds: [scammerEmbed] });
            setTimeout(() => {
                msg.delete();
            }, 60000);
        }
    }
}