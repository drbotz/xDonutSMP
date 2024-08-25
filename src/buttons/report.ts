import { ActionRowBuilder, ButtonBuilder, ButtonInteraction, ChannelType, PermissionsBitField } from "discord.js";
import config from "../config.js";
import database from "../handlers/databaseHandler.js";
import { buildButton, buildEmbed } from "../utils/configBuilders.js";
import QuestionChannel from "../tables/questionChannel.js";
import Link from "../tables/link.js";

export default {
    id: "report",
    function: async function({ button }: { button: ButtonInteraction }) {
        if (!config.reportQuestions.length) return await button.reply({ content: ":x: **The report form is not set up.**", ephemeral: true });

        await button.deferReply({ ephemeral: true });

        const channel = await button.guild.channels.create({
            name: `answering-${button.user.username}`,
            type: ChannelType.GuildText,
            parent: config.tickets.category,
            topic: `Answering ${button.user.tag}'s scam report...`,
            permissionOverwrites: [
                {
                    id: button.guild.id,
                    deny: [PermissionsBitField.Flags.ViewChannel]
                },
                {
                    id: button.user.id,
                    allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.AttachFiles]
                },
                ...config.tickets.staffRoles.map(role => {
                    return {
                        id: role,
                        allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.AttachFiles]
                    }
                })
            ]
        });

        const linked = await database.manager.findOne(Link, { where: { discordId: button.user.id } });

        const questionEmbed = buildEmbed("questioning").setDescription(`Please answer the following questions to the best of your ability. If you don't have an answer, type "N/A".\n\n**Question ${linked ? "2" : "1"}:** ${linked ? config.reportQuestions[1] : config.reportQuestions[0]}`).setFooter({ text: `Question ${linked ? "2" : "1"}/${config.reportQuestions.length}`, iconURL: button.guild.iconURL() });
        const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
            buildButton("cancel"),
            buildButton("restart")
        );
        const questionMessage = await channel.send({ embeds: [questionEmbed], components: [row] });

        await button.editReply({ content: `:white_check_mark: **Your scam report channel has been created.** <#${channel.id}>` });

        await database.manager.insert(QuestionChannel, {
            channelId: channel.id,
            guildId: button.guild.id,
            qna: linked ? JSON.stringify([{question: config.reportQuestions[0], answer: linked.ign}]) : "[]",
            currentQuestion: config.reportQuestions[linked ? 1 : 0],
            questionMessage: questionMessage.id,
            createdAt: Date.now()
        });
    }
}