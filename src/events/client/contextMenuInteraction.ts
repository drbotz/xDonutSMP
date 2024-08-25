import colors from "colors";
import { log } from "../../utils/logging.js";
import { client } from "../../index.js";
import { ContextMenuCommandInteraction, GuildTextBasedChannel } from "discord.js";
import config from "../../config.js";
import { buildEmbed } from "../../utils/configBuilders.js";

interface ContextMenuCommand {
    function: (params: {
        interaction: ContextMenuCommandInteraction;
    }) => void;
}

export default {
    name: "interactionCreate",
    once: false,
    function: async function (interaction: ContextMenuCommandInteraction) {
        if (!interaction.isContextMenuCommand()) return;

        const command = client.contextMenus.get(interaction.commandName) as ContextMenuCommand;
        if (command) {
            command.function({ interaction });
            log(
                `[Context menu clicked] ${interaction.commandName} ${colors.blue("||")} Author: ${interaction.user.username} ${colors.blue("||")} ID: ${interaction.user.id
                } ${colors.blue("||")} Server: ${interaction.guild?.name || "DM"}`
            );
            const logsChannel = interaction.guild!.channels.cache.get(config.channels.logs)! as GuildTextBasedChannel;
            const embed = buildEmbed("logs");
            logsChannel.send({
                embeds: [embed.setDescription(`**Context Menu Clicked**\n\n**Command:** ${interaction.commandName}\n**Author:** ${interaction.user.tag} (${interaction.user.id})\n**Server:** ${interaction.guild?.name || "DM"}`)]
            });
        }
    },
} as any;
