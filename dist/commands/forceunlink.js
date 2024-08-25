import database from "../handlers/databaseHandler.js";
import Link from "../tables/link.js";
export default {
    name: "forceunlink",
    description: "Force unlink a user",
    aliases: ["ful"],
    permissions: ["Administrator"],
    usage: "forceunlink <user>",
    function: async function ({ message, args }) {
        const userProvided = message.mentions.users.first();
        const idProvided = args[0];
        if (!userProvided && !idProvided)
            return message.channel.send(":x: **Please provide a user to unlink!**");
        let user;
        if (userProvided)
            user = userProvided;
        else if (idProvided)
            user = await message.guild.members.fetch(idProvided).catch(() => null);
        if (!user)
            return message.channel.send(":x: **User not found!**");
        const alreadyLinked = await database.manager.findOne(Link, { where: { discordId: user.id } });
        if (alreadyLinked) {
            await database.manager.delete(Link, { discordId: user.id });
            await message.channel.send(`:white_check_mark: **Successfully unlinked ${user.tag}**`);
        }
        else
            await message.channel.send(`:x: **${user.tag} is not linked to any account**`);
    }
};
