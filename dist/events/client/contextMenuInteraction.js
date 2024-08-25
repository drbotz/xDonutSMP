import colors from "colors";
import { log } from "../../utils/logging.js";
import { client } from "../../index.js";
import config from "../../config.js";
import { buildEmbed } from "../../utils/configBuilders.js";
export default {
    name: "interactionCreate",
    once: false,
    function: async function (interaction) {
        if (!interaction.isContextMenuCommand())
            return;
        const command = client.contextMenus.get(interaction.commandName);
        if (command) {
            command.function({ interaction });
            log(`[Context menu clicked] ${interaction.commandName} ${colors.blue("||")} Author: ${interaction.user.username} ${colors.blue("||")} ID: ${interaction.user.id} ${colors.blue("||")} Server: ${interaction.guild?.name || "DM"}`);
            const logsChannel = interaction.guild.channels.cache.get(config.channels.logs);
            const embed = buildEmbed("logs");
            logsChannel.send({
                embeds: [embed.setDescription(`**Context Menu Clicked**\n\n**Command:** ${interaction.commandName}\n**Author:** ${interaction.user.tag} (${interaction.user.id})\n**Server:** ${interaction.guild?.name || "DM"}`)]
            });
        }
    },
};
