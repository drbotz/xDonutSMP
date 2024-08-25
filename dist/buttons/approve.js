import { AttachmentBuilder, PermissionsBitField } from "discord.js";
import database from "../handlers/databaseHandler.js";
import Report from "../tables/report.js";
import config from "../config.js";
import Scammer from "../tables/scammer.js";
import { buildEmbed } from "../utils/configBuilders.js";
import Message from "../tables/message.js";
import * as discordTranscripts from "discord-html-transcripts";
import Ticket from "../tables/ticket.js";
export default {
    id: "approve",
    function: async function ({ button }) {
        if (!button.inCachedGuild())
            return await button.reply({ content: ":x: **You must be in the server to use this button!**", ephemeral: true });
        if (!button.member.permissions.has(PermissionsBitField.Flags.Administrator))
            return await button.reply({ content: ":x: **You must be an administrator to use this button!**", ephemeral: true });
        const report = await database.manager.findOne(Report, { where: { channel: button.channelId } });
        if (!report)
            return;
        await button.message.edit({ components: [] });
        await database.manager.insert(Scammer, {
            date: report.date,
            message: "",
            messageURL: "",
            description: report.description,
            proof: report.proof,
            reporter: report.reporter,
            reporterUUID: report.reporterUUID,
            scammerIGN: report.scammer,
            scammerUUID: report.scammerUUID,
            scammerDiscord: report.scammerDiscord
        });
        const scammer = await database.manager.findOne(Scammer, { where: { scammerUUID: report.scammerUUID, date: report.date } });
        const reportsChannel = await button.guild?.channels.fetch(config.channels.reports);
        const reportEmbed = buildEmbed("reportPublished")
            .setDescription(config.embeds.reportPublished.description.replace(/{id}/g, scammer.id.toString()).replace(/{scammerIGN}/g, report.scammer).replace(/{scammerUUID}/g, report.scammerUUID).replace(/{reporter}/g, `${report.reporter}`).replace(/{reporterIGN}/g, report.reporter).replace(/{reporterUUID}/g, report.reporterUUID).replace(/{scammerDiscord}/g, report.scammerDiscord || "Not provided.").replace(/{scamDescription}/g, report.description).replace(/{scamProof}/g, report.proof));
        const msg = await reportsChannel.send({ embeds: [reportEmbed] });
        await msg.react("✅");
        await database.manager.update(Scammer, { id: scammer.id }, { message: msg.id, messageURL: msg.url });
        const scamData = await database.manager.findOne(Scammer, { where: { message: msg.id } });
        const quickSearchChannel = await button.guild?.channels.fetch(config.channels.quickSearch);
        const oldMessage = await database.manager.findOne(Message, { where: { scammer: report.scammerUUID } });
        let oldMessageMsg;
        if (oldMessage) {
            const oldMessageChannel = await button.guild?.channels.fetch(oldMessage.channel).catch(() => null);
            oldMessageMsg = await oldMessageChannel.messages.fetch(oldMessage.messageId).catch(() => null);
        }
        if (oldMessageMsg) {
            await oldMessageMsg.edit({ content: `${oldMessageMsg.content} [${scamData.id}](${msg.url})` });
        }
        else {
            const quickSearchMsg = await quickSearchChannel.send({ content: `${report.scammer} (${report.scammerUUID}) - [${scamData.id}](${msg.url})` });
            await quickSearchMsg.react("✅");
            await database.manager.insert(Message, {
                channel: quickSearchChannel.id,
                messageId: quickSearchMsg.id,
                scammer: report.scammerUUID
            });
        }
        await database.manager.delete(Report, { channel: button.channelId });
        const channel = button.guild.channels.cache.get(config.tickets.transcriptsChannel);
        const transcript = await discordTranscripts.createTranscript(button.channel, {
            returnType: discordTranscripts.ExportReturnType.Buffer,
            poweredBy: false,
            limit: -1
        });
        const attachment = new AttachmentBuilder(transcript, { name: `${button.channel.name}.html` });
        const closedEmbed = buildEmbed("closed").addFields([
            { name: "Ticket Name", value: button.channel.name, inline: true },
            { name: "Ticket Creator", value: `<@${report.reporter}>`, inline: true },
            { name: "Closed by", value: `<@${button.user.id}>`, inline: true },
            { name: "Reason", value: "Approved the scam report.", inline: true }
        ]);
        await channel.send({ content: `:white_check_mark: **Ticket Closed**\n**Here is the transcript for \`#${button.channel.name}\`**\n**Reason:** Approved the scam report.`, embeds: [closedEmbed], files: [attachment] });
        const ticket = await database.manager.findOne(Ticket, { where: { channel: button.channelId } });
        if (!ticket)
            return await button.channel.delete();
        if (config.tickets.dmTranscripts) {
            const usersIds = [...JSON.parse(ticket.added), ticket.user];
            for (const userId of usersIds) {
                const user = await button.client.users.fetch(userId);
                await user.send({ content: `:white_check_mark: **Ticket Closed**\n**Here is the transcript for \`#${button.channel.name}\`**`, embeds: [closedEmbed], files: [attachment] }).catch(() => null);
            }
        }
        const member = await button.guild.members.fetch(report.scammer).catch(() => null);
        if (member)
            await member.roles.set([config.scammerRole]);
        setTimeout(async () => {
            await database.manager.delete(Ticket, { channel: button.channel.id });
            await button.channel.delete();
        }, 5000);
    }
};
