import { ApplicationCommandOptionType } from "discord.js";
import { getBal } from "../minecraft/index.js";
import { buildEmbed } from "../utils/configBuilders.js";
import config from "../config.js";
export default {
    name: "bal",
    description: "Get a player's balance",
    permissions: [],
    options: [{ name: "username", description: "The player's IGN", type: ApplicationCommandOptionType.String, required: true }],
    function: async function ({ interaction }) {
        await interaction.deferReply({ ephemeral: true });
        const username = interaction.options.getString("username");
        const balance = await getBal(username).catch((e) => {
            if (e == "Player not found") {
                return "ENOENT";
            }
        });
        if (balance == "ENOENT")
            return interaction.editReply({ content: ":x: **Player not found!**" });
        const embed = buildEmbed("balance").setDescription(config.embeds.balance.description.replace(/{user}/g, username).replace(/{balance}/g, `$${balance}`));
        await interaction.editReply({ embeds: [embed] });
    }
};
