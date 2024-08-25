import { ChannelType, Message, PermissionsBitField } from "discord.js";
import database from "../handlers/databaseHandler.js";
import Ticket from "../tables/ticket.js";
import config from "../config.js";

export default {
    name: "rename",
    description: "Change the name of a ticket.",
    aliases: [],
    permissions: [],
    usage: "rename <name>",
    function: async function({ message, args }: { message: Message, args: string[] }) {
        const ticket = await database.manager.findOne(Ticket, { where: { channel: message.channel.id } });
        if (!ticket) return message.channel.send(":x: **This is not a ticket channel!**");

        const roles = config.tickets.staffRoles;
        if (!roles.some(role => message.member.roles.cache.has(role)) && !message.member.permissions.has(PermissionsBitField.Flags.Administrator)) return message.channel.send("❌ **You don't have permission to do that!**");

        const name = args.join(" ");

        if (!name) return message.channel.send(":x: **You must provide a name!**");
        if (message.channel.type !== ChannelType.GuildText) return message.channel.send(":x: **This is not a ticket channel!**");

        await message.channel.setName(name);
        await message.channel.send(`:white_check_mark: **Name changed to \`${name}\`!**`);
    }
}
