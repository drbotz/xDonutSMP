import { ApplicationCommandOptionType } from "discord.js";
import { getShards } from "../minecraft/index.js";
import config from "../config.js";
import { buildEmbed } from "../utils/configBuilders.js";
export default {
    name: "shards",
    description: "Get a player's shards",
    permissions: [],
    options: [{ name: "username", description: "The player's IGN", type: ApplicationCommandOptionType.String, required: true }],
    function: async function ({ interaction }) {
        await interaction.deferReply({ ephemeral: true });
        const username = interaction.options.getString("username");
        const shards = await getShards(username);
        if (shards == "ENOENT")
            return interaction.editReply({ content: ":x: **Player not found!**" });
        const embed = buildEmbed("shards").setDescription(config.embeds.shards.description.replace(/{user}/g, username).replace(/{shards}/g, shards.toString()));
        await interaction.editReply({ embeds: [embed] });
    }
};
