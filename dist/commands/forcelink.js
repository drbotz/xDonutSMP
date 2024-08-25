import database from "../handlers/databaseHandler.js";
import Link from "../tables/link.js";
export default {
    name: "forcelink",
    description: "Force link a user",
    aliases: ["fl"],
    permissions: ["Administrator"],
    usage: "forcelink <user> <ign>",
    function: async function ({ message, args }) {
        const userProvided = message.mentions.users.first();
        const idProvided = args[0];
        const ign = args.slice(1).join(" ");
        if (!userProvided && !idProvided)
            return message.channel.send(":x: **Please provide a user to link!**");
        if (!ign)
            return message.channel.send(":x: **Please provide an IGN to link!**");
        let user;
        if (userProvided)
            user = userProvided;
        else if (idProvided)
            user = await message.guild.members.fetch(idProvided).catch(() => null);
        if (!user)
            return message.channel.send(":x: **User not found!**");
        const alreadyLinked = await database.manager.findOne(Link, { where: { discordId: user.id } });
        if (alreadyLinked)
            await database.manager.delete(Link, { discordId: user.id });
        const linked = await database.manager.insert(Link, { discordId: user.id, ign });
        if (linked) {
            await message.channel.send(`:white_check_mark: **Successfully linked ${user.tag} to ${ign}**`);
            const member = await message.guild.members.fetch(user.id).catch(() => null);
            if (member)
                await member.setNickname(`${member.user.displayName} [${ign}]`).catch(() => null);
        }
        else {
            await message.channel.send(`:x: **An error occurred while linking ${user.tag} to ${ign}**`);
        }
    }
};
