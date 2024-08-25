import database from "../handlers/databaseHandler.js";
import Scammer from "../tables/scammer.js";
import config from "../config.js";
import Link from "../tables/link.js";
import { getStats } from "../minecraft/index.js";
export default {
    name: "sync",
    description: "Sync up all the scammer roles",
    options: [],
    permissions: ["Administrator"],
    function: async function ({ interaction }) {
        await interaction.deferReply({ ephemeral: true });
        const members = await interaction.guild.members.fetch();
        for (const member of members.values()) {
            const link = await database.manager.findOne(Link, { where: { discordId: member.id } });
            if (link) {
                await member.roles?.add(config.linkedRole).catch(() => null);
                await member.setNickname(`${member.user.displayName} [${link.ign}]`).catch(() => null);
            }
            const scammer = await database.manager.findOne(Scammer, { where: { scammerDiscord: member.id } });
            if (scammer) {
                const scammerRole = await interaction.guild.roles.fetch(config.scammerRole).catch(() => null);
                if (scammerRole)
                    await member.roles?.add(scammerRole).catch(() => null);
            }
            const stats = await getStats(link.ign);
            const moneyMade = stats.find(stat => stat.stat == "money made")?.value || "0";
            let parsedAmount = parseInt(moneyMade.replace(/[^0-9]/g, ""));
            if (moneyMade.endsWith("K"))
                parsedAmount *= 1000;
            if (moneyMade.endsWith("M"))
                parsedAmount *= 1000000;
            if (moneyMade.endsWith("B"))
                parsedAmount *= 1000000000;
            const wealthRole = config.linkedRoles.filter(role => parsedAmount >= role.amount).sort((a, b) => b.amount - a.amount)[0];
            if (wealthRole) {
                const role = interaction.guild?.roles.cache.get(wealthRole.role);
                await member?.roles.add(role);
            }
        }
        await interaction.editReply(":white_check_mark: **Successfully synced up all the scammer roles, linked roles, and nicknames.**");
    }
};
