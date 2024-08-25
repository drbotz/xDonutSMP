import { ActionRowBuilder } from "discord.js";
import { buildButton, buildEmbed } from "../utils/configBuilders.js";
import database from "../handlers/databaseHandler.js";
import Panel from "../tables/panel.js";
export default {
    name: "panel",
    description: "Post a panel",
    aliases: [],
    permissions: ["Administrator"],
    usage: "panel",
    function: async function ({ message }) {
        const scamEmbed = buildEmbed("report");
        const scamButton = new ActionRowBuilder().addComponents(buildButton("report"));
        await message.channel.send({ embeds: [scamEmbed], components: [scamButton] });
        await message.channel.send(":white_check_mark: **Posted the panel successfully.**");
        await database.manager.insert(Panel, {
            channelId: message.channel.id,
            guildId: message.guild.id,
            embed: "report",
            panelMessage: (await message.channel.send(":white_check_mark: **Posted the panel successfully.**")).id
        });
    }
};
