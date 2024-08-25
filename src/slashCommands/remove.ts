import database from "../handlers/databaseHandler.js";
import Ticket from "../tables/ticket.js";
import { ApplicationCommandOptionType, ChatInputCommandInteraction, PermissionsBitField } from "discord.js";
import config from "../config.js";

export default {
    name: "remove",
    description: "Remove a user from the ticket",
    permissions: [],
    options: [{ name: "user", description: "The user to remove", type: ApplicationCommandOptionType.User, required: true }],
    function: async function ({ interaction }: { interaction: ChatInputCommandInteraction }) {
        if (!interaction.inCachedGuild()) return;

        const ticket = await database.manager.findOne(Ticket, { where: { channel: interaction.channel.id } });
        if (!ticket) return interaction.reply({ content: ":x: **This is not a ticket channel!**", ephemeral: true });

        const roles = config.tickets.staffRoles;
        if (!roles.some(role => interaction.member.roles.cache.has(role)) && !interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) return interaction.reply({ content: ":x: **You do not have permission to add users to this ticket!**", ephemeral: true });

        const user = interaction.options.getUser("user");
        if (!ticket.added.includes(user.id)) return interaction.reply({ content: ":x: **This user is already not in the ticket!**", ephemeral: true });

        if (!interaction.channel.isThread()) await interaction.channel.permissionOverwrites.edit(user.id, { ViewChannel: false, SendMessages: false });

        ticket.added = JSON.stringify(JSON.parse(ticket.added).filter(id => id !== user.id));
        await database.manager.save(ticket);

        await interaction.reply({ content: `:white_check_mark: **Removed <@${user.id}> from the ticket!**` });
    }
}
