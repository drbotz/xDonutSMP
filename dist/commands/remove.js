import database from "../handlers/databaseHandler.js";
import Ticket from "../tables/ticket.js";
import { ChannelType, PermissionsBitField } from "discord.js";
import config from "../config.js";
export default {
    name: "remove",
    description: "Remove a user from the ticket",
    aliases: [],
    permissions: [],
    usage: "remove <user>",
    function: async function ({ message, args }) {
        const ticket = await database.manager.findOne(Ticket, { where: { channel: message.channel.id } });
        if (!ticket)
            return message.channel.send(":x: **This is not a ticket channel!**");
        const roles = config.tickets.staffRoles;
        if (!roles.some(role => message.member.roles.cache.has(role)) && !message.member.permissions.has(PermissionsBitField.Flags.Administrator))
            return message.channel.send(":x: **You do not have permission to remove users from this ticket!**");
        const user = message.mentions.users.first() || message.guild.members.cache.get(args[0]);
        if (!user)
            return message.channel.send(":x: **Please provide a user to remove!**");
        if (!ticket.added.includes(user.id))
            return message.channel.send(":x: **This user is already not in the ticket!**");
        if (message.channel.type == ChannelType.GuildText)
            await message.channel.permissionOverwrites.edit(user.id, { ViewChannel: false, SendMessages: false });
        ticket.added = JSON.stringify(JSON.parse(ticket.added).filter(id => id !== user.id));
        await database.manager.save(ticket);
        await message.channel.send(`:white_check_mark: **Removed <@${user.id}> from the ticket!**`);
    }
};
