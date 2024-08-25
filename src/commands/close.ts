import * as discordTranscripts from "discord-html-transcripts";
import database from "../handlers/databaseHandler.js";
import Ticket from "../tables/ticket.js";
import { AttachmentBuilder, BaseGuildTextChannel, ChannelType, Message, PermissionsBitField } from "discord.js";
import { buildEmbed } from "../utils/configBuilders.js";
import config from "../config.js";

export default {
    name: "close",
    description: "Close this ticket",
    aliases: ["end"],
    permissions: [],
    usage: "close <reason>",
    function: async function ({ message, args }: { message: Message, args: string[] }) {
        const reason = args.join(" ");
        if (!reason) return message.channel.send(":x: **You must provide a reason!**");

        const ticket = await database.manager.findOne(Ticket, { where: { channel: message.channel.id } });
        if (!ticket) return message.reply({ content: ":x: **This is not a ticket channel!**" });

        const roles = config.tickets.staffRoles;
        if (!roles.some(role => message.member.roles.cache.has(role)) && !message.member.permissions.has(PermissionsBitField.Flags.Administrator)) return message.reply({ content: "❌ **You don't have permission to do that!**" });

        await message.reply({ content: ":white_check_mark: **Closing ticket...**" });

        const channel = message.guild.channels.cache.get(config.tickets.transcriptsChannel) as BaseGuildTextChannel;

        const transcript = await discordTranscripts.createTranscript(message.channel, {
            returnType: discordTranscripts.ExportReturnType.Buffer,
            poweredBy: false,
            limit: -1
        });

        if (message.channel.type !== ChannelType.PrivateThread) return;
        const attachment = new AttachmentBuilder(transcript, { name: `${message.channel.name}.html` });

        const closedEmbed = buildEmbed("closed").addFields([
            { name: "Ticket Name", value: message.channel.name, inline: true },
            { name: "Ticket Creator", value: `<@${ticket.user}>`, inline: true },
            { name: "Closed by", value: `<@${message.author.id}>`, inline: true },
            { name: "Reason", value: reason, inline: true }
        ]);

        await channel.send({ content: `:white_check_mark: **Ticket Closed**\n**Here is the transcript for \`#${message.channel.name}\`**\n**Reason:** ${reason}`, embeds: [closedEmbed], files: [attachment] });

        if (config.tickets.dmTranscripts) {
            const usersIds = [...JSON.parse(ticket.added), ticket.user]

            for (const userId of usersIds) {
                const user = await message.client.users.fetch(userId);
                await user.send({ content: `:white_check_mark: **Ticket Closed**\n**Here is the transcript for \`#${message.channel.name}\`**`, embeds: [closedEmbed], files: [attachment] }).catch(() => null);
            }
        }

        setTimeout(async () => {
            await database.manager.delete(Ticket, { channel: message.channel.id });
            await message.channel.delete();
        }, 5000);
    }
    // options: [{ name: "reason", description: "Reason for closure", type: ApplicationCommandOptionType.String, required: true }],
    // function: async function ({ interaction }: { interaction: ChatInputCommandInteraction }) {
    //     if (!interaction.inCachedGuild()) return;

    //     const reason = interaction.options.getString("reason");

    //     const ticket = await database.manager.findOne(Ticket, { where: { channel: interaction.channel.id } });
    //     if (!ticket) return interaction.reply({ content: ":x: **This is not a ticket channel!**", ephemeral: true });

    //     const roles = config.tickets.staffRoles;
    //     if (!roles.some(role => interaction.member.roles.cache.has(role)) && !interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) return interaction.reply({ content: "❌ **You don't have permission to do that!**", ephemeral: true });

    //     await interaction.reply({ content: ":white_check_mark: **Closing ticket...**" });

    //     const channel = interaction.guild.channels.cache.get(config.tickets.transcriptsChannel) as BaseGuildTextChannel;

    //     const transcript = await discordTranscripts.createTranscript(interaction.channel, {
    //         returnType: discordTranscripts.ExportReturnType.Buffer,
    //         poweredBy: false,
    //         limit: -1
    //     });

    //     const attachment = new AttachmentBuilder(transcript, { name: `${interaction.channel.name}.html` });

    //     const closedEmbed = buildEmbed("closed").addFields([
    //         { name: "Ticket Name", value: interaction.channel.name, inline: true },
    //         { name: "Ticket Creator", value: `<@${ticket.user}>`, inline: true },
    //         { name: "Closed by", value: `<@${interaction.user.id}>`, inline: true },
    //         { name: "Reason", value: reason, inline: true }
    //     ]);

    //     await channel.send({ content: `:white_check_mark: **Ticket Closed**\n**Here is the transcript for \`#${interaction.channel.name}\`**\n**Reason:** ${reason}`, embeds: [closedEmbed], files: [attachment] });

    //     if (config.tickets.dmTranscripts) {
    //         const usersIds = [...JSON.parse(ticket.added), ticket.user]

    //         for (const userId of usersIds) {
    //             const user = await interaction.client.users.fetch(userId);
    //             await user.send({ content: `:white_check_mark: **Ticket Closed**\n**Here is the transcript for \`#${interaction.channel.name}\`**`, embeds: [closedEmbed], files: [attachment] }).catch(() => null);
    //         }
    //     }

    //     setTimeout(async () => {
    //         await database.manager.delete(Ticket, { channel: interaction.channel.id });
    //         await interaction.channel.delete();
    //     }, 5000);
    // }
}
