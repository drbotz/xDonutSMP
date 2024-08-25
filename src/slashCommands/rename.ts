import { ApplicationCommandOptionType, ChatInputCommandInteraction, PermissionsBitField } from "discord.js";
import database from "../handlers/databaseHandler.js";
import Ticket from "../tables/ticket.js";
import config from "../config.js";

export default {
    name: "rename",
    description: "Change the name of a ticket.",
    permissions: [],
    options: [{ name: "name", description: "The new name of the ticket.", type: ApplicationCommandOptionType.String, required: true }],
    function: async function ({ interaction }: { interaction: ChatInputCommandInteraction }) {
        if (!interaction.inCachedGuild()) return;
        // const ticket = await ticketModel.findOne({ channel: interaction.channel.id });
        const ticket = await database.manager.findOne(Ticket, { where: { channel: interaction.channel.id } });
        if (!ticket) return interaction.reply({ content: ":x: **This is not a ticket channel!**", ephemeral: true });

        const roles = config.tickets.staffRoles;
        if (!roles.some(role => interaction.member.roles.cache.has(role)) && !interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) return interaction.reply({ content: "❌ **You don't have permission to do that!**", ephemeral: true });

        const name = interaction.options.getString("name");

        await interaction.channel.setName(name);

        await interaction.reply({ content: `:white_check_mark: **Name changed to \`${name}\`!**` });
    }
}
