import database from "../handlers/databaseHandler.js";
import Ticket from "../tables/ticket.js";
import { ChannelType, Message, PermissionsBitField } from "discord.js";
import config from "../config.js";

export default {
    name: "add",
    description: "Add a user to the ticket",
    aliases: [],
    permissions: [],
    usage: "add <user>",
    function: async function ({ message, args }: { message: Message, args: string[] }) {
        const user = message.mentions.users.first() || message.guild?.members.cache.get(args[0]);
        if (!user) return message.channel.send(":x: **Please mention a user to add!**");

        const ticket = await database.manager.findOne(Ticket, { where: { channel: message.channel.id } });
        if (!ticket) return message.channel.send(":x: **This is not a ticket channel!**");

        const roles = config.tickets.staffRoles;
        if (!roles.some(role => message.member.roles.cache.has(role)) && !message.member.permissions.has(PermissionsBitField.Flags.Administrator)) return message.reply({ content: "❌ **You don't have permission to do that!**" });

        if (ticket.added.includes(user.id)) return message.reply({ content: ":x: **This user is already in the ticket!**" });

        if (message.channel.type !== ChannelType.GuildText) return;
        if (!message.channel.isThread()) await message.channel.permissionOverwrites.edit(user.id, { ViewChannel: true, SendMessages: true });

        ticket.added = JSON.stringify(JSON.parse(ticket.added).push(user.id));
        await database.manager.save(ticket);

        message.reply({ content: `:white_check_mark: **<@${user.id}> has been added to the ticket!**` });
    }
}
