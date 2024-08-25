import { ApplicationCommandOptionType } from "discord.js";
import database from "../handlers/databaseHandler.js";
import Link from "../tables/link.js";
import DepositRequest from "../tables/depositRequest.js";
import { buildEmbed } from "../utils/configBuilders.js";
import { bot } from "../minecraft/index.js";
import config from "../config.js";
import Ticket from "../tables/ticket.js";
import Bank from "../tables/bank.js";
export default {
    name: "bank",
    description: "Manage your bank",
    options: [
        {
            name: "deposit",
            description: "Deposit money to your bank",
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: "amount",
                    description: "The amount of money to deposit",
                    type: ApplicationCommandOptionType.Integer,
                    required: true,
                    min_value: 5000
                },
                {
                    name: "type",
                    description: "The type of money to deposit",
                    type: ApplicationCommandOptionType.String,
                    required: true,
                    choices: [
                        {
                            name: "Money",
                            value: "money"
                        },
                        {
                            name: "Physical",
                            value: "physical"
                        }
                    ]
                }
            ]
        },
        {
            name: "withdraw",
            description: "Withdraw money from your bank",
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: "amount",
                    description: "The amount of money to withdraw",
                    type: ApplicationCommandOptionType.Integer,
                    required: true,
                    min_value: 10000
                },
                {
                    name: "type",
                    description: "The type of money to deposit",
                    type: ApplicationCommandOptionType.String,
                    required: true,
                    choices: [
                        {
                            name: "Money",
                            value: "money"
                        },
                        {
                            name: "Physical",
                            value: "physical"
                        }
                    ]
                }
            ]
        },
        {
            name: "balance",
            description: "Check your bank balance",
            type: ApplicationCommandOptionType.Subcommand
        }
    ],
    permissions: [],
    function: async function ({ interaction }) {
        if (!interaction.inCachedGuild())
            return;
        const subcommand = interaction.options.getSubcommand();
        const linked = await database.manager.findOne(Link, { where: { discordId: interaction.user.id } });
        if (!linked)
            return interaction.reply({ content: ":x: **You are not linked to any account!**", ephemeral: true });
        if (subcommand == "deposit") {
            const amount = interaction.options.getInteger("amount");
            const type = interaction.options.getString("type");
            if (type == "money") {
                await database.manager.delete(DepositRequest, { discordId: interaction.user.id });
                await database.manager.insert(DepositRequest, {
                    discordId: interaction.user.id,
                    ign: linked.ign,
                    amount
                });
                const embed = buildEmbed("deposit")
                    .setDescription(`**Please send $${amount.toLocaleString()} to the bot in game.**\n\n**Command: \`/pay ${bot.username} ${amount}\`**`);
                await interaction.reply({ embeds: [embed], ephemeral: true });
            }
            else if (type == "physical") {
                const requiredRole = interaction.guild.roles.cache.get(config.bank.physicalRole);
                if (!requiredRole)
                    return interaction.reply({ content: ":x: **The physical role is not set up!**", ephemeral: true });
                if (requiredRole.position > interaction.member.roles.highest.position)
                    return interaction.reply({ content: ":x: **You do not have the required role to deposit physical money!**", ephemeral: true });
                await interaction.deferReply({ ephemeral: true });
                const channel = await interaction.guild.channels.create({
                    name: `${interaction.user.username}-deposit`,
                    parent: config.bank.ticketsCategory,
                    permissionOverwrites: [
                        {
                            id: interaction.guild.id,
                            deny: ["ViewChannel"]
                        },
                        {
                            id: interaction.user.id,
                            allow: ["ViewChannel"]
                        },
                        ...config.bank.staffRoles.map(role => {
                            return {
                                id: role,
                                allow: ["ViewChannel"]
                            };
                        })
                    ]
                });
                const embed = buildEmbed("physicalDeposit")
                    .setDescription(`**Thank you for opening a ticket! A staff member will be with you shortly.**\n\n**Please provide what you would like to deposit.**`);
                const msg = await channel.send({ content: `<@${interaction.user.id}>`, embeds: [embed] });
                await database.manager.insert(Ticket, {
                    date: Date.now(),
                    channel: channel.id,
                    startingMessage: msg.id,
                    user: interaction.user.id,
                    state: "open",
                    added: "[]"
                });
                await interaction.editReply({ content: `:white_check_mark: **Your ticket has been submitted.** <#${channel.id}>` });
            }
        }
        else if (subcommand == "withdraw") {
            const amount = interaction.options.getInteger("amount");
            const type = interaction.options.getString("type");
            if (type == "money") {
                const bank = await database.manager.findOne(Bank, { where: { discordId: linked.discordId } });
                const balance = bank?.balance || 0;
                if (balance < amount)
                    return interaction.reply({ content: ":x: **You do not have enough money in your account!**", ephemeral: true });
                bot.chat(`/pay ${linked.ign} ${amount}`);
                await interaction.reply({ content: `:white_check_mark: **Successfully withdrew $${amount.toLocaleString()} from your bank.**`, ephemeral: true });
            }
            else if (type == "physical") {
                const requiredRole = interaction.guild.roles.cache.get(config.bank.physicalRole);
                if (!requiredRole)
                    return interaction.reply({ content: ":x: **The physical role is not set up!**", ephemeral: true });
                if (requiredRole.position > interaction.member.roles.highest.position)
                    return interaction.reply({ content: ":x: **You do not have the required role to withdraw physical money!**", ephemeral: true });
                await interaction.deferReply({ ephemeral: true });
                const channel = await interaction.guild.channels.create({
                    name: `${interaction.user.username}-withdraw`,
                    parent: config.bank.ticketsCategory,
                    permissionOverwrites: [
                        {
                            id: interaction.guild.id,
                            deny: ["ViewChannel"]
                        },
                        {
                            id: interaction.user.id,
                            allow: ["ViewChannel"]
                        },
                        ...config.bank.staffRoles.map(role => {
                            return {
                                id: role,
                                allow: ["ViewChannel"]
                            };
                        })
                    ]
                });
                const embed = buildEmbed("physicalWithdraw")
                    .setDescription(`**Thank you for opening a ticket! A staff member will be with you shortly.**\n\n**Please provide what you would like to withdraw.**`);
                const msg = await channel.send({ content: `<@${interaction.user.id}>`, embeds: [embed] });
                await database.manager.insert(Ticket, {
                    date: Date.now(),
                    channel: channel.id,
                    startingMessage: msg.id,
                    user: interaction.user.id,
                    state: "open",
                    added: "[]"
                });
                await interaction.editReply({ content: `:white_check_mark: **Your ticket has been submitted.** <#${channel.id}>` });
            }
        }
        else if (subcommand == "balance") {
            const bank = await database.manager.findOne(Bank, { where: { discordId: linked.discordId } });
            const balance = bank?.balance || 0;
            const embed = buildEmbed("bankBalance")
                .setDescription(`**Your bank balance is $${balance.toLocaleString()}.**`);
            await interaction.reply({ embeds: [embed], ephemeral: true });
        }
    }
};
