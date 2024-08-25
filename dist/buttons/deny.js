import { AttachmentBuilder, PermissionsBitField } from "discord.js";
import config from "../config.js";
import * as discordTranscripts from "discord-html-transcripts";
import { buildEmbed } from "../utils/configBuilders.js";
import Ticket from "../tables/ticket.js";
import database from "../handlers/databaseHandler.js";
export default {
    id: "deny",
    function: async function ({ button }) {
        if (!button.inCachedGuild())
            return await button.reply({ content: ":x: **You must be in the server to use this button!**", ephemeral: true });
        if (!button.member.permissions.has(PermissionsBitField.Flags.Administrator))
            return await button.reply({ content: ":x: **You must be an administrator to use this button!**", ephemeral: true });
        await button.message.edit({ components: [] });
        const channel = button.guild.channels.cache.get(config.tickets.transcriptsChannel);
        const transcript = await discordTranscripts.createTranscript(button.channel, {
            returnType: discordTranscripts.ExportReturnType.Buffer,
            poweredBy: false,
            limit: -1
        });
        const attachment = new AttachmentBuilder(transcript, { name: `${button.channel.name}.html` });
        const ticket = await database.manager.findOne(Ticket, { where: { channel: button.channelId } });
        if (!ticket)
            return await button.channel.delete();
        const closedEmbed = buildEmbed("closed").addFields([
            { name: "Ticket Name", value: button.channel.name, inline: true },
            { name: "Ticket Creator", value: `<@${ticket.user}>`, inline: true },
            { name: "Closed by", value: `<@${button.user.id}>`, inline: true },
            { name: "Reason", value: "Denied the scam report.", inline: true }
        ]);
        await channel.send({ content: `:white_check_mark: **Ticket Closed**\n**Here is the transcript for \`#${button.channel.name}\`**\n**Reason:** Denied the scam report.`, embeds: [closedEmbed], files: [attachment] });
        if (config.tickets.dmTranscripts) {
            const usersIds = [...JSON.parse(ticket.added), ticket.user];
            for (const userId of usersIds) {
                const user = await button.client.users.fetch(userId);
                await user.send({ content: `:white_check_mark: **Ticket Closed**\n**Here is the transcript for \`#${button.channel.name}\`**`, embeds: [closedEmbed], files: [attachment] }).catch(() => null);
            }
        }
        setTimeout(async () => {
            await database.manager.delete(Ticket, { channel: button.channel.id });
            await button.channel.delete();
        }, 5000);
    }
};
