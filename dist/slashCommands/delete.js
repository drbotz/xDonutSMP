import { ApplicationCommandOptionType } from "discord.js";
import database from "../handlers/databaseHandler.js";
import Scammer from "../tables/scammer.js";
import Message from "../tables/message.js";
import config from "../config.js";
export default {
    name: "delete",
    description: "Delete a scammer report",
    options: [{ name: "id", description: "The report ID to delete", type: ApplicationCommandOptionType.Integer, required: true }],
    permissions: ["Administrator"],
    function: async function ({ interaction }) {
        const id = interaction.options.getInteger("id");
        const report = await database.manager.findOne(Scammer, { where: { id } });
        if (!report)
            return await interaction.reply({ content: ":x: **That report doesn't exist!**", ephemeral: true });
        const scamToDel = await database.manager.findOne(Scammer, { where: { scammerUUID: report.scammerUUID } });
        await database.manager.delete(Scammer, { id });
        const oldMessage = await database.manager.findOne(Message, { where: { scammer: report.scammerUUID } });
        let oldMessageMsg;
        if (oldMessage) {
            const oldMessageChannel = await interaction.guild?.channels.fetch(oldMessage.channel).catch(() => null);
            oldMessageMsg = await oldMessageChannel.messages.fetch(oldMessage.messageId).catch(() => null);
        }
        const scammer = await database.manager.find(Scammer, { where: { scammerUUID: scamToDel.scammerUUID } });
        if (oldMessageMsg) {
            if (!scammer.length) {
                await oldMessageMsg.delete();
                await database.manager.delete(Message, { scammer: report.scammerUUID });
            }
            else
                await oldMessageMsg.edit({ content: `${report.scammerIGN} (${report.scammerUUID}) - ${scammer.map(s => `[${s.id}](${s.messageURL})`)}` });
        }
        const channel = await interaction.guild?.channels.fetch(config.channels.reports);
        const msg = await channel.messages.fetch(report.messageURL.split("/").pop()).catch(() => null);
        await msg.delete();
        if (!scammer.length) {
            const member = await interaction.guild?.members.fetch(report?.scammerDiscord).catch(() => null);
            if (member)
                await member.roles?.set(config.joinRoles);
        }
        return await interaction.reply({ content: ":white_check_mark: **Successfully deleted the report!**", ephemeral: true });
    }
};
