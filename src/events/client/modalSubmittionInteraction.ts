import colors from "colors";
import { log } from "../../utils/logging.js";
import { client } from "../../index.js";
import { GuildTextBasedChannel, ModalSubmitInteraction } from "discord.js";
import config from "../../config.js";
import { buildEmbed } from "../../utils/configBuilders.js";

interface Modal {
    function: (params: {
        client: typeof client;
        interaction: ModalSubmitInteraction;
    }) => void;
}

export default {
    name: "interactionCreate",
    once: false,
    function: async function (interaction: ModalSubmitInteraction) {
        if (!interaction.isModalSubmit()) return;

        const modal = client.modals.get(interaction.customId) as Modal
        if (!modal) return;

        log(
            `[Modal Submitted] ${interaction.customId} ${colors.blue("||")} Author: ${interaction.user.username} ${colors.blue("||")} ID: ${interaction.user.id
            } ${colors.blue("||")} Server: ${interaction.guild!.name}`
        );
        const logsChannel = interaction.guild!.channels.cache.get(config.channels.logs)! as GuildTextBasedChannel;
        const embed = buildEmbed("logs");
        logsChannel.send({
            // content: `**Modal Submitted**\n\n**Modal:** ${interaction.customId}\n**Author:** ${interaction.user.tag} (${interaction.user.id})\n**Server:** ${interaction.guild!.name}`
            embeds: [embed.setDescription(`**Modal Submitted**\n\n**Modal:** ${interaction.customId}\n**Author:** ${interaction.user.tag} (${interaction.user.id})\n**Server:** ${interaction.guild!.name}`)]
        });

        modal.function({ client, interaction });
    },
} as any;
