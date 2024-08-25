import { ActionRowBuilder, PermissionsBitField } from "discord.js";
import config from "../config.js";
import database from "../handlers/databaseHandler.js";
import { getUUID } from "../utils/getUUID.js";
import { buildButton, buildEmbed } from "../utils/configBuilders.js";
import Ticket from "../tables/ticket.js";
import Report from "../tables/report.js";
import { client } from "../index.js";
var ReportQuestionsIndex;
(function (ReportQuestionsIndex) {
    ReportQuestionsIndex[ReportQuestionsIndex["reporterIGN"] = 0] = "reporterIGN";
    ReportQuestionsIndex[ReportQuestionsIndex["scammerIGN"] = 1] = "scammerIGN";
    ReportQuestionsIndex[ReportQuestionsIndex["scammerDiscord"] = 2] = "scammerDiscord";
    ReportQuestionsIndex[ReportQuestionsIndex["scamDescription"] = 3] = "scamDescription";
    ReportQuestionsIndex[ReportQuestionsIndex["scamProof"] = 4] = "scamProof";
})(ReportQuestionsIndex || (ReportQuestionsIndex = {}));
export default {
    id: "report",
    function: async function ({ interaction }) {
        await interaction.deferReply({ ephemeral: true });
        let report = config.embeds.ticketReport.description;
        let reporterUUID = null;
        let scammerIGN = null;
        let scammerUUID = null;
        let scammerDiscord = null;
        let scamDescription = null;
        let proof = null;
        for (const question of config.reportQuestions) {
            const qid = question.label.replace(/\s/g, "_");
            const answer = interaction.fields.getTextInputValue(qid);
            switch (config.reportQuestions.indexOf(question)) {
                case ReportQuestionsIndex.reporterIGN:
                    reporterUUID = await getUUID(answer);
                    if (reporterUUID === null)
                        return await interaction.editReply({ content: ":x: **The IGN you entered is invalid. Please try again.**" });
                    report = report.replace(/{reporter}/g, interaction.user.tag);
                    report = report.replace(/{reporterIGN}/g, answer);
                    report = report.replace(/{reporterUUID}/g, reporterUUID);
                    break;
                case ReportQuestionsIndex.scammerIGN:
                    scammerUUID = await getUUID(answer);
                    if (scammerUUID === null)
                        return await interaction.editReply({ content: ":x: **The IGN you entered is invalid. Please try again.**" });
                    scammerIGN = answer;
                    report = report.replace(/{scammerIGN}/g, answer);
                    report = report.replace(/{scammerUUID}/g, scammerUUID);
                    break;
                case ReportQuestionsIndex.scammerDiscord:
                    if (!answer) {
                        report = report.replace(/{scammerDiscord}/g, "Not provided.");
                        break;
                    }
                    const user = await client.users.fetch(answer).catch(() => null);
                    if (!user)
                        return await interaction.editReply({ content: ":x: **Invalid user ID. Please try again.**" });
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
        const channel = await interaction.guild.channels.create({
            name: `${interaction.user.username}-report`,
            parent: config.tickets.category,
            permissionOverwrites: [
                { id: interaction.guild.id, deny: [PermissionsBitField.Flags.ViewChannel] },
                { id: interaction.user.id, allow: [PermissionsBitField.Flags.ViewChannel] },
                ...config.tickets.staffRoles.map(role => { return { id: role, allow: [PermissionsBitField.Flags.ViewChannel] }; })
            ]
        });
        const staffRow = new ActionRowBuilder().addComponents(buildButton("approve"), buildButton("deny"));
        const msg = await channel.send({ content: `<@${interaction.user.id}>${config.tickets.pingRole ? `<@&${config.tickets.pingRole}>` : ""}`, embeds: [embed], components: [staffRow] });
        await interaction.editReply({ content: `:white_check_mark: **Your report has been submitted.** <#${channel.id}>` });
        await database.manager.insert(Ticket, {
            date: Date.now(),
            channel: channel.id,
            startingMessage: msg.id,
            user: interaction.user.id,
            state: "open",
            added: "[]"
        });
        await database.manager.insert(Report, {
            date: Date.now(),
            channel: channel.id,
            reporter: interaction.user.id,
            reporterUUID: reporterUUID,
            scammer: scammerIGN,
            scammerUUID: scammerUUID,
            scammerDiscord: scammerDiscord,
            description: scamDescription,
            proof: proof
        });
    }
};
