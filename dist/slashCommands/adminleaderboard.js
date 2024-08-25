import { ApplicationCommandOptionType } from "discord.js";
import { getLeaderboard } from "../minecraft/index.js";
import { buildEmbed } from "../utils/configBuilders.js";
import database from "../handlers/databaseHandler.js";
import Leaderboard from "../tables/leaderboard.js";
export default {
    name: "adminleaderboard",
    description: "Create an auto updating leaderboard",
    options: [
        {
            name: "type", description: "The leaderboard time you'd like to check", type: ApplicationCommandOptionType.String, required: true, choices: [
                { name: "Money Leaderboard", value: "ᴍᴏɴᴇʏ ʟᴇᴀᴅᴇʀʙᴏᴀʀᴅ" },
                { name: "Shards Leaderboard", value: "ѕʜᴀʀᴅѕ ʟᴇᴀᴅᴇʀʙᴏᴀʀᴅ" },
                { name: "Deaths Leaderboard", value: "ᴅᴇᴀᴛʜѕ ʟᴇᴀᴅᴇʀʙᴏᴀʀᴅ" },
                { name: "Playtime Leaderboard", value: "ᴘʟᴀʏᴛɪᴍᴇ ʟᴇᴀᴅᴇʀʙᴏᴀʀᴅ" },
                { name: "Blocks Broken Leaderboard", value: "ʙʟᴏᴄᴋѕ ʙʀᴏᴋᴇɴ ʟᴇᴀᴅᴇʀʙᴏᴀʀᴅ" },
                { name: "Blocks Placed Leaderboard", value: "ʙʟᴏᴄᴋѕ ᴘʟᴀᴄᴇᴅ ʟᴇᴀᴅᴇʀʙᴏᴀʀᴅ" },
                { name: "Mobs Killed Leaderboard", value: "ᴍᴏʙѕ ᴋɪʟʟᴇᴅ ʟᴇᴀᴅᴇʀʙᴏᴀʀᴅ" },
                { name: "Money Spent on Shop Leaderboard", value: "ᴍᴏɴᴇʏ ѕᴘᴇɴᴛ ᴏɴ ѕʜᴏᴘ ʟᴇᴀᴅᴇʀʙᴏᴀʀᴅ" },
                { name: "Money made on /sell Leaderboard", value: "ᴍᴏɴᴇʏ ᴍᴀᴅᴇ ᴏɴ /ѕᴇʟʟ ʟᴇᴀᴅᴇʀʙᴏᴀʀᴅ" }
            ]
        }
    ],
    permissions: ["Administrator"],
    function: async function ({ interaction }) {
        await interaction.deferReply({ ephemeral: true });
        const type = interaction.options.getString("type");
        const leaderboard = await getLeaderboard(type).catch(() => null);
        if (!leaderboard)
            return interaction.editReply(":x: **Leaderboard not found!**");
        const topPlayersString = leaderboard.users.map((player) => `**${player.slot + 1}.** ${player.name.replace(/_/g, "\_")} - ${player.lore}`).join("\n");
        const embed = buildEmbed("leaderboard")
            .setTitle(leaderboard.leaderboard)
            .setDescription(topPlayersString);
        await interaction.editReply({ content: ":white_check_mark: **Sent the leaderboard.**" });
        const msg = await interaction.channel.send({ embeds: [embed] });
        await database.manager.insert(Leaderboard, {
            message: msg.id,
            channelId: msg.channel.id,
            guild: msg.guild.id,
            type: type
        });
    }
};
