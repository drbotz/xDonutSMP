import { ApplicationCommandOptionType, ChatInputCommandInteraction } from "discord.js";
import { isOnline } from "../minecraft/index.js";
import { buildEmbed } from "../utils/configBuilders.js";
import config from "../config.js";

export default {
    name: "online",
    description: "Get a player's online status",
    permissions: [],
    options: [{ name: "username", description: "The player's IGN", type: ApplicationCommandOptionType.String, required: true }],
    function: async function ({ interaction }: { interaction: ChatInputCommandInteraction }) {
        await interaction.deferReply({ ephemeral: true });

        const username = interaction.options.getString("username");
        const status = await isOnline(username).catch((e) => {
            if (e == "Player not found") {
                return "ENOENT";
            }
            return null;
        }) as {status: Boolean, location: string};

        if (status == null || status == undefined) return interaction.editReply({ content: ":x: **An error occurred while fetching the online status!**" });

        const embed = buildEmbed("online").setDescription(config.embeds.online.description.replace(/{user}/g, username).replace(/{status}/g, status.status ? `online - ${status.location}` : "offline").replace(/{emoji}/g, status.status ? "🟢" : "🔴"));
        await interaction.editReply({ embeds: [embed] });
    }
}