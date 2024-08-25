import database from "../handlers/databaseHandler.js";
import Scammer from "../tables/scammer.js";
import config from "../config.js";
import { buildEmbed } from "../utils/configBuilders.js";
export default {
    name: "edit",
    description: "Edit a posted scam report",
    aliases: [],
    permissions: ["Administrator"],
    usage: "edit <id> <description|proof|scammer_discord> <new_value>",
    function: async function ({ message, args }) {
        const id = parseInt(args[0]);
        const field = args[1];
        const value = args.slice(2).join(" ");
        if (!id || !field || !value)
            return message.channel.send(":x: **You must provide a report ID, field and new value!**");
        const report = await database.manager.findOne(Scammer, { where: { id } });
        if (!report)
            return message.channel.send(":x: **That report doesn't exist!**");
        if (field === "description")
            await database.manager.update(Scammer, { id }, { description: value });
        else if (field === "proof")
            await database.manager.update(Scammer, { id }, { proof: value });
        else if (field === "scammer_discord")
            await database.manager.update(Scammer, { id }, { scammerDiscord: value });
        else
            return message.channel.send(":x: **That field doesn't exist!**");
        const channel = await message.guild?.channels.fetch(config.channels.reports);
        if (!channel)
            return message.channel.send(":x: **That report doesn't exist!**");
        const reportMessage = await channel.messages.fetch(report.message);
        if (!reportMessage)
            return message.channel.send(":x: **That report doesn't exist!**");
        const reportEmbed = buildEmbed("report").setDescription(`**Reporter:**\n${report.reporter} (${report.reporterUUID})\n\n**Scammer:**\n${report.scammerIGN} (${report.scammerUUID})\n\n**Scammer Discord:**\n${value || report.scammerDiscord || "Not provided."}\n\n**Description:**\n${value || report.description}\n\n**Proof:**\n${value || report.proof}`);
        await reportMessage.edit({ embeds: [reportEmbed] });
        return message.channel.send(":white_check_mark: **Successfully edited the report!**");
    }
};
