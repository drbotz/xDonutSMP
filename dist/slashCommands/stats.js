import { ApplicationCommandOptionType } from "discord.js";
import { getStats } from "../minecraft/index.js";
import config from "../config.js";
import { buildEmbed } from "../utils/configBuilders.js";
export default {
    name: "stats",
    description: "Get a player's stats",
    permissions: [],
    options: [{ name: "username", description: "The player's IGN", type: ApplicationCommandOptionType.String, required: true }],
    function: async function ({ interaction }) {
        await interaction.deferReply({ ephemeral: true });
        const username = interaction.options.getString("username");
        const stats = await getStats(username).catch((e) => {
            if (e == "Player not found") {
                return "ENOENT";
            }
        });
        if (stats == "ENOENT")
            return interaction.editReply({ content: ":x: **Player not found!**" });
        const embed = buildEmbed("stats").setDescription(config.embeds.stats.description.replace(/{user}/g, username).replace(/{stats}/g, stats.map(stat => `**${stat.stat.charAt(0).toUpperCase() + stat.stat.slice(1)}**: ${stat.value}`).join("\n")));
        await interaction.editReply({ embeds: [embed] });
    }
};
