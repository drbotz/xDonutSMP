import { ApplicationCommandOptionType } from "discord.js";
import { executeCommand } from "../minecraft/index.js";
export default {
    name: "adminrun",
    description: "Run an admin command",
    options: [
        {
            name: "command",
            description: "The command to run",
            type: ApplicationCommandOptionType.String,
            required: true
        }
    ],
    permissions: ["Administrator"],
    function: async function ({ interaction }) {
        const command = interaction.options.getString("command");
        const answer = await executeCommand(command.startsWith("/") ? command : `/${command}`).catch(() => null);
        if (!answer)
            return interaction.reply({ content: ":white_check_mark: **Command ran without a response.**", ephemeral: true });
        else
            return interaction.reply({ content: `:white_check_mark: **Command ran with the response: \`\`\`${answer}\`\`\`**`, ephemeral: true });
    }
};
