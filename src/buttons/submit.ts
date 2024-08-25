import { ActionRowBuilder, ButtonBuilder, ButtonInteraction, PermissionsBitField } from "discord.js";
import database from "../handlers/databaseHandler.js";
import QuestionChannel from "../tables/questionChannel.js";
import config from "../config.js";
import { uuidCache } from "../events/guild/quesitonAnswered.js";
import { getUUID } from "../utils/getUUID.js";
import { buildButton, buildEmbed } from "../utils/configBuilders.js";
import Ticket from "../tables/ticket.js";
import Report from "../tables/report.js";

enum ReportQuestionsIndex {
    reporterIGN = 0,
    scammerIGN = 1,
    scammerDiscord = 2,
    scamDescription = 3,
    scamProof = 4
}

export default {
    id: "submit",
    function: async function ({ button }: { button: ButtonInteraction }) {
        const channelDB = await database.manager.findOne(QuestionChannel, { where: { channelId: button.channelId } });
        if (!channelDB) return await button.reply({ content: ":x: **This channel is not a question channel.**", ephemeral: true });

        const qna = JSON.parse(channelDB.qna);
        let report = config.embeds.ticketReport.description;
        let reporterUUID = "Not provided.";
        let scammerIGN = "Not provided.";
        let scammerUUID = "Not provided.";
        let scammerDiscord = "Not provided.";
        let scamDescription = "Not provided.";
        let proof = "Not provided.";

        for (const q of qna) {
            const question = q.question;
            const answer = q.answer;

            switch (config.reportQuestions.indexOf(question)) {
                case ReportQuestionsIndex.reporterIGN:
                    if (answer.toLowerCase() == "n/a") {
                        report = report.replace(/{reporter}/g, button.user.tag);
                        report = report.replace(/{reporterIGN}/g, "Not provided.");
                        report = report.replace(/{reporterUUID}/g, "Not provided.");
                        break;
                    }
                    reporterUUID = uuidCache.get(answer) || await getUUID(answer);
                    uuidCache.set(answer, reporterUUID);
                    if (reporterUUID === null) await button.reply({ content: ":x: **The IGN you entered is invalid. Please try again.**", ephemeral: true });
                    report = report.replace(/{reporter}/g, button.user.tag);
                    report = report.replace(/{reporterIGN}/g, answer);
                    report = report.replace(/{reporterUUID}/g, reporterUUID);
                    break;
                case ReportQuestionsIndex.scammerIGN:
                    if (answer.toLowerCase() == "n/a") {
                        report = report.replace(/{scammerIGN}/g, "Not provided.");
                        report = report.replace(/{scammerUUID}/g, "Not provided.");
                        break;
                    }
                    scammerUUID = uuidCache.get(answer) || await getUUID(answer);
                    uuidCache.set(answer, scammerUUID);
                    if (scammerUUID === null) return await button.reply({ content: ":x: **The scammer IGN you entered is invalid. Please try again.**", ephemeral: true });
                    scammerIGN = answer;
                    report = report.replace(/{scammerIGN}/g, answer);
                    report = report.replace(/{scammerUUID}/g, scammerUUID);
                    break;
                case ReportQuestionsIndex.scammerDiscord:
                    if (answer?.toLowerCase() == "n/a") {
                        report = report.replace(/{scammerDiscord}/g, "Not provided.");
                        break;
                    }
                    if (!parseInt(answer) && answer.length < 17) return await button.reply({ content: ":x: **The scammer Discord ID you entered is invalid. Please try again.**", ephemeral: true });
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

        const channel = await button.guild.channels.create({
            name: `${button.user.username}-report`,
            parent: config.tickets.category,
            permissionOverwrites: [
                { id: button.guild.id, deny: [PermissionsBitField.Flags.ViewChannel] },
                { id: button.user.id, allow: [PermissionsBitField.Flags.ViewChannel] },
                ...config.tickets.staffRoles.map(role => { return { id: role, allow: [PermissionsBitField.Flags.ViewChannel] } })
            ]
        });

        const staffRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
            buildButton("approve"),
            buildButton("deny")
        );

        const msg = await channel.send({ content: `<@${button.user.id}>${config.tickets.pingRole ? `<@&${config.tickets.pingRole}>` : ""}`, embeds: [embed], components: [staffRow] });
        await button.reply({ content: `:white_check_mark: **Your report has been submitted.** <#${channel.id}>\n**Deleting this channel in 5 seconds.**` });
        await button.message.edit({ components: [] });

        setTimeout(async () => {
            await button.channel.delete();
            await database.manager.delete(QuestionChannel, { channelId: button.channelId });
        }, 5000);

        await database.manager.insert(Ticket, {
            date: Date.now(),
            channel: channel.id,
            startingMessage: msg.id,
            user: button.user.id,
            state: "open",
            added: "[]"
        });

        await database.manager.insert(Report, {
            date: Date.now(),
            channel: channel.id,
            reporter: button.user.id,
            reporterUUID: reporterUUID,
            scammer: scammerIGN,
            scammerUUID: scammerUUID,
            scammerDiscord: scammerDiscord,
            description: scamDescription,
            proof: proof
        });
    }
}