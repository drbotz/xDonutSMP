import colors from "colors";
import { log } from "../../utils/logging.js";
import { client } from "../../index.js";
import config from "../../config.js";
import { buildEmbed } from "../../utils/configBuilders.js";
export default {
    name: "interactionCreate",
    once: false,
    function: async function (interaction) {
        if (!interaction.isModalSubmit())
            return;
        const modal = client.modals.get(interaction.customId);
        if (!modal)
            return;
        log(`[Modal Submitted] ${interaction.customId} ${colors.blue("||")} Author: ${interaction.user.username} ${colors.blue("||")} ID: ${interaction.user.id} ${colors.blue("||")} Server: ${interaction.guild.name}`);
        const logsChannel = interaction.guild.channels.cache.get(config.channels.logs);
        const embed = buildEmbed("logs");
        logsChannel.send({
            // content: `**Modal Submitted**\n\n**Modal:** ${interaction.customId}\n**Author:** ${interaction.user.tag} (${interaction.user.id})\n**Server:** ${interaction.guild!.name}`
            embeds: [embed.setDescription(`**Modal Submitted**\n\n**Modal:** ${interaction.customId}\n**Author:** ${interaction.user.tag} (${interaction.user.id})\n**Server:** ${interaction.guild.name}`)]
        });
        modal.function({ client, interaction });
    },
};
