import { ButtonBuilder, ButtonStyle, EmbedBuilder } from "discord.js";
import config from "../config.js";
export function buildEmbed(name) {
    const embed = new EmbedBuilder()
        .setTitle(config.embeds[name].title || null)
        .setDescription(config.embeds[name].description || null)
        .setColor(config.embeds[name].color || null)
        .setFooter({ text: config.embeds[name].footer?.text || null, iconURL: config.embeds[name].footer?.iconURL || null })
        .setThumbnail(config.embeds[name].thumbnail || null)
        .setImage(config.embeds[name].image || null)
        .setAuthor({ name: config.embeds[name].author?.name || null, iconURL: config.embeds[name].author?.iconURL || null });
    if (config.embeds[name].timestamp)
        embed.setTimestamp();
    return embed;
}
export function buildButton(name) {
    const button = new ButtonBuilder();
    if (config.buttons[name].label)
        button.setLabel(config.buttons[name].label);
    if (config.buttons[name].url) {
        button.setURL(config.buttons[name].url);
        button.setStyle(ButtonStyle.Link);
    }
    else {
        button.setStyle(config.buttons[name].style || "Primary");
        button.setCustomId(name.replace(/\s/g, "_"));
    }
    if (config.buttons[name].emoji)
        button.setEmoji(config.buttons[name].emoji);
    return button;
}
