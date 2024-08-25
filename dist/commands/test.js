// import { client } from "../index.js";
export default {
    name: "test",
    aliases: ["t"],
    description: "testing",
    permissions: ["Administrator"],
    roleRequired: "",
    cooldown: 0,
    function: async function ({ message, args }) {
        const { client } = await import("../index.js");
        message.channel.send("HeLlo!");
    },
};
