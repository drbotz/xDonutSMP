import { AttachmentBuilder, ChatInputCommandInteraction } from "discord.js";
import database from "../handlers/databaseHandler.js";
import Bank from "../tables/bank.js";
import Link from "../tables/link.js";

export default {
    name: "adminbank",
    description: "View the balances of all banks from highest to lowest",
    options: [],
    permissions: ["Administrator"],
    function: async function({ interaction }: { interaction: ChatInputCommandInteraction }) {
        await interaction.deferReply({ ephemeral: true });

        const getIgn = async (discordId: string) => {
            const link = await database.manager.findOne(Link, { where: { discordId } });
            return link ? link.ign : null;
        }

        const banks = await database.manager.find(Bank, { order: { balance: "DESC" } });
        const banksString = [];
        for (let i = 0; i < banks.length; i++) {
            const bank = banks[i];
            const ign = await getIgn(bank.discordId);
            banksString.push(`${i + 1}. ${ign} (${bank.discordId}) - $${bank.balance.toLocaleString()}`);
        }

        const attachment = new AttachmentBuilder(Buffer.from(banksString.join("\n")), {
            name: "banks.txt"
        });

        await interaction.editReply({ content: ":white_check_mark: **Successfully fetched bank balances!**", files: [attachment] });
    }
}