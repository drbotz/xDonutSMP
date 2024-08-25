import mineflayer from "mineflayer";
import database from "../handlers/databaseHandler.js";
import config from "../config.js";
import colors from "colors";
import { error, log } from "../utils/logging.js";
import { client } from "../index.js";
import Link from "../tables/link.js";
import cron, { CronJob } from "cron";
import AhItem from "../tables/ahitem.js";
import { buildEmbed } from "../utils/configBuilders.js";
import DepositRequest from "../tables/depositRequest.js";
import Bank from "../tables/bank.js";
import WeeklyFee from "../tables/weeklyfee.js";
export let bot;
let messages = [];
let busy = false;
export async function setBusy(state) {
    busy = state;
}
const formatItems = (items) => {
    return items.map(item => {
        return {
            name: JSON.parse(item.customName).extra[0].text,
            lore: item.customLore.map((line) => JSON.parse(line).extra?.map((line) => line.text) || JSON.parse(line)?.text || "").flat(),
            slot: item.slot,
            stack: item.count
        };
    });
};
export async function minecraft() {
    bot = mineflayer.createBot(config.minecraft);
    bot.on("message", async (message) => {
        if (config.logMCChat)
            console.log(`${colors.green("[Minecraft]")} ${message.toAnsi()}`);
        const rejectionRegexShards = new RegExp("User does not exist.");
        const rejectionRegexBal = new RegExp("That player does not exist.");
        const balRegex = /\w+ currently has \$(?<balance>[\w\.M]+)/gm;
        const balMatch = balRegex.exec(message.toString());
        const paidRegex = /^(?<username>[^:]+) paid you \$(?<amount>\d+(\.\d+)?)?(?<suffix>[A-Z]?)?\.$/g;
        const paidMatch = paidRegex.exec(message.toString());
        if (balMatch?.length) {
            bot.emit("bal", balMatch.groups.balance);
        }
        if (message.toString().match(rejectionRegexShards)) {
            bot.emit("shards", "ENOENT");
        }
        if (message.toString().match(rejectionRegexBal)) {
            bot.emit("bal", "ENOENT");
        }
        if (paidMatch?.length) {
            let amount = parseInt(paidMatch.groups.amount);
            if (paidMatch.groups.suffix.toLowerCase() == "k")
                amount *= 1000;
            if (paidMatch.groups.suffix.toLowerCase() == "m")
                amount *= 1000000;
            if (paidMatch.groups.suffix.toLowerCase() == "b")
                amount *= 1000000000;
            bot.emit("paid", paidMatch.groups.username, amount, paidMatch.groups.suffix);
        }
        const shardsRegex = /\w+'\w+ shards: (?<shards>[\w\.M]+)/gm;
        const shardsMatch = shardsRegex.exec(message.toString());
        if (shardsMatch?.length) {
            bot.emit("shards", shardsMatch.groups.shards);
        }
        const notOnlineMatch = message.toString().match(/This user is not online./gm);
        if (notOnlineMatch?.length) {
            bot.emit("online", false);
        }
        const codeRegex = new RegExp(/(?<username>\.?\w+) -> YOU: (?<code>[0-9]+\-[0-9]+)/gm);
        const codeMatch = codeRegex.exec(message.toString());
        if (codeMatch?.length) {
            const username = codeMatch.groups.username;
            const code = codeMatch.groups.code;
            const codeData = client.linkCodes.get(code);
            if (!codeData)
                return;
            if (codeData.ign.toLowerCase() != username.toLowerCase())
                return;
            if (codeData.expires < Date.now())
                return bot.chat(`/w ${username} Your code has expired!`);
            bot.chat(`/w ${username} Your account has been linked to @${codeData.discordUsername}!`);
            const alreadyLinked = await database.manager.findOne(Link, { where: { discordId: codeData.user } });
            if (alreadyLinked)
                await database.manager.remove(Link, alreadyLinked);
            await database.manager.insert(Link, { ign: codeData.ign, discordId: codeData.user });
            const guild = client.guilds.cache.get(codeData.guild);
            const member = guild?.members.cache.get(codeData.user);
            await member?.setNickname(`${member.displayName} [${codeData.ign}]`).catch(() => null);
            await member?.roles.add(config.linkedRole);
            const stats = await getStats(codeData.ign);
            const moneyMade = stats.find(stat => stat.stat == "money made")?.value || "0";
            let parsedAmount = parseInt(moneyMade.replace(/[^0-9]/g, ""));
            if (moneyMade.endsWith("K"))
                parsedAmount *= 1000;
            if (moneyMade.endsWith("M"))
                parsedAmount *= 1000000;
            if (moneyMade.endsWith("B"))
                parsedAmount *= 1000000000;
            const wealthRole = config.linkedRoles.filter(role => parsedAmount >= role.amount).sort((a, b) => b.amount - a.amount)[0];
            if (wealthRole) {
                const role = guild?.roles.cache.get(wealthRole.role);
                await member?.roles.add(role);
            }
        }
        const chatRegex = /^(?<username>[^:]+):\s+(?<text>.*)$/gm;
        const chatMatch = chatRegex.exec(message.toString());
        if (!codeMatch?.length && chatMatch?.length) {
            let username = chatMatch.groups.username;
            const text = chatMatch.groups.text.replace(/@/g, "@\u200B");
            config.discordSRV.chatRoles.forEach(role => {
                username = username.replace(role.symbol, `<@&${role.role}>`);
            });
            messages.push({ username, text });
        }
        if (!balMatch?.length && !paidMatch?.length && !rejectionRegexShards.test(message.toString()) && !rejectionRegexBal.test(message.toString()) && !chatMatch?.length) {
            bot.emit("commandResponse", message.toString());
        }
    });
    bot.on("windowOpen", (window) => {
        if (window.title.includes("ѕᴛᴀᴛѕ")) {
            const items = window.containerItems().map(item => {
                return {
                    name: item.displayName,
                    description: `${JSON.parse(item.customLore[0]).extra[0].text}${JSON.parse(item.customLore[0]).extra[1].text}`
                };
            });
            const stats = items.map(item => {
                return {
                    stat: item.description.split(": ")[0].toLowerCase(),
                    value: item.description.split(": ")[1]
                };
            });
            for (const stat of stats) {
                bot.emit(stat.stat, stat.value);
            }
            bot.emit("stats", stats);
        }
        if (window.title.includes("ᴄᴏɴꜰɪʀᴍ ʀᴇǫᴜᴇѕᴛ")) {
            const items = window.containerItems().map(item => {
                return {
                    name: item.displayName,
                    customName: JSON.parse(item.customName).extra[0].text,
                    desription: JSON.parse(item.customLore[0]).extra.map((line) => line.text).join("\n")
                };
            });
            bot.emit("online", true, items.find(item => item.customName == "ʟᴏᴄᴀᴛɪᴏɴ").desription);
        }
        const leaderboardTitles = {
            "ᴍᴏɴᴇʏ ʟᴇᴀᴅᴇʀʙᴏᴀʀᴅ": "ʀɪᴄʜᴇѕᴛ ᴘʟᴀʏᴇʀѕ",
            "sʜᴀʀᴅs ʟᴇᴀᴅᴇʀʙᴏᴀʀᴅ": "ᴛᴏᴘ ᴀꜰᴋᴄᴏɪɴѕ",
            "ᴅᴇᴀᴛʜs ʟᴇᴀᴅᴇʀʙᴏᴀʀᴅ": "ᴛᴏᴘ ᴅᴇᴀᴛʜѕ",
            "ᴘʟᴀʏᴛɪᴍᴇ ʟᴇᴀᴅᴇʀʙᴏᴀʀᴅ": "ᴛᴏᴘ ᴘʟᴀʏᴛɪᴍᴇ",
            "ʙʟᴏᴄᴋs ʙʀᴏᴋᴇɴ ʟᴇᴀᴅᴇʀʙᴏᴀʀᴅ": "ᴛᴏᴘ ʙʟᴏᴄᴋѕ ʙʀᴏᴋᴇɴ",
            "ʙʟᴏᴄᴋs ᴘʟᴀᴄᴇᴅ ʟᴇᴀᴅᴇʀʙᴏᴀʀᴅ": "ᴛᴏᴘ ʙʟᴏᴄᴋѕ ᴘʟᴀᴄᴇᴅ",
            "ᴍᴏʙs ᴋɪʟʟᴇᴅ ʟᴇᴀᴅᴇʀʙᴏᴀʀᴅ": "ᴛᴏᴘ ᴍᴏʙѕ ᴋɪʟʟᴇᴅ",
            "ᴍᴏɴᴇʏ sᴘᴇɴᴛ ᴏɴ sʜᴏᴘ ʟᴇᴀᴅᴇʀʙᴏᴀʀᴅ": "ᴛᴏᴘ ѕᴘᴇɴᴛ ᴏɴ ѕʜᴏᴘ",
            "ᴍᴏɴᴇʏ ᴍᴀᴅᴇ ᴏɴ /sᴇʟʟ ʟᴇᴀᴅᴇʀʙᴏᴀʀᴅ": "ᴛᴏᴘ /ѕᴇʟʟ"
        };
        for (const [key, value] of Object.entries(leaderboardTitles)) {
            if (window.title.includes(value)) {
                const items = window.containerItems().filter(i => i.slot <= 44).map(item => {
                    return {
                        name: JSON.parse(item.customName).extra[0].text,
                        lore: JSON.parse(item.customLore[0]).extra[1].text,
                        slot: item.slot
                    };
                });
                bot.emit("leaderboard", key, items);
            }
        }
    });
    bot.once("login", async () => {
        log(`Logged in Minecraft as ${colors.red(bot.username)}!`);
        setInterval(() => {
            if (messages.length) {
                client.channels.cache.get(config.discordSRV.channel)?.send(messages.map(message => `**${message.username}**: ${message.text}`).join("\n"));
                messages = [];
            }
        }, 5000);
        for await (const command of config.joinCommands) {
            await new Promise((resolve) => setTimeout(resolve, 1250));
            bot.chat(command);
        }
        const takeFeeJob = new CronJob("0 0 0 * * 0", async () => {
            const banks = await database.manager.find(Bank);
            if (!banks.length)
                return;
            const fees = await database.manager.find(WeeklyFee);
            if (!fees.length)
                return;
            for await (const fee of fees) {
                const bank = banks.find(bank => bank.discordId == fee.discordId);
                if (!bank || bank.balance < fee.amount) {
                    const channel = client.channels.cache.get(config.bank.logsChannel);
                    channel.send({ content: `:x: **Failed to take fee from ${fee.discordId}.**\n**The user does not have enough balance to pay the fee for the physical items.**\n${config.bank.staffRoles.map(r => `<@&${r}>`)}` });
                    return;
                }
                bank.balance -= fee.amount;
                await database.manager.save(bank);
                const channel = client.channels.cache.get(config.bank.logsChannel);
                channel.send({ content: `:white_check_mark: **Successfully took $${fee.amount.toLocaleString()} from <@${fee.discordId}>.**` });
            }
        });
        takeFeeJob.start();
        setInterval(async () => {
            if (busy)
                return;
            const items = await database.manager.find(AhItem);
            if (!items.length)
                return;
            for await (const item of items) {
                await checkAh(item.name, item.stack);
                await new Promise((resolve) => setTimeout(resolve, 1000));
            }
        }, config.adminahInterval);
    });
    bot.on("windowOpen", async (window) => {
        if (!window.title.includes("ᴄᴏɴꜰɪʀᴍ ᴘᴜʀᴄʜᴀѕᴇ"))
            return;
        const items = formatItems(window.containerItems());
        const confirmButton = items.find(item => item.name.includes("ᴄᴏɴꜰɪʀᴍ"));
        const itemPurchasing = items.find(item => item.slot == 13);
        bot.clickWindow(confirmButton.slot, 0, 0);
        const embed = buildEmbed("ahSnipe");
        const isBroke = await broke();
        if (isBroke) {
            embed.setFields([
                { name: "Failed to Purchase", value: itemPurchasing.name, inline: true },
                { name: "Lore", value: itemPurchasing.lore.join("\n"), inline: true },
                { name: "Status", value: "Not enough money.", inline: true }
            ]);
        }
        else {
            embed.setFields([
                { name: "Purchased", value: itemPurchasing.name, inline: true },
                { name: "Lore", value: itemPurchasing.lore.join("\n"), inline: true },
                { name: "Status", value: "Successfully purchased.", inline: true }
            ]);
        }
        const channel = client.channels.cache.get(config.channels.ahSnipes);
        channel.send({ embeds: [embed] });
    });
    bot.on("paid", async (username, amount, suffix) => {
        const depositRequest = await database.manager.findOne(DepositRequest, { where: { ign: username } });
        if (!depositRequest) {
            error("No deposit request found");
            bot.chat(`/pay ${username} ${amount}`);
            return;
        }
        if (depositRequest.amount != amount) {
            error("Amounts don't match");
            if (depositRequest.amount < amount) {
                bot.chat(`/pay ${username} ${amount - depositRequest.amount}`);
            }
            else {
                bot.chat(`/pay ${username} ${amount}`);
                return;
            }
        }
        const linked = await database.manager.findOne(Link, { where: { ign: username } });
        if (!linked) {
            error("No linked account found");
            bot.chat(`/pay ${username} ${amount}`);
            return;
        }
        const bank = await database.manager.findOne(Bank, { where: { discordId: linked.discordId } });
        if (!bank) {
            await database.manager.insert(Bank, { discordId: linked.discordId, balance: amount });
        }
        else {
            bank.balance += amount;
            await database.manager.update(Bank, { discordId: linked.discordId }, { balance: bank.balance + amount });
        }
        await database.manager.remove(depositRequest);
        const embed = buildEmbed("depositSuccess")
            .setDescription(`**Successfully deposited $${amount.toLocaleString()} to your bank.**`);
        const user = client.users.cache.get(linked.discordId);
        await user?.send({ embeds: [embed] }).catch(() => null);
    });
    bot.on("kicked", async (reason) => {
        log(`Kicked from Minecraft: ${colors.red(reason)}`);
        await new Promise((resolve) => setTimeout(resolve, 10000));
        return minecraft();
    });
    bot.on("error", async (error) => {
        log(`An error occurred in Minecraft: ${colors.red(error.toString())}`);
        await new Promise((resolve) => setTimeout(resolve, 10000));
        return minecraft();
    });
    const restartJob = new cron.CronJob("0 0 0 * * *", async () => {
        await restartBot();
    });
    restartJob.start();
}
export async function getBal(ign) {
    busy = true;
    return new Promise((resolve, reject) => {
        bot.chat(`/bal ${ign}`);
        bot.once("bal", (message) => {
            busy = false;
            if (message == "Player not found")
                reject("Player not found");
            resolve(message);
        });
        setTimeout(() => {
            busy = false;
            reject("Timeout");
        }, 5000);
    });
}
export async function getShards(ign) {
    busy = true;
    return new Promise((resolve, reject) => {
        bot.chat(`/shards ${ign}`);
        bot.once("shards", (message) => {
            busy = false;
            resolve(message);
        });
        setTimeout(() => {
            busy = false;
            reject("Timeout");
        }, 5000);
    });
}
export async function getKills(ign) {
    busy = true;
    return new Promise((resolve, reject) => {
        bot.chat(`/stats ${ign}`);
        bot.once("kills", (message) => {
            busy = false;
            resolve(message);
        });
        setTimeout(() => {
            busy = false;
            reject("Timeout");
        }, 5000);
    });
}
export async function getDeaths(ign) {
    busy = true;
    return new Promise((resolve, reject) => {
        bot.chat(`/stats ${ign}`);
        bot.once("deaths", (message) => {
            busy = false;
            resolve(message);
        });
        setTimeout(() => {
            busy = false;
            reject("Timeout");
        }, 5000);
    });
}
export async function getPlaytime(ign) {
    busy = true;
    return new Promise((resolve, reject) => {
        bot.chat(`/stats ${ign}`);
        bot.once("playtime", (message) => {
            busy = false;
            resolve(message);
        });
        setTimeout(() => {
            busy = false;
            reject("Timeout");
        }, 5000);
    });
}
export async function isOnline(ign) {
    busy = true;
    return new Promise((resolve, reject) => {
        bot.chat(`/tpa ${ign}`);
        bot.once("online", (status, location) => {
            busy = false;
            resolve({ status, location });
        });
        setTimeout(() => {
            busy = false;
            reject("Timeout");
        }, 5000);
    });
}
export async function getStats(ign) {
    busy = true;
    return new Promise((resolve, reject) => {
        bot.chat(`/stats ${ign}`);
        bot.once("stats", (message) => {
            busy = false;
            resolve(message);
        });
        setTimeout(() => {
            busy = false;
            reject("Timeout");
        }, 5000);
    });
}
export async function getLeaderboard(leaderboard) {
    busy = true;
    return new Promise((resolve, reject) => {
        bot.chat(`/leaderboards`);
        bot.once("windowOpen", (window) => {
            if (!window.title.includes("ʟᴇᴀᴅᴇʀʙᴏᴀʀᴅѕ")) {
                getLeaderboard(leaderboard);
                return;
            }
            const items = window.containerItems().map(item => {
                return {
                    name: item.customName,
                    slot: item.slot
                };
            });
            const leaderboardItem = items.find(item => item.name.includes(leaderboard));
            if (leaderboardItem)
                bot.clickWindow(leaderboardItem.slot, 0, 0);
        });
        bot.once("leaderboard", (leaderboard, users) => {
            busy = false;
            resolve({ leaderboard, users });
            setTimeout(() => {
                busy = false;
                reject("Timeout");
            }, 5000);
        });
    });
}
export async function restartBot() {
    bot.quit();
    await new Promise((resolve) => setTimeout(resolve, 10000));
    return minecraft();
}
export async function executeCommand(cmd) {
    bot.chat(cmd);
    return new Promise((resolve, reject) => {
        bot.once("commandResponse", (message) => {
            resolve(message);
        });
        setTimeout(() => reject("Timeout"), 1000);
    });
}
async function broke() {
    return new Promise((resolve, reject) => {
        setTimeout(() => reject(false), 1000);
        bot.once("message", (message) => {
            if (message.toString().includes("You don't have enough money for this."))
                return resolve(true);
        });
    });
}
export async function checkAh(itemName, stack = 1) {
    bot.chat(`/ah ${itemName}`);
    const sortEnum = {
        lowPrice: 0,
        highPrice: 1,
        recentlyListed: 2,
        lastListed: 3
    };
    bot.once("windowOpen", async (window) => {
        if (!window.title.includes("ᴀᴜᴄᴛɪᴏɴ")) {
            checkAh(itemName);
            return;
        }
        const items = formatItems(window.containerItems());
        const sortItem = items.find(item => item.name.includes("ѕᴏʀᴛ"));
        if (!sortItem)
            return;
        const setSort = (sort) => {
            // the item remembers the last sort you had, so we gotta check how many more clicks are needed to get to the desired sort, if any
            const clicksRequired = sort - parseInt(sortItem.name.split(" ")[1]);
            if (clicksRequired > 0) {
                for (let i = 0; i < clicksRequired; i++) {
                    bot.clickWindow(sortItem.slot, 0, 0);
                }
            }
        };
        setSort(sortEnum.lowPrice);
        const newItems = formatItems(window.containerItems());
        const requiredItems = newItems.filter(item => item.name.toLowerCase().includes(itemName.toLowerCase()) && item.stack >= stack);
        if (!requiredItems.length)
            return;
        const lowestPrice = requiredItems[0];
        let price = parseInt(lowestPrice.lore[1].replace(/[^0-9]/g, ""));
        if (lowestPrice.lore[1].endsWith("k"))
            price *= 1000;
        if (lowestPrice.lore[1].endsWith("m"))
            price *= 1000000;
        if (lowestPrice.lore[1].endsWith("b"))
            price *= 1000000000;
        bot.clickWindow(lowestPrice.slot, 0, 0);
    });
}
