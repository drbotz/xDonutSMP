import { ChatInputCommandInteraction } from "discord.js";
import { restartBot } from "../minecraft/index.js";

export default {
    name: "relog",
    description: "Relog the bot",
    options: [],
    permissions: ["Administrator"],
    function: async function ({ interaction }: { interaction: ChatInputCommandInteraction }) {
        await interaction.deferReply({ ephemeral: true });
        await interaction.editReply(":white_check_mark: **Successfully relogged the bot.**");
        restartBot();
    }
}