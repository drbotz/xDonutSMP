import { ApplicationCommandOptionType, ChatInputCommandInteraction } from "discord.js";
import { client } from "../index.js";
import { bot } from "../minecraft/index.js";
import { buildEmbed } from "../utils/configBuilders.js";
import database from "../handlers/databaseHandler.js";
import config from "../config.js";
import Link from "../tables/link.js";

export default {
    name: "link",
    description: "Link your account to the bot",
    permissions: [],
    options: [{ name: "ign", description: "What is your IGN", type: ApplicationCommandOptionType.String, required: true }],
    function: async function ({ interaction }: { interaction: ChatInputCommandInteraction }) {
        const ign = interaction.options.getString("ign");

        const alreadyLinked = await database.manager.findOne(Link, { where: { discordId: interaction.user.id } }) || await database.manager.findOne(Link, { where: { ign: ign } });
        if (alreadyLinked) return await interaction.reply({ content: ":x: **Account already linked!**", ephemeral: true });
        
        const code = `${Math.floor(Math.random() * 1000000)}-${interaction.user.id}`;

        client.linkCodes.set(code, { ign, user: interaction.user.id, expires: Date.now() + 300000, discordUsername: interaction.user.username, guild: interaction.guildId });

        const embed = buildEmbed("link").setDescription(config.embeds.link.description.replace(/{botName}/g, bot.username).replace(/{code}/g, code));
        await interaction.reply({ embeds: [embed] });
    }
}