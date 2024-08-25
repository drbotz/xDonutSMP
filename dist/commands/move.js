import { ChannelType, PermissionsBitField } from "discord.js";
import database from "../handlers/databaseHandler.js";
import Ticket from "../tables/ticket.js";
import config from "../config.js";
export default {
    name: "move",
    description: "Move a ticket to another category.",
    aliases: [],
    permissions: [],
    usage: "move <categoryId>",
    function: async function ({ message, args }) {
        const ticket = await database.manager.findOne(Ticket, { where: { channel: message.channel.id } });
        if (!ticket)
            return message.channel.send(":x: **This is not a ticket channel!**");
        const roles = config.tickets.staffRoles;
        if (!roles.some(role => message.member.roles.cache.has(role)) && !message.member.permissions.has(PermissionsBitField.Flags.Administrator))
            return message.channel.send("❌ **You don't have permission to do that!**");
        const categoryId = args[0];
        const category = await message.guild.channels.fetch(categoryId).catch(() => null);
        if (!category)
            return message.channel.send(":x: **Category not found!**");
        if (message.channel.type == ChannelType.GuildText)
            await message.channel.setParent(category.id);
        await message.channel.send(`:white_check_mark: **Moved to \`${category.name}\`!**`);
    }
};
