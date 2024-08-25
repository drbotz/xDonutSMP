import database from "../handlers/databaseHandler.js";
import Ticket from "../tables/ticket.js";
import { ApplicationCommandOptionType, PermissionsBitField } from "discord.js";
import config from "../config.js";
export default {
    name: "add",
    description: "Add a user to the ticket",
    permissions: [],
    options: [{ name: "user", description: "The user to add", type: ApplicationCommandOptionType.User, required: true }],
    function: async function ({ interaction }) {
        if (!interaction.inCachedGuild())
            return;
        // const ticket = await ticketModel.findOne({ channel: interaction.channel.id });
        const ticket = await database.manager.findOne(Ticket, { where: { channel: interaction.channel.id } });
        if (!ticket)
            return interaction.reply({ content: ":x: **This is not a ticket channel!**", ephemeral: true });
        const roles = config.tickets.staffRoles;
        if (!roles.some(role => interaction.member.roles.cache.has(role)) && !interaction.member.permissions.has(PermissionsBitField.Flags.Administrator))
            return interaction.reply({ content: "❌ **You don't have permission to do that!**", ephemeral: true });
        const user = interaction.options.getUser("user");
        if (ticket.added.includes(user.id))
            return interaction.reply({ content: ":x: **This user is already in the ticket!**", ephemeral: true });
        if (!interaction.channel.isThread())
            await interaction.channel.permissionOverwrites.edit(user.id, { ViewChannel: true, SendMessages: true });
        ticket.added = JSON.stringify(JSON.parse(ticket.added).push(user.id));
        await database.manager.save(ticket);
        interaction.reply({ content: `:white_check_mark: **<@${user.id}> has been added to the ticket!**` });
    }
};
