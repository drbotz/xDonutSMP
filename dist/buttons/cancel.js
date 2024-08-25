export default {
    id: "cancel",
    function: async function ({ button }) {
        await button.reply({ content: ":white_check_mark: **The scam report has been cancelled.**" });
        await new Promise(resolve => setTimeout(resolve, 1000));
        await button.channel.delete();
    }
};
