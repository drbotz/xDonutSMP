import { ApplicationCommandOptionType } from "discord.js";
import { getKills } from "../minecraft/index.js";
import config from "../config.js";
import { buildEmbed } from "../utils/configBuilders.js";
export default {
    name: "kills",
    description: "Get a player's kills",
    permissions: [],
    options: [{ name: "username", description: "The player's IGN", type: ApplicationCommandOptionType.String, required: true }],
    function: async function ({ interaction }) {
        await interaction.deferReply({ ephemeral: true });
        const username = interaction.options.getString("username");
        const kills = await getKills(username);
        if (!kills)
            return interaction.editReply({ content: ":x: **An error occurred while fetching the kills!**" });
        const embed = buildEmbed("kills").setDescription(config.embeds.kills.description.replace(/{user}/g, username).replace(/{kills}/g, kills.toLocaleString()));
        await interaction.editReply({ embeds: [embed] });
    }
};
