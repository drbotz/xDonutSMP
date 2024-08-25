import { ApplicationCommandOptionType, ChannelType, PermissionsBitField } from "discord.js";
import database from "../handlers/databaseHandler.js";
import Ticket from "../tables/ticket.js";
import config from "../config.js";
export default {
    name: "move",
    description: "Move a ticket to another category.",
    permissions: [],
    options: [{ name: "category", description: "The category to move the ticket to.", type: ApplicationCommandOptionType.Channel, channel_types: [ChannelType.GuildCategory], required: true }],
    function: async function ({ interaction }) {
        if (!interaction.inCachedGuild())
            return;
        const ticket = await database.manager.findOne(Ticket, { where: { channel: interaction.channel.id } });
        if (!ticket)
            return interaction.reply({ content: ":x: **This is not a ticket channel!**", ephemeral: true });
        const roles = config.tickets.staffRoles;
        if (!roles.some(role => interaction.member.roles.cache.has(role)) && !interaction.member.permissions.has(PermissionsBitField.Flags.Administrator))
            return interaction.reply({ content: "❌ **You don't have permission to do that!**", ephemeral: true });
        const category = interaction.options.getChannel("category");
        if (!interaction.channel.isThread())
            await interaction.channel.setParent(category.id);
        await interaction.reply({ content: `:white_check_mark: **Moved to \`${category.name}\`!**` });
    }
};
