import { ApplicationCommandOptionType } from "discord.js";
import { getPlaytime } from "../minecraft/index.js";
import { buildEmbed } from "../utils/configBuilders.js";
import config from "../config.js";
export default {
    name: "playtime",
    description: "Get a player's playtime",
    permissions: [],
    options: [{ name: "username", description: "The player's IGN", type: ApplicationCommandOptionType.String, required: true }],
    function: async function ({ interaction }) {
        await interaction.deferReply({ ephemeral: true });
        const username = interaction.options.getString("username");
        const playtime = await getPlaytime(username);
        if (!playtime)
            return interaction.editReply({ content: ":x: **An error occurred while fetching the playtime of this player!**" });
        const embed = buildEmbed("playtime").setDescription(config.embeds.playtime.description.replace(/{user}/g, username).replace(/{playtime}/g, playtime));
        await interaction.editReply({ embeds: [embed] });
    }
};
