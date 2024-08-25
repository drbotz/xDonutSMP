import database from "../../handlers/databaseHandler.js";
import config from "../../config.js";
import Scammer from "../../tables/scammer.js";
import Link from "../../tables/link.js";
export default {
    name: "guildMemberAdd",
    once: false,
    function: async function (member) {
        const scammer = await database.manager.find(Scammer, { where: { scammerDiscord: member.id } });
        if (scammer.length)
            await member.roles.set([config.scammerRole]);
        else if (config.joinRoles.length)
            await member.roles.add(config.joinRoles);
        const linked = await database.manager.findOne(Link, { where: { discordId: member.id } });
        if (linked) {
            await member.setNickname(`${member.user.displayName} [${linked.ign}]`).catch(() => null);
            await member.roles.add(config.linkedRole);
        }
    }
};
