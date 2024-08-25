import axios from "axios";
export const getUUID = async (ign) => {
    if (ign.startsWith(".")) {
        const res = await axios.get(`https://api.geysermc.org/v2/xbox/xuid/${ign.slice(1)}`).catch(() => null);
        if (!res || res.status !== 200)
            return null;
        return res.data.xuid;
    }
    else {
        const res = await axios.get(`https://playerdb.co/api/player/minecraft/${ign}`).catch(() => null);
        if (!res || res.status !== 200)
            return null;
        return res.data.data.player.id;
    }
};
