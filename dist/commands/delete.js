import database from "../handlers/databaseHandler.js";
import Scammer from "../tables/scammer.js";
import config from "../config.js";
import Message from "../tables/message.js";
export default {
    name: "delete",
    description: "Delete a scammer report",
    aliases: ["del"],
    permissions: ["Administrator"],
    usage: "delete <id>",
    function: async function ({ message, args }) {
        const id = parseInt(args[0]);
        if (!id)
            return message.channel.send(":x: **You must provide a report ID!**");
        const report = await database.manager.findOne(Scammer, { where: { id } });
        if (!report)
            return message.channel.send(":x: **That report doesn't exist!**");
        const scamToDel = await database.manager.findOne(Scammer, { where: { scammerUUID: report.scammerUUID } });
        await database.manager.delete(Scammer, { id });
        const oldMessage = await database.manager.findOne(Message, { where: { scammer: report.scammerUUID } });
        let oldMessageMsg;
        if (oldMessage) {
            const oldMessageChannel = await message.guild?.channels.fetch(oldMessage.channel).catch(() => null);
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
        const channel = await message.guild?.channels.fetch(config.channels.reports);
        const msg = await channel.messages.fetch(report.messageURL.split("/").pop()).catch(() => null);
        await msg.delete();
        if (!scammer.length) {
            const member = await message.guild?.members.fetch(report?.scammerDiscord).catch(() => null);
            if (member)
                await member.roles?.set(config.joinRoles);
        }
        return message.channel.send(":white_check_mark: **Successfully deleted the report!**");
    }
};
