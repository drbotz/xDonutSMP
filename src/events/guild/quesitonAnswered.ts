import { ActionRowBuilder, ButtonBuilder, ChannelType, Message, PermissionsBitField } from "discord.js";
import database from "../../handlers/databaseHandler.js";
import QuestionChannel from "../../tables/questionChannel.js";
import config from "../../config.js";
import { getUUID } from "../../utils/getUUID.js";
import { buildButton, buildEmbed } from "../../utils/configBuilders.js";

enum ReportQuestionsIndex {
    reporterIGN = 0,
    scammerIGN = 1,
    scammerDiscord = 2,
    scamDescription = 3,
    scamProof = 4
}

export const uuidCache = new Map();

export default {
    name: "messageCreate",
    once: false,
    function: async function(message: Message) {
        if (message.author.bot) return;
        if (message.channel.type == ChannelType.DM) return;
        if (!message.channel.name.startsWith("answering-")) return;

        const channelDB = await database.manager.findOne(QuestionChannel, { where: { channelId: message.channelId } });
        if (!channelDB) return;

        const question = channelDB.currentQuestion;
        
        if (message.content.length > 1024) {
            const msg = await message.reply({ content: ":x: **Your answer is too long. Please try again.**" });

            setTimeout(() => {
                msg.delete();
            }, 5000);

            return;
        }

        const sendTempMessage = async (content: string) => {
            const msg = await message.channel.send({ content });
            setTimeout(() => {
                msg.delete();
            }, 5000);
        }

        const qna = JSON.parse(channelDB.qna);
        qna.push({ question, answer: message.content });

        await database.manager.update(QuestionChannel, { channelId: message.channelId }, { qna: JSON.stringify(qna) });

        const nextQuestion = config.reportQuestions[config.reportQuestions.indexOf(question) + 1];
        if (!nextQuestion) {
            const sentMessages = await message.channel.messages.fetch({ limit: 100 });
            const botMessages = sentMessages.filter(m => m.author.id == message.client.user.id);
            if (botMessages.find(m => m.content.includes("Would you like to submit the questions?"))) return;
            await message.delete();

            let report = config.embeds.ticketReport.description;
            let reporterUUID = null;
            let scammerIGN = null;
            let scammerUUID = null;
            let scammerDiscord = null;
            let scamDescription = null;
            let proof = null;

            for (const q of qna) {
                const question = q.question;
                const answer = q.answer;

                switch (config.reportQuestions.indexOf(question)) {
                    case ReportQuestionsIndex.reporterIGN:
                        if (message.content?.toLowerCase() == "n/a") {
                            report = report.replace(/{reporter}/g, message.author.tag);
                            report = report.replace(/{reporterIGN}/g, "Not provided.");
                            report = report.replace(/{reporterUUID}/g, "Not provided.");
                            break;
                        }
                        reporterUUID = uuidCache.get(message.content) || await getUUID(answer);
                        uuidCache.set(message.content, reporterUUID);
                        if (reporterUUID === null) await sendTempMessage(":x: **The IGN you entered is invalid. Please try again.**");
                        report = report.replace(/{reporter}/g, message.author.tag);
                        report = report.replace(/{reporterIGN}/g, answer);
                        report = report.replace(/{reporterUUID}/g, reporterUUID);
                        break;
                    case ReportQuestionsIndex.scammerIGN:
                        if (message.content?.toLowerCase() == "n/a") {
                            report = report.replace(/{scammerIGN}/g, "Not provided.");
                            report = report.replace(/{scammerUUID}/g, "Not provided.");
                            break;
                        }
                        scammerUUID = uuidCache.get(message.content) || await getUUID(answer);
                        uuidCache.set(message.content, scammerUUID);
                        if (scammerUUID === null) return await sendTempMessage(":x: **The scammer IGN you entered is invalid. Please try again.**");
                        scammerIGN = answer;
                        report = report.replace(/{scammerIGN}/g, answer);
                        report = report.replace(/{scammerUUID}/g, scammerUUID);
                        break;
                    case ReportQuestionsIndex.scammerDiscord:
                        if (answer?.toLowerCase() == "n/a") {
                            report = report.replace(/{scammerDiscord}/g, "Not provided.");
                            break;
                        }
                        if (!parseInt(answer) && answer.length < 17) return await sendTempMessage(":x: **The scammer Discord ID you entered is invalid. Please try again.**");
                        report = report.replace(/{scammerDiscord}/g, answer);
                        scammerDiscord = answer;
                        break;
                    case ReportQuestionsIndex.scamDescription:
                        report = report.replace(/{scamDescription}/g, answer);
                        scamDescription = answer;
                        break;
                    case ReportQuestionsIndex.scamProof:
                        report = report.replace(/{scamProof}/g, answer);
                        proof = answer;
                        break;
                }
            }

            const embed = buildEmbed("ticketReport")
                .setTitle(config.embeds.ticketReport.title + ` | ${new Date().toLocaleDateString()}`)
                .setDescription(report);
            
            const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
                buildButton("submit"),
                buildButton("restart"),
                buildButton("cancel")
            );

            await message.channel.send({ content: "**Would you like to submit the questions?**", embeds: [embed], components: [row] });
            const msg = await message.channel.messages.fetch(channelDB.questionMessage).catch(() => null);
            if (msg) await msg.delete();
        } else {
            await message.delete();
            const currentQuestionIndex = config.reportQuestions.indexOf(question);

            switch (currentQuestionIndex) {
                case ReportQuestionsIndex.reporterIGN:
                    if (message.content?.toLowerCase() == "n/a") break;
                    const reporterUUID = uuidCache.get(message.content) || await getUUID(message.content);
                    uuidCache.set(message.content, reporterUUID);
                    if (reporterUUID === null) return await sendTempMessage(":x: **The IGN you entered is invalid. Please try again.**");
                    break;
                case ReportQuestionsIndex.scammerIGN:
                    if (message.content?.toLowerCase() == "n/a") break;
                    const scammerUUID = uuidCache.get(message.content) || await getUUID(message.content);
                    uuidCache.set(message.content, scammerUUID);
                    if (scammerUUID === null) return await sendTempMessage(":x: **The scammer IGN you entered is invalid. Please try again.**");
                    break;
                case ReportQuestionsIndex.scammerDiscord:
                    if (message.content?.toLowerCase() == "n/a") break;
                    if (!parseInt(message.content) && message.content.length < 17) return await sendTempMessage(":x: **The scammer Discord ID you entered is invalid. Please try again.**");
                    break;
                case ReportQuestionsIndex.scamDescription:
                    break;
                case ReportQuestionsIndex.scamProof:
                    break;
                default:
                    break;
            }

            await database.manager.update(QuestionChannel, { channelId: message.channelId }, { currentQuestion: nextQuestion });
            const embed = buildEmbed("questioning").setDescription(`Please answer the following questions to the best of your ability. If you don't have an answer, type "N/A".\n\n**Question ${config.reportQuestions.indexOf(nextQuestion) + 1}:** ${nextQuestion}`).setFooter({ text: `Question ${config.reportQuestions.indexOf(nextQuestion) + 1}/${config.reportQuestions.length}`, iconURL: message.guild.iconURL() });

            const msg = await message.channel.messages.fetch(channelDB.questionMessage).catch(() => null);
            if (msg) await msg.edit({ embeds: [embed] });
            else {
                const msg = await message.channel.send({ embeds: [embed] });
                await database.manager.update(QuestionChannel, { channelId: message.channelId }, { questionMessage: msg.id });
            }
        }
    }
}