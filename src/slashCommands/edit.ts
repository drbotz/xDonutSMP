import { ApplicationCommandOptionType, ChatInputCommandInteraction, GuildTextBasedChannel } from "discord.js";
import database from "../handlers/databaseHandler.js";
import Scammer from "../tables/scammer.js";
import config from "../config.js";
import { buildEmbed } from "../utils/configBuilders.js";

export default {
    name: "edit",
    description: "Edit a posted scam report",
    options: [
        {
            name: "id",
            description: "The ID of the scam report",
            type: ApplicationCommandOptionType.Integer,
            required: true
        },
        {
            name: "description",
            description: "The description of the scam report",
            type: ApplicationCommandOptionType.String,
            required: false
        },
        {
            name: "proof",
            description: "The proof of the scam report",
            type: ApplicationCommandOptionType.String,
            required: false
        },
        {
            name: "scammer_discord",
            description: "The Discord of the scammer",
            type: ApplicationCommandOptionType.String,
            required: false
        }
    ],
    permissions: ["Administrator"],
    function: async ({ interaction }: { interaction: ChatInputCommandInteraction }) => {
        const id = interaction.options.getInteger("id");
        const description = interaction.options.getString("description");
        const proof = interaction.options.getString("proof");
        const scammerDiscord = interaction.options.getString("scammer_discord");

        if (!description && !proof && !scammerDiscord) return interaction.reply({ content: ":x: **You must provide a description, proof or the scammer's discord!**", ephemeral: true });

        const report = await database.manager.findOne(Scammer, { where: { id } });
        if (!report) return interaction.reply({ content: ":x: **That report doesn't exist!**", ephemeral: true });

        const scammer = await database.manager.findOne(Scammer, { where: { scammerUUID: report.scammerUUID, date: report.date } });
        if (!scammer) return interaction.reply({ content: ":x: **That report doesn't exist!**", ephemeral: true });

        if (description) await database.manager.update(Scammer, { id }, { description });
        if (proof) await database.manager.update(Scammer, { id }, { proof });
        if (scammerDiscord) await database.manager.update(Scammer, { id }, { scammerDiscord });

        const channel = await interaction.client.channels.fetch(config.channels.reports) as GuildTextBasedChannel;
        if (!channel) return interaction.reply({ content: ":x: **That report doesn't exist!**", ephemeral: true });

        const message = await channel.messages.fetch(report.message);
        if (!message) return interaction.reply({ content: ":x: **That report doesn't exist!**", ephemeral: true });

        const reportEmbed = buildEmbed("reportPublished")
            .setDescription(config.embeds.reportPublished.description.replace(/{id}/g, scammer.id.toString()).replace(/{scammerIGN}/g, report.scammerIGN).replace(/{scammerUUID}/g, report.scammerUUID).replace(/{reporter}/g, `${report.reporter}`).replace(/{reporterIGN}/g, report.reporter).replace(/{reporterUUID}/g, report.reporterUUID).replace(/{scammerDiscord}/g, report.scammerDiscord || "Not provided.").replace(/{scamDescription}/g, report.description).replace(/{scamProof}/g, report.proof));
        await message.edit({ embeds: [reportEmbed] });

        await interaction.reply({ content: ":white_check_mark: **Successfully edited the report!**", ephemeral: true });
    }
}