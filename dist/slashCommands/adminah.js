import { ApplicationCommandOptionType } from "discord.js";
import { pagination } from "@devraelfreeze/discordjs-pagination";
import database from "../handlers/databaseHandler.js";
import AhItem from "../tables/ahitem.js";
import { buildEmbed } from "../utils/configBuilders.js";
export default {
    name: "adminah",
    description: "Manage items in the auction house sniper",
    options: [
        {
            name: "add",
            description: "Add an item to the auction house sniper",
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: "name",
                    description: "The name of the item",
                    type: ApplicationCommandOptionType.String,
                    required: true
                },
                {
                    name: "price",
                    description: "The price of the item (k, m, b)",
                    type: ApplicationCommandOptionType.String,
                    required: true
                },
                {
                    name: "stack",
                    description: "The stack of the item",
                    type: ApplicationCommandOptionType.Integer,
                    required: false,
                    min_value: 1,
                    max_value: 64
                }
            ]
        },
        {
            name: "remove",
            description: "Remove an item from the auction house sniper",
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: "name",
                    description: "The name of the item",
                    type: ApplicationCommandOptionType.String,
                    required: true
                }
            ]
        },
        {
            name: "list",
            description: "List all items in the auction house sniper",
            type: ApplicationCommandOptionType.Subcommand
        }
    ],
    permissions: ["Administrator"],
    function: async function ({ interaction }) {
        const subcommand = interaction.options.getSubcommand();
        if (subcommand === "add") {
            const name = interaction.options.getString("name").toLowerCase();
            const price = interaction.options.getString("price").toLowerCase();
            let priceNumber = parseInt(price);
            if (price.endsWith("k")) {
                priceNumber *= 1000;
            }
            else if (price.endsWith("m")) {
                priceNumber *= 1000000;
            }
            else if (price.endsWith("b")) {
                priceNumber *= 1000000000;
            }
            const alreadyExists = await database.manager.findOne(AhItem, { where: { name } });
            if (alreadyExists)
                return await interaction.reply({ content: `:x: **This item already exists with the price: $${alreadyExists.price.toLocaleString()}.**`, ephemeral: true });
            await database.manager.insert(AhItem, { name, price: priceNumber, stack: interaction.options.getInteger("stack") || 1 });
            await interaction.reply({ content: `:white_check_mark: **Successfully added the item to the auction house sniper.**`, ephemeral: true });
        }
        else if (subcommand === "remove") {
            const name = interaction.options.getString("name").toLowerCase();
            const item = await database.manager.findOne(AhItem, { where: { name } });
            if (!item)
                return await interaction.reply({ content: `:x: **This item doesn't exist in the auction house sniper.**`, ephemeral: true });
            await database.manager.delete(AhItem, { name });
            await interaction.reply({ content: `:white_check_mark: **Successfully removed the item from the auction house sniper.**`, ephemeral: true });
        }
        else if (subcommand === "list") {
            const items = await database.manager.find(AhItem);
            if (!items.length)
                return await interaction.reply({ content: `:x: **There are no items in the auction house sniper.**`, ephemeral: true });
            const chunk = 5;
            const embeds = [];
            for (let i = 0; i < items.length; i += chunk) {
                const current = items.slice(i, i + chunk);
                const description = current.map(item => `**${item.name}** - $${item.price.toLocaleString()}`).join("\n");
                const embed = buildEmbed("ahItems").setDescription(description);
                embeds.push(embed);
            }
            await pagination({
                interaction,
                embeds,
                author: interaction.user,
                ephemeral: true,
                fastSkip: true,
                pageTravel: true
            });
        }
    }
};
