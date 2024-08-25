import { ApplicationCommandOptionType } from "discord.js";
import database from "../handlers/databaseHandler.js";
import { buildEmbed } from "../utils/configBuilders.js";
import Scammer from "../tables/scammer.js";
import config from "../config.js";
import { getUUID } from "../utils/getUUID.js";
export default {
    name: "check",
    description: "Check if a user is a scammer",
    options: [
        {
            name: "ign",
            description: "The user IGN to check",
            type: ApplicationCommandOptionType.String,
            required: false
        },
        {
            name: "mention",
            description: "The user mention to check",
            type: ApplicationCommandOptionType.User,
            required: false
        },
        {
            name: "userid",
            description: "The user ID to check",
            type: ApplicationCommandOptionType.String,
            required: false
        }
    ],
    permissions: [],
    function: async function ({ interaction }) {
        const ign = interaction.options.getString("ign");
        const mention = interaction.options.getUser("mention");
        const userid = interaction.options.getString("userid");
        if (!ign && !mention && !userid)
            return interaction.reply({ content: ":x: **You must provide a user IGN, mention or ID!**", ephemeral: true });
        if (ign) {
            const uuid = await getUUID(ign);
            if (!uuid)
                return interaction.reply({ content: ":x: **That user doesn't exist!**", ephemeral: true });
            const scammer = await database.manager.find(Scammer, { where: { scammerUUID: uuid } });
            if (!scammer.length)
                return interaction.reply({ content: ":x: **That user isn't a scammer!**", ephemeral: true });
            const scammerEmbed = buildEmbed("scammer")
                .setDescription(config.embeds.scammer.description.replace(/{scammerIGN}/g, scammer[0].scammerIGN).replace(/{scammerUUID}/g, scammer[0].scammerUUID).replace(/{scams}/g, scammer.map(s => `[${s.id}](${s.messageURL})`).join(" - ")));
            await interaction.reply({ embeds: [scammerEmbed], ephemeral: true });
        }
        else if (mention) {
            const scammer = await database.manager.find(Scammer, { where: { scammerDiscord: mention.id } });
            if (!scammer.length)
                return interaction.reply({ content: ":x: **That user isn't a scammer!**", ephemeral: true });
            const scammerEmbed = buildEmbed("scammer")
                .setDescription(config.embeds.scammer.description.replace(/{scammerIGN}/g, scammer[0].scammerIGN).replace(/{scammerUUID}/g, scammer[0].scammerUUID).replace(/{scams}/g, scammer.map(s => `[${s.id}](${s.messageURL})`).join(" - ")));
            await interaction.reply({ embeds: [scammerEmbed], ephemeral: true });
        }
        else if (userid) {
            const scammer = await database.manager.find(Scammer, { where: { scammerDiscord: userid } });
            if (!scammer.length)
                return interaction.reply({ content: ":x: **That user isn't a scammer!**", ephemeral: true });
            const scammerEmbed = buildEmbed("scammer")
                .setDescription(config.embeds.scammer.description.replace(/{scammerIGN}/g, scammer[0].scammerIGN).replace(/{scammerUUID}/g, scammer[0].scammerUUID).replace(/{scams}/g, scammer.map(s => `[${s.id}](${s.messageURL})`).join(" - ")));
            await interaction.reply({ embeds: [scammerEmbed], ephemeral: true });
        }
    }
};
