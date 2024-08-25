import config from "../../config.js";
import colors from "colors";
import database from "../../handlers/databaseHandler.js";
import path from "path";
import { fileURLToPath } from 'url';
import { log, error } from "../../utils/logging.js";
import { client } from "../../index.js";
import { readdirSync, statSync } from "fs";
import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v10";
import { convertURLs } from "../../utils/windowsUrlConvertor.js";
import Panel from "../../tables/panel.js";
import { AttachmentBuilder, GuildTextBasedChannel } from "discord.js";
import { buildEmbed } from "../../utils/configBuilders.js";
import QuestionChannel from "../../tables/questionChannel.js";
import * as discordTranscripts from "discord-html-transcripts";
import Ticket from "../../tables/ticket.js";
import Leaderboard from "../../tables/leaderboard.js";
import { getLeaderboard } from "../../minecraft/index.js";
import { CronJob } from "cron";
import Bank from "../../tables/bank.js";

interface Command {
	name: string;
	description: string;
	type?: number;
	options: any[]; // You can replace "any" with the correct type for options
}

export default {
	name: "ready",
	description: "client ready event",
	once: false,
	function: async function () {
		log(`Logged in as ${colors.red(client.user!.tag)}`);

		const __filename = fileURLToPath(import.meta.url);
		const __dirname = path.dirname(__filename);

		const commands: Command[] = [];

		const registerDir = async (dirName: string) => {
			const COMMAND_DIR = path.resolve(__dirname, `../../${dirName}`);
			const readDir = async (dir: string) => {
				const files = readdirSync(dir);
				for await (const file of files) {
					if (statSync(`${dir}/${file}`).isDirectory()) await readDir(`${dir}/${file}`);
					else {
						const fileToImport = process.platform === "win32" ? `${convertURLs(dir)}/${file}` : `${dir}/${file}`;
						const command = (await import(fileToImport)).default;
						if (command?.name) {
							commands.push({
								name: command.name,
								type: command.type,
								description: command.description || null,
								options: command.options || null
							});
							log(`${dir}/${file} has been registered!`);
						} else {
							error(`${dir}/${file} has no name!`);
						}
					}
				}
			};
			await readDir(COMMAND_DIR);
		};

		await registerDir("slashCommands");
		await registerDir("contextMenus");

		const rest = new REST({ version: '10' }).setToken(config.token);
		rest
			.put(Routes.applicationCommands(client.user!.id), { body: commands })
			.then(() => log('Commands have been registered successfully!'))
			.catch((err) => console.log(err));

		const panels = await database.manager.find(Panel);
		for (const panel of panels) {
			const channel = await client.channels.fetch(panel.channelId).catch(() => null) as GuildTextBasedChannel;
			if (!channel) continue;
			const message = await channel.messages.fetch(panel.panelMessage).catch(() => null);
			if (!message) continue;
			const embed = buildEmbed(panel.embed);
			await message.edit({ embeds: [embed] });
		}

		setInterval(async () => {
			const channels = await database.manager.find(QuestionChannel);
			for (const channel of channels) {
				if (Date.now() - channel.createdAt > 86400000) {
					const questionChannel = await client.channels.fetch(channel.channelId).catch(() => null) as GuildTextBasedChannel;
					if (questionChannel) {
						const transcript = await discordTranscripts.createTranscript(questionChannel, {
							returnType: discordTranscripts.ExportReturnType.Buffer,
							poweredBy: false,
							limit: -1
						});

						const attachment = new AttachmentBuilder(transcript, { name: `${questionChannel.name}.html` });
						const transcriptsChannel = await client.channels.fetch(config.tickets.transcriptsChannel).catch(() => null) as GuildTextBasedChannel;

						const closedEmbed = buildEmbed("closed").addFields([
							{ name: "Ticket Name", value: questionChannel.name, inline: true },
							{ name: "Closed by", value: `<@${client.user.id}>`, inline: true },
							{ name: "Reason", value: "The ticket has been open for 24 hours.", inline: true }
						]);

						await transcriptsChannel.send({ content: `:white_check_mark: **Ticket Closed**\n**Here is the transcript for \`#${questionChannel.name}\`**\n**Reason:** The ticket has been open for 24 hours.`, embeds: [closedEmbed], files: [attachment] });

						await questionChannel.delete().catch(() => null);
						await database.manager.delete(QuestionChannel, { channelId: channel.channelId });
						await database.manager.delete(Ticket, { channel: channel.channelId });
					}
					await database.manager.delete(QuestionChannel, { channelId: channel.channelId });
				}
			}
		}, 60000);

		const checkLeaderboards = async () => {
			const leaderboards = await database.manager.find(Leaderboard);
			for (const leaderboard of leaderboards) {
				const channel = await client.channels.fetch(leaderboard.channelId).catch(() => null) as GuildTextBasedChannel;
				if (!channel) continue;
				const message = await channel.messages.fetch(leaderboard.message).catch(() => null);
				if (!message) continue;
				const leaderboardData = await getLeaderboard(leaderboard.type);
				const embed = buildEmbed("leaderboard")
					.setTitle(leaderboardData.leaderboard)
					.setDescription(leaderboardData.users.map((player) => `**${player.slot + 1}.** ${player.name.replace(/_/g, "\_")} - ${player.lore}`).join("\n"));
				await message?.edit({ embeds: [embed] }).catch(() => null);
			}
		};

		await checkLeaderboards();
		setInterval(checkLeaderboards, config.leaderboardsInterval);

		const cronJob = new CronJob("0 0 * * *", async () => {
			const bank = await database.manager.find(Bank);
			for (const account of bank.values()) {
				account.balance = account.balance + (account.balance * config.bank.interest);
				await database.manager.save(account);
			}
		});

		cronJob.start();
	},
} as any;
