import colors from "colors";
import { log } from "../../utils/logging.js";
import { EmbedBuilder, InteractionType, PermissionsBitField } from "discord.js";
import { client } from "../../index.js";
import config from "../../config.js";
import { buildEmbed } from "../../utils/configBuilders.js";
export default {
    name: "interactionCreate",
    description: "client on interaction create event, using for slash commands",
    once: false,
    function: async function (interaction) {
        if (interaction.type !== InteractionType.ApplicationCommand)
            return;
        if (!interaction.isChatInputCommand())
            return;
        const cmd = interaction.commandName;
        const command = client.slashCommands.get(cmd);
        if (!command)
            return;
        if (command.permissions) {
            const invalidPerms = [];
            const memberPerms = interaction.member.permissions;
            for (const perm of command.permissions) {
                if (!memberPerms.has(PermissionsBitField.Flags[perm]))
                    invalidPerms.push(perm);
            }
            if (invalidPerms.length)
                return interaction.reply({ content: `Missing Permissions: \`${invalidPerms.join(", ")}\`` });
        }
        if (command.roleRequired) {
            const role = await interaction.guild.roles.fetch(command.roleRequired);
            const member = interaction.member;
            const memberPerms = interaction.member.permissions;
            const memberRoles = member.roles;
            if (role && !memberRoles.cache.has(role.id) && memberRoles.highest.comparePositionTo(role) < 0 && !memberPerms.has(PermissionsBitField.Flags.Administrator))
                return interaction.reply(`:x: **You don't have the required role!**`);
        }
        const existingCooldown = client.cooldowns.find((a) => a.command === command.name && a.user === interaction.user.id);
        if (existingCooldown) {
            const now = Math.floor(Date.now() / 1000);
            if (now < existingCooldown.until) {
                const cooldownEmbed = new EmbedBuilder()
                    .setColor("#FF0000")
                    .setTitle("Cooldown")
                    .setDescription(`:x: **You can use this command again <t:${existingCooldown.until}:R>**`)
                    .setTimestamp()
                    .setFooter({ text: interaction.user.username, iconURL: interaction.user.avatarURL() || undefined });
                return interaction.reply({ embeds: [cooldownEmbed] });
            }
        }
        const options = interaction.options.data;
        command.function({ client, interaction, options });
        log(`[Command ran] ${interaction.commandName} ${colors.blue("||")} Author: ${interaction.user.username} ${colors.blue("||")} ID: ${interaction.user.id} ${colors.blue("||")} Server: ${interaction.guild.name}`);
        const logsChannel = interaction.guild.channels.cache.get(config.channels.logs);
        const embed = buildEmbed("logs");
        logsChannel.send({
            // content: `**Command Ran**\n\n**Command:** ${interaction.commandName}\n**Author:** ${interaction.user.tag} (${interaction.user.id})\n**Server:** ${interaction.guild!.name}`,
            embeds: [embed.setDescription(`**Command Ran**\n\n**Command:** ${interaction.commandName}\n**Author:** ${interaction.user.tag} (${interaction.user.id})\n**Server:** ${interaction.guild.name}`)]
        });
        const memberPerms = interaction.member.permissions;
        if (command.cooldown && !memberPerms.has(PermissionsBitField.Flags.Administrator)) {
            const until = Math.round((Date.now() + command.cooldown) / 1000);
            client.cooldowns.push({ user: interaction.user.id, command: command.name, until });
            setTimeout(() => {
                const index = client.cooldowns.findIndex((cooldown) => cooldown.user === interaction.user.id && cooldown.command === command.name);
                if (index !== -1) {
                    client.cooldowns.splice(index, 1);
                }
            }, command.cooldown);
        }
    },
};
