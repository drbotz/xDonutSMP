export default {
    token: "u thought",
    prefix: "-",
    debugMode: true,
    resetDatabase: false,
    syncDatabase: false,
    database: {
        type: "mysql",
        host: "localhost",
        port: 3306,
        username: "root",
        password: "123",
        database: "xScam"
    },
    minecraft: {
        username: "mc3@drbotz.net",
        password: null,
        auth: "microsoft",
        version: "1.20",
        debug: false,
        host: "donutsmp.net"
    },
    logMCChat: true,
    discordSRV: {
        channel: "1117175132297891900",
        chatRoles: [
            {
                symbol: "+",
                role: "1214396814317322291"
            },
            {
                symbol: "📽",
                role: "1214396890054000660"
            },
            {
                symbol: "★",
                role: "1214396951123202089"
            }
        ]
    },
    joinCommands: ["/afk 2"],
    leaderboardsInterval: 30000,
    adminahInterval: 10000,
    linkedRole: "1204583530055598141",
    joinRoles: ["1192280726289264640"],
    scammerRole: "1192279394979426456",
    adminahRole: "1192278744732274789",
    linkedRoles: [
        {
            amount: 250000,
            role: "1192559258563248138"
        },
	{
            amount: 1000000,
            role: "1192559437945258054"
        },
	{
            amount: 10000000,
            role: "1192559563916980224"
        },
	{
            amount: 500000000,
            role: "1192278906628231209"
        },
	{
            amount: 2500000000,
            role: "1204905537016172644"
        }
    ],
    tickets: {
        category: "1192630115960623124",
        transcriptsChannel: "1192959996724510720",
        pingRole: "1192278872717271120",
        staffRoles: ["1192278744732274789"],
        dmTranscripts: true
    },
    tickets: {
        category: "1192630181790220398",
        transcriptsChannel: "1192959996724510720",
        pingRole: "1192278744732274789",
        staffRoles: ["1192278744732274789"],
        dmTranscripts: true
    },
    channels: {
        reports: "1192286200569024512",
        quickSearch: "1192286830440222751",
        logs: "1215834789404479659",
        ahSnipes: "1215834638954659940"
    },
    bank: {
        logsChannel: "1215834597682843821",
        ticketsCategory: "1192630181790220398",
        physicalRole: "1192559563916980224",
        interest: 0.03,
        staffRoles: ["901897854233239562"]
    },
    reportQuestions: ["Reporter's IGN", "Scammer's IGN", "Scammer's Discord ID (type N/A if no answer)", "Scam description", "Proof"],
    embeds: {
        report: {
            title: "Scam Report",
            description: "Please click on the button below to report a scammer",
            color: "#ff0000",
            thumbnail: null,
            image: null,
            footer: {
                text: "Report",
                iconURL: null
            },
            author: {
                name: null,
                iconURL: null
            },
            timestamp: true
        },
        ticketReport: {
            title: "Scam Report",
            description: "The following is a thorough breakdown of a scam conducted by **{scammerIGN}**\nRemember to always search <#> for a player's https://namemc.com/ UUID before you conduct a trade!\n\nReported by: {reporter}\nReporter's IGN: **{reporterIGN}**\nScammer's Current IGN: **{scammerIGN}**\nScammer's UUID: **{scammerUUID}**\nScammer's Discord: **{scammerDiscord}**\n\nScam Description:\n**{scamDescription}**\n\nScam Proof:\n**{scamProof}**",
            color: "#ff0000",
            thumbnail: null,
            image: null,
            footer: {
                text: "Report",
                iconURL: null
            },
            author: {
                name: null,
                iconURL: null
            },
            timestamp: true
        },
        reportPublished: {
            title: "Scam Report",
            description: "The following is a thorough breakdown of a scam conducted by **{scammerIGN}**\nRemember to always search <#> for a player's https://namemc.com/ UUID before you conduct a trade!\n\nReport ID: {id}\nReported by: {reporter}\nReporter's IGN: **{reporterIGN}**\nScammer's Current IGN: **{scammerIGN}**\nScammer's UUID: **{scammerUUID}**\nScammer's Discord: **{scammerDiscord}**\n\nScam Description:\n**{scamDescription}**\n\nScam Proof:\n**{scamProof}**",
            color: "#ff0000",
            thumbnail: null,
            image: null,
            footer: {
                text: "Report",
                iconURL: null
            },
            author: {
                name: null,
                iconURL: null
            },
            timestamp: true
        },
        closed: {
            title: "Ticket Closed",
            description: "This ticket has been closed",
            color: "#ff0000",
            thumbnail: null,
            image: null,
            footer: {
                text: "Ticket",
                iconURL: null
            },
            author: {
                name: null,
                iconURL: null
            },
            timestamp: true
        },
        scammer: {
            title: "⚠️ Scammer",
            description: "{scammerIGN} ({scammerUUID}) is a scammer!\n{scams}",
            color: "#ff0000",
            thumbnail: null,
            image: null,
            footer: {
                text: "Scammer",
                iconURL: null
            },
            author: {
                name: null,
                iconURL: null
            },
            timestamp: true
        },
        questioning: {
            title: "Questioning",
            description: "Please answer the following questions to the best of your ability. If you don't have an answer, type \"N/A\".",
            color: "#ff0000",
            thumbnail: null,
            image: null,
            footer: {
                text: "Questioning",
                iconURL: null
            },
            author: {
                name: null,
                iconURL: null
            },
            timestamp: true
        },
        balance: {
            title: "Balance",
            description: ":white_check_mark: **{user}'s balance is `{balance}`**",
            color: "#ff0000",
            thumbnail: null,
            image: null,
            footer: {
                text: "Balance",
                iconURL: null
            },
            author: {
                name: null,
                iconURL: null
            },
            timestamp: true
        },
        deaths: {
            title: "Deaths",
            description: ":white_check_mark: **{user} has `{deaths}` deaths**",
            color: "#ff0000",
            thumbnail: null,
            image: null,
            footer: {
                text: "Deaths",
                iconURL: null
            },
            author: {
                name: null,
                iconURL: null
            },
            timestamp: true
        },
        kills: {
            title: "Kills",
            description: ":white_check_mark: **{user} has `{kills}` kills**",
            color: "#ff0000",
            thumbnail: null,
            image: null,
            footer: {
                text: "Kills",
                iconURL: null
            },
            author: {
                name: null,
                iconURL: null
            },
            timestamp: true
        },
        link: {
            title: "Link",
            description: "**To link your account to the bot, type `/w {botName} {code}` in the MC server's chat. Your code is `{code}`.**\n**Expires in 5 minutes!**",
            color: "#ff0000",
            thumbnail: null,
            image: null,
            footer: {
                text: "Link",
                iconURL: null
            },
            author: {
                name: null,
                iconURL: null
            },
            timestamp: true
        },
        online: {
            title: "Online",
            description: "{emoji} **{user} is `{status}`**",
            color: "#ff0000",
            thumbnail: null,
            image: null,
            footer: {
                text: "Online",
                iconURL: null
            },
            author: {
                name: null,
                iconURL: null
            },
            timestamp: true
        },
        playtime: {
            title: "Playtime",
            description: ":white_check_mark: **{user} has `{playtime}` playtime**",
            color: "#ff0000",
            thumbnail: null,
            image: null,
            footer: {
                text: "Playtime",
                iconURL: null
            },
            author: {
                name: null,
                iconURL: null
            },
            timestamp: true
        },
        shards: {
            title: "Shards",
            description: ":white_check_mark: **{user} has `{shards}` shards**",
            color: "#ff0000",
            thumbnail: null,
            image: null,
            footer: {
                text: "Shards",
                iconURL: null
            },
            author: {
                name: null,
                iconURL: null
            },
            timestamp: true
        },
        stats: {
            title: "Stats",
            description: ":white_check_mark: **Status for `{user}`:**\n\n{stats}",
            color: "#ff0000",
            thumbnail: null,
            image: null,
            footer: {
                text: "Stats",
                iconURL: null
            },
            author: {
                name: null,
                iconURL: null
            },
            timestamp: true
        },
        logs: {
            title: "Logs",
            color: "#ff0000",
            thumbnail: null,
            image: null,
            footer: {
                text: "Logs",
                iconURL: null
            },
            author: {
                name: null,
                iconURL: null
            },
            timestamp: true
        },
        leaderboard: {
            title: "Leaderboard",
            color: "#ff0000",
            thumbnail: null,
            image: null,
            footer: {
                text: "Leaderboard",
                iconURL: null
            },
            author: {
                name: null,
                iconURL: null
            },
            timestamp: true
        },
        ahItems: {
            title: "Auction House Items",
            color: "#ff0000",
            thumbnail: null,
            image: null,
            footer: {
                text: "Auction House",
                iconURL: null
            },
            author: {
                name: null,
                iconURL: null
            },
            timestamp: true
        },
        ahSnipe: {
            title: "Auction House Sniper",
            color: "#ff0000",
            thumbnail: null,
            image: null,
            footer: {
                text: "Auction House",
                iconURL: null
            },
            author: {
                name: null,
                iconURL: null
            },
            timestamp: true
        },
        bankDeposit: {
            title: "Bank Deposit",
            color: "#ff0000",
            thumbnail: null,
            image: null,
            footer: {
                text: "Bank",
                iconURL: null
            },
            author: {
                name: null,
                iconURL: null
            },
            timestamp: true
        },
        physicalDeposit: {
            title: "Physical Deposit",
            color: "#ff0000",
            thumbnail: null,
            image: null,
            footer: {
                text: "Bank",
                iconURL: null
            },
            author: {
                name: null,
                iconURL: null
            },
            timestamp: true
        },
        deposit: {
            title: "Deposit",
            color: "#ff0000",
            thumbnail: null,
            image: null,
            footer: {
                text: "Bank",
                iconURL: null
            },
            author: {
                name: null,
                iconURL: null
            },
            timestamp: true
        },
        depositSuccess: {
            title: "Deposit Success",
            color: "#ff0000",
            thumbnail: null,
            image: null,
            footer: {
                text: "Bank",
                iconURL: null
            },
            author: {
                name: null,
                iconURL: null
            },
            timestamp: true
        },
        physicalWithdraw: {
            title: "Physical Withdraw",
            color: "#ff0000",
            thumbnail: null,
            image: null,
            footer: {
                text: "Bank",
                iconURL: null
            },
            author: {
                name: null,
                iconURL: null
            },
            timestamp: true
        },
        bankBalance: {
            title: "Bank Balance",
            color: "#ff0000",
            thumbnail: null,
            image: null,
            footer: {
                text: "Bank",
                iconURL: null
            },
            author: {
                name: null,
                iconURL: null
            },
            timestamp: true
        }
    },
    buttons: {
        report: {
            label: "Report",
            style: "Danger",
            emoji: "🚨"
        },
        approve: {
            label: "Approve",
            style: "Success",
            emoji: "✅"
        },
        deny: {
            label: "Deny",
            style: "Danger",
            emoji: "❌"
        },
        submit: {
            label: "Submit",
            style: "Success",
            emoji: "✅"
        },
        cancel: {
            label: "Cancel",
            style: "Danger",
            emoji: "❌"
        },
        restart: {
            label: "Restart",
            style: "Primary",
            emoji: "🔄"
        }
    }
}
