import { ActionRowBuilder, ApplicationCommandOptionType } from "discord.js";
import { buildButton, buildEmbed } from "../utils/configBuilders.js";
import database from "../handlers/databaseHandler.js";
import Panel from "../tables/panel.js";
export default {
    name: "panel",
    description: "Post a panel",
    permissions: ["Administrator"],
    options: [
        { name: "scam", description: "Post the scam report embed", type: ApplicationCommandOptionType.Subcommand }
    ],
    function: async function ({ interaction }) {
        await interaction.deferReply({ ephemeral: true });
        const subcommand = interaction.options.getSubcommand();
        switch (subcommand) {
            case "scam":
                const scamEmbed = buildEmbed("report");
                const scamButton = new ActionRowBuilder().addComponents(buildButton("report"));
                await interaction.channel.send({ embeds: [scamEmbed], components: [scamButton] });
                await interaction.editReply({ content: ":white_check_mark: **Posted the panel successfully.**" });
                await database.manager.insert(Panel, {
                    channelId: interaction.channel.id,
                    guildId: interaction.guild.id,
                    embed: "report",
                    panelMessage: (await interaction.fetchReply()).id
                });
                break;
        }
    }
};
