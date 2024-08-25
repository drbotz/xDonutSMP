import { ApplicationCommandOptionType } from "discord.js";
import database from "../handlers/databaseHandler.js";
import Link from "../tables/link.js";
export default {
    name: "ign",
    description: "Check a user's IGN",
    options: [{ name: "user", description: "The user to check", type: ApplicationCommandOptionType.User, required: false }, { name: "id", description: "The user's ID", type: ApplicationCommandOptionType.String, required: false }],
    function: async function ({ interaction }) {
        const userProvided = interaction.options.getUser("user");
        const idProvided = interaction.options.getString("id");
        if (!userProvided && !idProvided)
            return await interaction.reply({ content: ":x: **Please provide a user to check!**", ephemeral: true });
        let user;
        if (userProvided)
            user = userProvided;
        else if (idProvided)
            user = await interaction.guild.members.fetch(idProvided).catch(() => null);
        if (!user)
            return await interaction.reply({ content: ":x: **User not found!**", ephemeral: true });
        const linked = await database.manager.findOne(Link, { where: { discordId: user.id } });
        if (linked)
            return await interaction.reply({ content: `:white_check_mark: **${user.tag} is linked to ${linked.ign}**`, ephemeral: true });
        else
            return await interaction.reply({ content: `:x: **${user.tag} is not linked to an account!**`, ephemeral: true });
    }
};
