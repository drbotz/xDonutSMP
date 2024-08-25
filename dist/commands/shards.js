import { getShards } from "../minecraft/index.js";
import config from "../config.js";
import database from "../handlers/databaseHandler.js";
import { buildEmbed } from "../utils/configBuilders.js";
import Link from "../tables/link.js";
export default {
    name: "shards",
    description: "Get a player's shards",
    aliases: [],
    permissions: [],
    usage: "shards [username|discord_id|discord_mention]",
    function: async function ({ message, args }) {
        let username;
        const isDiscordId = args[0].length === 18;
        const mention = message.mentions.users.first();
        const ign = args.join(" ");
        if (isDiscordId) {
            const linked = await database.manager.findOne(Link, { where: { discordId: args[0] } });
            if (!linked) {
                const msg = await message.channel.send(":x: **That user is not linked to an account!**");
                setTimeout(() => {
                    msg.delete();
                }, 60000);
                return;
            }
        }
        else if (mention) {
            const linked = await database.manager.findOne(Link, { where: { discordId: mention.id } });
            if (!linked) {
                const msg = await message.channel.send(":x: **That user is not linked to an account!**");
                setTimeout(() => {
                    msg.delete();
                }, 60000);
                return;
            }
            username = linked.ign;
        }
        else if (ign) {
            username = ign;
        }
        else {
            const linked = await database.manager.findOne(Link, { where: { discordId: message.author.id } });
            if (!linked) {
                const msg = await message.channel.send(":x: **You are not linked to an account!**");
                setTimeout(() => {
                    msg.delete();
                }, 60000);
                return;
            }
        }
        const shards = await getShards(username);
        if (shards == "ENOENT")
            return message.channel.send(":x: **Player not found!**");
        const embed = buildEmbed("shards").setDescription(config.embeds.shards.description.replace(/{user}/g, username).replace(/{shards}/g, shards.toString()));
        const msg = await message.channel.send({ embeds: [embed] });
        setTimeout(() => {
            msg.delete();
        }, 60000);
    }
};
