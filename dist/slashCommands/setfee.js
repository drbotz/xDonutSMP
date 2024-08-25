import { ApplicationCommandOptionType } from "discord.js";
import database from "../handlers/databaseHandler.js";
import Ticket from "../tables/ticket.js";
import WeeklyFee from "../tables/weeklyfee.js";
export default {
    name: "setfee",
    description: "Set the fee for the auction house physical item",
    options: [
        {
            name: "fee",
            description: "The fee to set",
            type: ApplicationCommandOptionType.Integer,
            required: true,
            min_value: 0
        }
    ],
    permissions: ["Administrator"],
    function: async function ({ interaction }) {
        const ticket = await database.manager.findOne(Ticket, { where: { channel: interaction.channel.id } });
        if (!ticket)
            return interaction.reply({ content: ":x: **This isn't a ticket channel!**", ephemeral: true });
        const fee = interaction.options.getInteger("fee");
        const alreadyExists = await database.manager.findOne(WeeklyFee, { where: { discordId: ticket.user } });
        if (alreadyExists) {
            alreadyExists.amount = fee;
            await database.manager.save(alreadyExists);
        }
        else {
            await database.manager.insert(WeeklyFee, { discordId: ticket.user, amount: fee });
        }
        await interaction.reply({ content: `:white_check_mark: **The fee has been set to $${fee.toLocaleString()}.**`, ephemeral: true });
    }
};
