import { ApplicationCommandOptionType } from "discord.js";
import database from "../handlers/databaseHandler.js";
import Link from "../tables/link.js";
import config from "../config.js";
import { getStats } from "../minecraft/index.js";
export default {
    name: "forcelink",
    description: "Force link a user",
    permissions: ["Administrator"],
    options: [{ name: "user", description: "The user to link", type: ApplicationCommandOptionType.User, required: true }, { name: "ign", description: "The user's IGN", type: ApplicationCommandOptionType.String, required: true }],
    function: async function ({ interaction }) {
        const user = interaction.options.getUser("user");
        const ign = interaction.options.getString("ign");
        const alreadyLinked = await database.manager.findOne(Link, { where: { discordId: user.id } });
        if (alreadyLinked)
            await database.manager.delete(Link, { discordId: user.id });
        const linked = await database.manager.insert(Link, { discordId: user.id, ign });
        if (linked) {
            await interaction.reply({ content: `:white_check_mark: **Successfully linked ${user.tag} to ${ign}**` });
            const member = await interaction.guild.members.fetch(user.id).catch(() => null);
            if (member) {
                await member.setNickname(`${member.user.displayName} [${ign}]`).catch(() => null);
                member.roles.add(config.linkedRole).catch(() => null);
            }
            const stats = await getStats(ign);
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
        else {
            await interaction.reply({ content: `:x: **An error occurred while linking ${user.tag} to ${ign}**` });
        }
    }
};
