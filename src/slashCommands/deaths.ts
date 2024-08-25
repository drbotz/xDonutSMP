import { ApplicationCommandOptionType, ChatInputCommandInteraction } from "discord.js";
import { getDeaths } from "../minecraft/index.js";
import config from "../config.js";
import { buildEmbed } from "../utils/configBuilders.js";

export default {
    name: "deaths",
    description: "Get a player's deaths",
    permissions: [],
    options: [{ name: "username", description: "The player's IGN", type: ApplicationCommandOptionType.String, required: true }],
    function: async function ({ interaction }: { interaction: ChatInputCommandInteraction }) {
        await interaction.deferReply({ ephemeral: true });

        const username = interaction.options.getString("username");
        const deaths = await getDeaths(username);

        if (!deaths) return interaction.editReply({ content: ":x: **An error occurred while fetching the deaths!**" });

        const embed = buildEmbed("deaths").setDescription(config.embeds.deaths.description.replace(/{user}/g, username).replace(/{deaths}/g, deaths.toLocaleString()));
        await interaction.editReply({ embeds: [embed] });
    }
}