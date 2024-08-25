import { ApplicationCommandOptionType, ChatInputCommandInteraction } from "discord.js";
import { getLeaderboard } from "../minecraft/index.js";
import { buildEmbed } from "../utils/configBuilders.js";

const choices = [
    { name: "Money Leaderboard", value: "ᴍᴏɴᴇʏ ʟᴇᴀᴅᴇʀʙᴏᴀʀᴅ" },
    { name: "Shards Leaderboard", value: "ѕʜᴀʀᴅѕ ʟᴇᴀᴅᴇʀʙᴏᴀʀᴅ" },
    { name: "Deaths Leaderboard", value: "ᴅᴇᴀᴛʜѕ ʟᴇᴀᴅᴇʀʙᴏᴀʀᴅ" },
    { name: "Playtime Leaderboard", value: "ᴘʟᴀʏᴛɪᴍᴇ ʟᴇᴀᴅᴇʀʙᴏᴀʀᴅ" },
    { name: "Blocks Broken Leaderboard", value: "ʙʟᴏᴄᴋѕ ʙʀᴏᴋᴇɴ ʟᴇᴀᴅᴇʀʙᴏᴀʀᴅ" },
    { name: "Blocks Placed Leaderboard", value: "ʙʟᴏᴄᴋѕ ᴘʟᴀᴄᴇᴅ ʟᴇᴀᴅᴇʀʙᴏᴀʀᴅ" },
    { name: "Mobs Killed Leaderboard", value: "ᴍᴏʙѕ ᴋɪʟʟᴇᴅ ʟᴇᴀᴅᴇʀʙᴏᴀʀᴅ" },
    { name: "Money Spent on Shop Leaderboard", value: "ᴍᴏɴᴇʏ ѕᴘᴇɴᴛ ᴏɴ ѕʜᴏᴘ ʟᴇᴀᴅᴇʀʙᴏᴀʀᴅ" },
    { name: "Money made on /sell Leaderboard", value: "ᴍᴏɴᴇʏ ᴍᴀᴅᴇ ᴏɴ /ѕᴇʟʟ ʟᴇᴀᴅᴇʀʙᴏᴀʀᴅ" }
];

export default {
    name: "leaderboard",
    description: "View a leaderboard",
    options: [
        { name: "type", description: "The leaderboard time you'd like to check", type: ApplicationCommandOptionType.String, required: false, choices },
        { name: "username", description: "The user to check their position", type: ApplicationCommandOptionType.String, required: false }
    ],
    permissions: [],
    function: async function({ interaction }: { interaction: ChatInputCommandInteraction }) {
        await interaction.deferReply({ ephemeral: true });
        
        const type = interaction.options.getString("type");
        const username = interaction.options.getString("username");

        if (!type && !username) return interaction.editReply({ content: ":x: **Please specify a leaderboard type or a username!**" });

        if (!type && username) {
            const results = [];
            for (const choice of choices) {
                const leaderboard = await getLeaderboard(choice.value).catch(() => null);
                if (!leaderboard) continue;

                results.push({ type: choice.value, count: leaderboard.users.length, user: leaderboard.users.find((user) => user.name.toLowerCase() === username.toLowerCase()) || null });
            }

            const embed = buildEmbed("leaderboard")
                .setTitle("User Leaderboard Positions")
                .setDescription(results.map((result) => `**${result.type}** - ${result.user ? `#${result.user.slot + 1}` : "Not found"}`).join("\n"));

            await interaction.editReply({ embeds: [embed] });
        } else {
            const leaderboard = await getLeaderboard(type).catch(() => null);
    
            if (!leaderboard) return interaction.editReply(":x: **Leaderboard not found!**");
    
            const topPlayersString = leaderboard.users.map((player) => `**${player.slot + 1}.** ${player.name.replace(/_/g, "\_")} - ${player.lore}`).join("\n");
            
            if (username) {
                const user = leaderboard.users.find((user) => user.name.toLowerCase() === username.toLowerCase());
                if (!user) return interaction.editReply(":x: **User not found on the leaderboard!**");
                return interaction.editReply({ content: `:white_check_mark: **${user.name.replace(/_/g, "\_")}** is at position **#${user.slot + 1}** with **${user.lore}**` });
            } else {
                const embed = buildEmbed("leaderboard")
                    .setTitle(leaderboard.leaderboard)
                    .setDescription(topPlayersString);
                
                await interaction.editReply({ embeds: [embed] });
            }
        }
    }
}