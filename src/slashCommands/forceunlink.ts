import { ApplicationCommandOptionType, ChatInputCommandInteraction } from "discord.js";
import database from "../handlers/databaseHandler.js";
import Link from "../tables/link.js";

export default {
    name: "forceunlink",
    description: "Force unlink a user",
    permissions: ["Administrator"],
    options: [{ name: "user", description: "The user to link", type: ApplicationCommandOptionType.User, required: true }],
    function: async function ({ interaction }: { interaction: ChatInputCommandInteraction }) {
        const user = interaction.options.getUser("user");

        const alreadyLinked = await database.manager.findOne(Link, { where: { discordId: user.id } });
        if (alreadyLinked) {
            await database.manager.delete(Link, { discordId: user.id });
            await interaction.reply({ content: `:white_check_mark: **Successfully unlinked ${user.tag}**` });
        }
        else await interaction.reply({ content: `:x: **${user.tag} is not linked to any account**` });
    }
}