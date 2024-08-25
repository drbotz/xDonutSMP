import { ActionRowBuilder } from "discord.js";
import database from "../handlers/databaseHandler.js";
import QuestionChannel from "../tables/questionChannel.js";
import config from "../config.js";
import { buildButton, buildEmbed } from "../utils/configBuilders.js";
import Link from "../tables/link.js";
export default {
    id: "restart",
    function: async function ({ button }) {
        const channelDB = database.manager.findOne(QuestionChannel, { where: { channelId: button.channelId } });
        if (!channelDB)
            return await button.reply({ content: ":x: **This channel is not a question channel.**", ephemeral: true });
        await button.reply({ content: ":white_check_mark: **The scam report has been restarted.**" });
        await new Promise(resolve => setTimeout(resolve, 1000));
        await button.channel.bulkDelete(100);
        const linked = await database.manager.findOne(Link, { where: { discordId: button.user.id } });
        const questionEmbed = buildEmbed("questioning").setDescription(`Please answer the following questions to the best of your ability. If you don't have an answer, type "N/A".\n\n**Question ${linked ? "2" : "1"}:** ${linked ? config.reportQuestions[1] : config.reportQuestions[0]}`).setFooter({ text: `Question ${linked ? "2" : "1"}/${config.reportQuestions.length}`, iconURL: button.guild.iconURL() });
        const row = new ActionRowBuilder().addComponents(buildButton("cancel"), buildButton("restart"));
        const questionMessage = await button.channel.send({ embeds: [questionEmbed], components: [row] });
        await database.manager.update(QuestionChannel, { channelId: button.channelId }, { questionMessage: questionMessage.id, qna: linked ? JSON.stringify([{ question: config.reportQuestions[0], answer: linked.ign }]) : "[]", currentQuestion: config.reportQuestions[linked ? 1 : 0] });
    }
};
