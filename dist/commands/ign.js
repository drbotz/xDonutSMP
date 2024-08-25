import database from "../handlers/databaseHandler.js";
import Link from "../tables/link.js";
export default {
    name: "ign",
    description: "Check a user's IGN",
    aliases: ["igncheck"],
    permissions: [],
    usage: "ign <user>",
    function: async function ({ message, args }) {
        const userProvided = message.mentions.users.first();
        const idProvided = args[0];
        if (!userProvided && !idProvided)
            return message.channel.send(":x: **Please provide a user to check!**");
        let user;
        if (userProvided)
            user = userProvided;
        else if (idProvided)
            user = await message.guild.members.fetch(idProvided).catch(() => null);
        if (!user)
            return message.channel.send(":x: **User not found!**");
        const linked = await database.manager.findOne(Link, { where: { discordId: user.id } });
        if (linked) {
            const msg = await message.channel.send(`:white_check_mark: **${user.tag} is linked to ${linked.ign}**`);
            setTimeout(() => {
                msg.delete();
            }, 60000);
        }
        else {
            const msg = await message.channel.send(`:x: **${user.tag} is not linked to an account!**`);
            setTimeout(() => {
                msg.delete();
            }, 60000);
        }
    }
};
