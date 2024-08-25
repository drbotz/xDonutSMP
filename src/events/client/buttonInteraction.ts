import colors from "colors";
import { log } from "../../utils/logging.js";
import { client } from "../../index.js";
import { PermissionsBitField, ButtonInteraction, GuildMemberRoleManager, GuildTextBasedChannel } from "discord.js";
import config from "../../config.js";
import { buildEmbed } from "../../utils/configBuilders.js";

interface ButtonCommand {
	permissions: string[];
	roleRequired: string;
	function: (params: {
		button: ButtonInteraction;
	}) => void;
}

export default {
	name: "interactionCreate",
	once: false,
	function: async function (interaction: ButtonInteraction) {
		if (!interaction.isButton()) return;

		const button = client.buttons.get(interaction.customId) as ButtonCommand;
		if (button) {
			if (button.permissions) {
				const invalidPerms: any[] = [];
				const memberPerms: PermissionsBitField = interaction.member!.permissions as PermissionsBitField;
				for (const perm of button.permissions) {
					if (!memberPerms.has(PermissionsBitField.Flags[perm])) invalidPerms.push(perm);
				}
				if (invalidPerms.length) {
					return interaction.reply({ content: `Missing Permissions: \`${invalidPerms.join(", ")}\``, ephemeral: true });
				}
			}
			if (button.roleRequired) {
				const role = await interaction.guild!.roles.fetch(button.roleRequired);
				const member = interaction.member;
				const memberRoles: GuildMemberRoleManager = member!.roles as GuildMemberRoleManager;
				const memberPerms: PermissionsBitField = interaction.member!.permissions as PermissionsBitField;
				if (role && !memberRoles.cache.has(role.id) && memberRoles.highest.comparePositionTo(role) < 0 && !memberPerms.has(PermissionsBitField.Flags.Administrator)) {
					return interaction.reply(`:x: **You don't have the required role!**`);
				}
			}
			button.function({ button: interaction });
			log(
				`[Button clicked] ${interaction.customId} ${colors.blue("||")} Author: ${interaction.user.username} ${colors.blue("||")} ID: ${interaction.user.id
				} ${colors.blue("||")} Server: ${interaction.guild?.name || "DM"}`
			);
			const logsChannel = interaction.guild!.channels.cache.get(config.channels.logs)! as GuildTextBasedChannel;
			const embed = buildEmbed("logs");
			logsChannel.send({
				embeds: [embed.setDescription(`**Button Clicked**\n\n**Button:** ${interaction.customId}\n**Author:** ${interaction.user.tag} (${interaction.user.id})\n**Server:** ${interaction.guild?.name || "DM"}`)]
			});
		}
	},
} as any;
