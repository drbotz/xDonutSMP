import colors from "colors";
import config from "../config.js";
import { setBusy } from "../minecraft/index.js";
export function log(text) {
    const date = new Date().toTimeString().split(/ +/)[0];
    console.log(colors.green(`[${date}]: ${text}`));
}
export function error(text) {
    setBusy(false);
    const date = new Date().toTimeString().split(/ +/)[0];
    if (config.debugMode) {
        console.error(text);
    }
    else {
        console.log(colors.red(`[${date}]: ${text}`));
    }
}
