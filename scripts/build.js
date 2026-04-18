const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.resolve(__dirname, "..");
const dist = path.join(root, "dist");
const requiredFiles = [
    "index.html",
    "styles.css",
    "main.js",
    "data/api-data.js",
    "README.md",
    "docs/research/wasm-api-current.md"
];

function read(file) {
    return fs.readFileSync(path.join(root, file), "utf8");
}

function copyFile(file) {
    const source = path.join(root, file);
    const target = path.join(dist, file);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.copyFileSync(source, target);
}

function copyDirectory(directory) {
    const source = path.join(root, directory);
    if (!fs.existsSync(source)) {
        return;
    }
    const target = path.join(dist, directory);
    fs.cpSync(source, target, { recursive: true });
}

for (const file of requiredFiles) {
    if (!fs.existsSync(path.join(root, file))) {
        throw new Error(`Missing required file: ${file}`);
    }
}

const sandbox = { window: {} };
vm.createContext(sandbox);
vm.runInContext(read("data/api-data.js"), sandbox, { filename: "api-data.js" });

const data = sandbox.window.PUMPKIN_API_DATA;
if (!data || !Array.isArray(data.modules) || data.modules.length < 10) {
    throw new Error("API data is missing or too small.");
}

if (!/^[0-9a-f]{40}$/.test(data.commit)) {
    throw new Error("API data commit must be a full git SHA.");
}

const validStatuses = new Set(["implemented", "partial", "declared-only"]);
for (const module of data.modules) {
    if (!module.id || !module.title || !module.status || !module.source) {
        throw new Error(`Invalid module entry: ${JSON.stringify(module)}`);
    }
    if (!validStatuses.has(module.status)) {
        throw new Error(`Invalid status for ${module.id}: ${module.status}`);
    }
}

fs.rmSync(dist, { recursive: true, force: true });
for (const file of requiredFiles) {
    copyFile(file);
}
copyDirectory("assets");

console.log(`Built PumpkinAPI-docs with ${data.modules.length} API modules.`);
console.log(`Output: ${dist}`);
