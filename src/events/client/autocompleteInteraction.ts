import { AutocompleteInteraction } from "discord.js";
import { client } from "../../index.js";

export default {
    name: "interactionCreate",
    once: false,
    function: async function(interaction: AutocompleteInteraction) {
        if (!interaction.isAutocomplete()) return;

        const cmd = interaction.commandName;
        const command = client.slashCommands.get(cmd);
        if (!command) return;

        if (command.autocomplete) command.autocomplete({ interaction });
    }
}