import { DataSource, DataSourceOptions } from "typeorm";
import { readdirSync } from "fs";
import { fileURLToPath } from 'url';
import { convertURLs } from "../utils/windowsUrlConvertor.js";
import config from "../config.js";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const entities = [];

const dirs = path.resolve(__dirname, "../tables/");
const tableFiles = readdirSync(dirs).filter(file => file.endsWith(".js") || file.endsWith(".ts"));
for (const file of tableFiles) {
    const windowsDirs = convertURLs(dirs);
    const fileToImport = process.platform === "win32" ? `${windowsDirs}/${file}` : `${dirs}/${file}`;
    const entity = await import(fileToImport);
    entities.push(entity.default);
}

const AppDataSource = new DataSource({
    ...config.database as DataSourceOptions,
    entities: Object.values(entities),
    synchronize: config.syncDatabase,
    dropSchema: config.resetDatabase
});

await AppDataSource.initialize().catch(console.error);

export default AppDataSource;