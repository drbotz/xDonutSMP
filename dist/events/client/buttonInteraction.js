import colors from "colors";
import { log } from "../../utils/logging.js";
import { client } from "../../index.js";
import { PermissionsBitField } from "discord.js";
import config from "../../config.js";
import { buildEmbed } from "../../utils/configBuilders.js";
export default {
    name: "interactionCreate",
    once: false,
    function: async function (interaction) {
        if (!interaction.isButton())
            return;
        const button = client.buttons.get(interaction.customId);
        if (button) {
            if (button.permissions) {
                const invalidPerms = [];
                const memberPerms = interaction.member.permissions;
                for (const perm of button.permissions) {
                    if (!memberPerms.has(PermissionsBitField.Flags[perm]))
                        invalidPerms.push(perm);
                }
                if (invalidPerms.length) {
                    return interaction.reply({ content: `Missing Permissions: \`${invalidPerms.join(", ")}\``, ephemeral: true });
                }
            }
            if (button.roleRequired) {
                const role = await interaction.guild.roles.fetch(button.roleRequired);
                const member = interaction.member;
                const memberRoles = member.roles;
                const memberPerms = interaction.member.permissions;
                if (role && !memberRoles.cache.has(role.id) && memberRoles.highest.comparePositionTo(role) < 0 && !memberPerms.has(PermissionsBitField.Flags.Administrator)) {
                    return interaction.reply(`:x: **You don't have the required role!**`);
                }
            }
            button.function({ button: interaction });
            log(`[Button clicked] ${interaction.customId} ${colors.blue("||")} Author: ${interaction.user.username} ${colors.blue("||")} ID: ${interaction.user.id} ${colors.blue("||")} Server: ${interaction.guild?.name || "DM"}`);
            const logsChannel = interaction.guild.channels.cache.get(config.channels.logs);
            const embed = buildEmbed("logs");
            logsChannel.send({
                embeds: [embed.setDescription(`**Button Clicked**\n\n**Button:** ${interaction.customId}\n**Author:** ${interaction.user.tag} (${interaction.user.id})\n**Server:** ${interaction.guild?.name || "DM"}`)]
            });
        }
    },
};
