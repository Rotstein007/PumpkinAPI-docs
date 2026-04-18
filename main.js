const api = window.PUMPKIN_API_DATA;
const app = document.querySelector("#app");
const searchInput = document.querySelector("#searchInput");
const breadcrumb = document.querySelector("#breadcrumb");
const apiModuleNav = document.querySelector("#apiModuleNav");

let guiSlots = new Map([[13, { item: "minecraft:diamond", count: 1 }]]);
let activeSlot = 13;

function escapeHtml(value) {
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function rustString(value) {
    return JSON.stringify(String(value));
}

function rustMethod(name) {
    return String(name)
        .replace(/\(.*/, "")
        .replace(/^(command-sender|consumed-args|command-node|permission-default|permission-level|player)\./, "")
        .replaceAll("-", "_");
}

function statusBadge(status) {
    const label = {
        implemented: "implemented",
        partial: "partial",
        "declared-only": "declared only"
    }[status] || status;

    return `<span class="badge ${status}">${label}</span>`;
}

function setRoute(route) {
    document.querySelectorAll("[data-route]").forEach((item) => {
        item.classList.toggle("active", item.dataset.route === route);
    });
}

function setBreadcrumb(parts) {
    breadcrumb.innerHTML = parts.map((part, index) => {
        const isLast = index === parts.length - 1;
        if (isLast || !part.route) {
            return `<span>${escapeHtml(part.label)}</span>`;
        }
        return `<a href="#${part.route}" data-route="${part.route}">${escapeHtml(part.label)}</a>`;
    }).join("<span class=\"slash\">/</span>");
}

function moduleGroups(module) {
    return module.groups || [{ title: module.title, items: module.items || [] }];
}

function allApiCalls() {
    return api.modules.flatMap((module) => moduleGroups(module).flatMap((group) => {
        return group.items.map((item) => ({
            module,
            group: group.title,
            name: item,
            title: `${module.title}.${item}`,
            route: `api-${module.id}`
        }));
    }));
}

function targetName(call) {
    if (call.module.id === "world" && call.group === "Entity") {
        return "entity";
    }
    if (call.module.id === "world") {
        return "world";
    }
    if (call.module.id === "text") {
        return "component";
    }
    if (call.module.id === "logging") {
        return "logging";
    }
    if (call.module.id === "plugin") {
        return "plugin";
    }
    return call.module.id.replaceAll("-", "_");
}

function exampleFor(call) {
    const name = call.name;
    const method = rustMethod(name);
    const target = targetName(call);

    if (call.module.id === "player") {
        if (name === "show-title") {
            return `use pumpkin_plugin_api::text::TextComponent;

let title = TextComponent::text("Welcome to Pumpkin");
player.show_title(&title);`;
        }
        if (name === "show-subtitle") {
            return `let subtitle = TextComponent::text("WASM plugin API");
player.show_subtitle(&subtitle);`;
        }
        if (name === "show-actionbar") {
            return `let actionbar = TextComponent::text("Actionbar text");
player.show_actionbar(&actionbar);`;
        }
        if (name === "send-title-animation") {
            return `// 20 ticks = 1 second
player.send_title_animation(10, 60, 20);`;
        }
        if (name === "send-system-message") {
            return `let message = TextComponent::text("Hello from a Pumpkin WASM plugin");
player.send_system_message(&message, false);`;
        }
        if (name === "teleport" || name === "teleport-world") {
            return `let position = (0.5, 80.0, 0.5);
let world = player.get_world();
player.teleport(position, Some(0.0), Some(0.0), &world);`;
        }
        if (name === "open-gui") {
            return `let title = TextComponent::text("Menu");
let gui = gui::Gui::new(gui::GuiType::Generic9x3, &title);
player.open_gui(&gui);`;
        }
        if (name === "get-abilities" || name === "set-abilities") {
            return `let mut abilities = player.get_abilities();
abilities.allow_flying = true;
abilities.fly_speed = 0.18;
player.set_abilities(abilities);`;
        }
    }

    if (call.module.id === "text") {
        if (name.startsWith("click-")) {
            return `let component = TextComponent::text("Click me")
    .${method}("/example command");`;
        }
        if (name.startsWith("hover-")) {
            return `let hover = TextComponent::text("Tooltip");
let component = TextComponent::text("Hover me")
    .${method}(&hover);`;
        }
        return `let component = TextComponent::text("Hello Pumpkin")
    .${method}(true);`;
    }

    if (call.module.id === "scheduler") {
        if (name === "cancel-task(task-id)") {
            return `use pumpkin_plugin_api::scheduler::cancel_task;

cancel_task(task_id);`;
        }
        return `use pumpkin_plugin_api::scheduler::SchedulerExt;

let task_id = context.${method}(20, |server| {
    let _tps = server.get_tps();
});`;
    }

    if (call.module.id === "server") {
        return `let value = server.${method}();`;
    }

    if (call.module.id === "world") {
        if (name === "play-sound") {
            return `world.play_sound(
    "minecraft:block.note_block.pling",
    world::SoundCategory::Players,
    (0.0, 80.0, 0.0),
    1.0,
    1.0,
);`;
        }
        if (name === "spawn-particle") {
            return `world.spawn_particle(
    "minecraft:happy_villager",
    (0.0, 80.0, 0.0),
    (0.4, 0.6, 0.4),
    0.0,
    20,
);`;
        }
        if (name === "set-block-state") {
            return `let pos = world::BlockPos { x: 0, y: 80, z: 0 };
world.set_block_state(pos, 1, world::BlockFlags::NOTIFY_LISTENERS);`;
        }
        return `let value = ${target}.${method}();`;
    }

    if (call.module.id === "gui") {
        return `let title = TextComponent::text("Menu");
let gui = gui::Gui::new(gui::GuiType::Generic9x3, &title);
gui.set_item(13, common::ItemStack {
    registry_key: "minecraft:diamond".into(),
    count: 1,
});`;
    }

    if (call.module.id === "scoreboard") {
        return `let scoreboard = world.get_scoreboard();
scoreboard.${method}(/* arguments */);`;
    }

    if (call.module.id === "command") {
        return `let command = Command::new(&["example".to_string()], "Example command");
// WIT call: ${name}`;
    }

    if (call.module.id === "event") {
        return `context.register_event(
    HANDLER_ID,
    event::EventType::${name.split("-").map((part) => part[0].toUpperCase() + part.slice(1)).join("")},
    event::EventPriority::Normal,
    true,
);`;
    }

    if (call.module.id === "context") {
        return `let value = context.${method}();`;
    }

    if (call.module.id === "logging") {
        return `use pumpkin_plugin_api::logging::{log, LogLevel};

log(LogLevel::Info, "Hello from PumpkinAPI");`;
    }

    return `// ${call.module.source}
// WIT call: ${name}
let value = ${target}.${method}(/* arguments */);`;
}

function renderCallCard(call) {
    return `
        <article class="api-call">
            <div class="api-call-header">
                <div>
                    <p class="eyebrow">${escapeHtml(call.module.source)}${call.group ? ` / ${escapeHtml(call.group)}` : ""}</p>
                    <h3>${escapeHtml(call.name)}</h3>
                </div>
                ${statusBadge(call.module.status)}
            </div>
            <pre><code>${escapeHtml(exampleFor(call))}</code></pre>
        </article>
    `;
}

function populateApiNav() {
    apiModuleNav.innerHTML = api.modules.map((module) => {
        return `<a href="#api-${module.id}" data-route="api-${module.id}">${escapeHtml(module.title)}</a>`;
    }).join("");
}

function renderTools() {
    setRoute("tools");
    setBreadcrumb([{ label: "PumpkinAPI", route: "tools" }, { label: "Tools" }]);

    app.innerHTML = `
        <section class="section-stack">
            <article class="panel intro-panel">
                <h2>Tools</h2>
                <p>Generators for Pumpkin WASM features. Each tool produces Rust snippets based on the current WIT API.</p>
            </article>
            ${api.tools.map((tool) => `
                <article class="tool-row">
                    <div>
                        <h3>${escapeHtml(tool.title)}</h3>
                        <p>${escapeHtml(tool.summary)}</p>
                        <div class="chip-list">${tool.api.map((item) => `<span class="chip">${escapeHtml(item)}</span>`).join("")}</div>
                    </div>
                    <a class="button" href="#${tool.id}" data-route="${tool.id}">Open</a>
                </article>
            `).join("")}
        </section>
    `;
}

function renderApiModule(moduleId) {
    const module = api.modules.find((item) => item.id === moduleId) || api.modules[0];
    setRoute(`api-${module.id}`);
    setBreadcrumb([
        { label: "PumpkinAPI", route: "tools" },
        { label: "API", route: `api-${api.modules[0].id}` },
        { label: module.title }
    ]);

    const calls = moduleGroups(module).flatMap((group) => {
        return group.items.map((item) => ({ module, group: group.title, name: item }));
    });

    app.innerHTML = `
        <section class="section-stack">
            <article class="panel intro-panel">
                <p class="eyebrow">${escapeHtml(module.source)}</p>
                <h2>${escapeHtml(module.title)}</h2>
                <p>${escapeHtml(module.summary)}</p>
            </article>
            ${calls.map(renderCallCard).join("")}
        </section>
    `;
}

function readFormValue(id) {
    return document.getElementById(id)?.value ?? "";
}

function renderTitleTool() {
    setRoute("tool-title");
    setBreadcrumb([{ label: "PumpkinAPI", route: "tools" }, { label: "Tools", route: "tools" }, { label: "Title Generator" }]);

    app.innerHTML = `
        <section class="tool-grid">
            <form class="tool-form" id="titleForm">
                <p class="eyebrow">player + text-component</p>
                <h2>Title Generator</h2>
                <div class="field-grid">
                    <label class="field full">Title <input id="titleText" value="Welcome to Pumpkin"></label>
                    <label class="field full">Subtitle <input id="subtitleText" value="WASM plugins are live"></label>
                    <label class="field full">Actionbar <input id="actionbarText" value="Generated with PumpkinAPI-docs"></label>
                    <label class="field">Fade in ticks <input id="fadeIn" type="number" value="10" min="0"></label>
                    <label class="field">Stay ticks <input id="stay" type="number" value="60" min="0"></label>
                    <label class="field">Fade out ticks <input id="fadeOut" type="number" value="20" min="0"></label>
                    <label class="field">Color <select id="titleColor">
                        <option value="Gold">gold</option>
                        <option value="Green">green</option>
                        <option value="Aqua">aqua</option>
                        <option value="Red">red</option>
                        <option value="White">white</option>
                    </select></label>
                </div>
            </form>
            <div class="tool-output">
                <div class="preview-title">
                    <div>
                        <strong id="titlePreviewTitle"></strong>
                        <span id="titlePreviewSubtitle"></span>
                        <small id="titlePreviewActionbar"></small>
                    </div>
                </div>
                <pre><code id="titleCode"></code></pre>
                <div class="copy-row"><button class="button secondary" data-copy="titleCode">Copy code</button></div>
            </div>
        </section>
    `;

    const update = () => {
        const title = readFormValue("titleText");
        const subtitle = readFormValue("subtitleText");
        const actionbar = readFormValue("actionbarText");
        const color = readFormValue("titleColor");
        const fadeIn = Number(readFormValue("fadeIn") || 0);
        const stay = Number(readFormValue("stay") || 0);
        const fadeOut = Number(readFormValue("fadeOut") || 0);

        document.querySelector("#titlePreviewTitle").textContent = title;
        document.querySelector("#titlePreviewSubtitle").textContent = subtitle;
        document.querySelector("#titlePreviewActionbar").textContent = actionbar;
        document.querySelector("#titleCode").textContent = `use pumpkin_plugin_api::{common, text::TextComponent};

player.send_title_animation(${fadeIn}, ${stay}, ${fadeOut});

let title = TextComponent::text(${rustString(title)})
    .color_named(common::NamedColor::${color})
    .bold(true);
player.show_title(&title);

let subtitle = TextComponent::text(${rustString(subtitle)})
    .color_named(common::NamedColor::White);
player.show_subtitle(&subtitle);

let actionbar = TextComponent::text(${rustString(actionbar)})
    .color_named(common::NamedColor::Aqua);
player.show_actionbar(&actionbar);`;
    };

    app.querySelector("#titleForm").addEventListener("input", update);
    update();
}

function renderTextTool() {
    setRoute("tool-text");
    setBreadcrumb([{ label: "PumpkinAPI", route: "tools" }, { label: "Tools", route: "tools" }, { label: "TextComponent Generator" }]);

    app.innerHTML = `
        <section class="tool-grid">
            <form class="tool-form" id="textForm">
                <p class="eyebrow">chat + hover + click</p>
                <h2>TextComponent Generator</h2>
                <label class="field full">Text <input id="componentText" value="Accept teleport request"></label>
                <div class="field-grid">
                    <label class="field">RGB color <input id="componentColor" value="#04aa6d"></label>
                    <label class="field">Click action <select id="clickKind">
                        <option value="run">run command</option>
                        <option value="suggest">suggest command</option>
                        <option value="url">open url</option>
                        <option value="copy">copy to clipboard</option>
                    </select></label>
                    <label class="field full">Click value <input id="clickValue" value="/tpa accept"></label>
                    <label class="field full">Hover text <input id="hoverText" value="Click to accept the newest request"></label>
                </div>
                <div class="check-row">
                    <label><input id="bold" type="checkbox" checked> Bold</label>
                    <label><input id="italic" type="checkbox"> Italic</label>
                    <label><input id="underlined" type="checkbox"> Underlined</label>
                </div>
            </form>
            <div class="tool-output">
                <article class="panel" style="box-shadow: none; margin-bottom: 16px;">
                    <h3>Preview</h3>
                    <p id="textPreview"></p>
                </article>
                <pre><code id="textCode"></code></pre>
                <div class="copy-row"><button class="button secondary" data-copy="textCode">Copy code</button></div>
            </div>
        </section>
    `;

    const update = () => {
        const text = readFormValue("componentText");
        const hex = readFormValue("componentColor").replace("#", "");
        const r = parseInt(hex.slice(0, 2) || "04", 16);
        const g = parseInt(hex.slice(2, 4) || "aa", 16);
        const b = parseInt(hex.slice(4, 6) || "6d", 16);
        const clickKind = readFormValue("clickKind");
        const clickValue = readFormValue("clickValue");
        const hover = readFormValue("hoverText");
        const bold = document.getElementById("bold").checked;
        const italic = document.getElementById("italic").checked;
        const underlined = document.getElementById("underlined").checked;
        const clickMethod = {
            run: "click_run_command",
            suggest: "click_suggest_command",
            url: "click_open_url",
            copy: "click_copy_to_clipboard"
        }[clickKind];

        const preview = document.querySelector("#textPreview");
        preview.textContent = text;
        preview.style.color = `#${hex || "04aa6d"}`;
        preview.style.fontWeight = bold ? "700" : "400";
        preview.style.fontStyle = italic ? "italic" : "normal";
        preview.style.textDecoration = underlined ? "underline" : "none";

        document.querySelector("#textCode").textContent = `use pumpkin_plugin_api::{common, text::TextComponent};

let hover = TextComponent::text(${rustString(hover)});

let component = TextComponent::text(${rustString(text)})
    .color_rgb(common::RgbColor { r: ${r || 0}, g: ${g || 0}, b: ${b || 0} })
    .bold(${bold})
    .italic(${italic})
    .underlined(${underlined})
    .hover_show_text(&hover)
    .${clickMethod}(${rustString(clickValue)});

sender.send_message(&component);`;
    };

    app.querySelector("#textForm").addEventListener("input", update);
    update();
}

function renderGuiTool() {
    setRoute("tool-gui");
    setBreadcrumb([{ label: "PumpkinAPI", route: "tools" }, { label: "Tools", route: "tools" }, { label: "GUI Layout Generator" }]);

    app.innerHTML = `
        <section class="tool-grid">
            <form class="tool-form" id="guiForm">
                <p class="eyebrow">gui + item-stack</p>
                <h2>GUI Layout Generator</h2>
                <div class="field-grid">
                    <label class="field full">Title <input id="guiTitle" value="Pumpkin Menu"></label>
                    <label class="field">Rows <select id="guiRows">
                        <option value="1">1</option>
                        <option value="2">2</option>
                        <option value="3" selected>3</option>
                        <option value="4">4</option>
                        <option value="5">5</option>
                        <option value="6">6</option>
                    </select></label>
                    <label class="field">Active slot <input id="activeSlot" type="number" value="${activeSlot}" min="0" max="53"></label>
                    <label class="field full">Item registry key <input id="slotItem" value="${guiSlots.get(activeSlot)?.item || "minecraft:diamond"}"></label>
                    <label class="field">Count <input id="slotCount" type="number" value="${guiSlots.get(activeSlot)?.count || 1}" min="1" max="64"></label>
                </div>
                <button class="button" type="button" id="setSlot">Set slot</button>
                <button class="button secondary" type="button" id="clearSlot">Clear slot</button>
            </form>
            <div class="tool-output">
                <div id="inventoryGrid" class="inventory-grid"></div>
                <pre><code id="guiCode"></code></pre>
                <div class="copy-row"><button class="button secondary" data-copy="guiCode">Copy code</button></div>
            </div>
        </section>
    `;

    const draw = () => {
        const rows = Number(readFormValue("guiRows") || 3);
        const slotCount = rows * 9;
        activeSlot = Math.min(Number(readFormValue("activeSlot") || 0), slotCount - 1);
        document.querySelector("#activeSlot").value = activeSlot;
        const grid = document.querySelector("#inventoryGrid");
        grid.innerHTML = Array.from({ length: slotCount }, (_, index) => {
            const item = guiSlots.get(index);
            return `<button class="slot ${item ? "filled" : ""} ${index === activeSlot ? "active" : ""}" type="button" data-slot="${index}">${item ? item.count : index}</button>`;
        }).join("");
        grid.querySelectorAll("[data-slot]").forEach((slot) => {
            slot.addEventListener("click", () => {
                activeSlot = Number(slot.dataset.slot);
                document.querySelector("#activeSlot").value = activeSlot;
                const item = guiSlots.get(activeSlot);
                document.querySelector("#slotItem").value = item?.item || "minecraft:diamond";
                document.querySelector("#slotCount").value = item?.count || 1;
                draw();
            });
        });
        updateGuiCode();
    };

    const updateGuiCode = () => {
        const title = readFormValue("guiTitle");
        const rows = Number(readFormValue("guiRows") || 3);
        const type = `Generic9x${rows}`;
        const entries = [...guiSlots.entries()]
            .filter(([slot]) => slot < rows * 9)
            .sort(([a], [b]) => a - b)
            .map(([slot, item]) => `gui.set_item(${slot}, common::ItemStack {
    registry_key: ${rustString(item.item)}.into(),
    count: ${item.count},
});`)
            .join("\n\n");

        document.querySelector("#guiCode").textContent = `use pumpkin_plugin_api::{common, gui, text::TextComponent};

let title = TextComponent::text(${rustString(title)});
let gui = gui::Gui::new(gui::GuiType::${type}, &title);

${entries || "// Add items with gui.set_item(slot, item_stack);"}

player.open_gui(&gui);`;
    };

    document.querySelector("#setSlot").addEventListener("click", () => {
        guiSlots.set(Number(readFormValue("activeSlot")), {
            item: readFormValue("slotItem"),
            count: Number(readFormValue("slotCount") || 1)
        });
        draw();
    });
    document.querySelector("#clearSlot").addEventListener("click", () => {
        guiSlots.delete(Number(readFormValue("activeSlot")));
        draw();
    });
    app.querySelector("#guiForm").addEventListener("input", draw);
    draw();
}

function renderAbilitiesTool() {
    setRoute("tool-abilities");
    setBreadcrumb([{ label: "PumpkinAPI", route: "tools" }, { label: "Tools", route: "tools" }, { label: "Player Ability Generator" }]);

    app.innerHTML = `
        <section class="tool-grid">
            <form class="tool-form" id="abilityForm">
                <p class="eyebrow">player abilities</p>
                <h2>Player Ability Generator</h2>
                <div class="field-grid">
                    <label class="field">Fly speed <input id="flySpeed" type="number" value="0.18" min="0" max="2" step="0.01"></label>
                    <label class="field">Walk speed <input id="walkSpeed" type="number" value="0.10" min="0" max="2" step="0.01"></label>
                </div>
                <div class="check-row">
                    <label><input id="allowFlying" type="checkbox" checked> Allow flying</label>
                    <label><input id="setFlying" type="checkbox" checked> Set flying</label>
                    <label><input id="invulnerable" type="checkbox"> Invulnerable</label>
                </div>
            </form>
            <div class="tool-output">
                <article class="panel" style="box-shadow: none; margin-bottom: 16px;">
                    <h3>Use case</h3>
                    <p>Useful for creative fly speed commands or chunk-generation helper plugins.</p>
                </article>
                <pre><code id="abilityCode"></code></pre>
                <div class="copy-row"><button class="button secondary" data-copy="abilityCode">Copy code</button></div>
            </div>
        </section>
    `;

    const update = () => {
        const flySpeed = Number(readFormValue("flySpeed") || 0);
        const walkSpeed = Number(readFormValue("walkSpeed") || 0);
        const allowFlying = document.getElementById("allowFlying").checked;
        const setFlying = document.getElementById("setFlying").checked;
        const invulnerable = document.getElementById("invulnerable").checked;

        document.querySelector("#abilityCode").textContent = `let mut abilities = player.get_abilities();
abilities.allow_flying = ${allowFlying};
abilities.flying = ${setFlying};
abilities.invulnerable = ${invulnerable};
abilities.fly_speed = ${flySpeed.toFixed(2)};
abilities.walk_speed = ${walkSpeed.toFixed(2)};

player.set_abilities(abilities);
player.set_flying(${setFlying});`;
    };

    app.querySelector("#abilityForm").addEventListener("input", update);
    update();
}

function renderSearch(query) {
    setRoute("");
    setBreadcrumb([{ label: "PumpkinAPI", route: "tools" }, { label: "Search" }]);
    const needle = query.trim().toLowerCase();
    if (!needle) {
        route();
        return;
    }

    const toolMatches = api.tools.filter((tool) => {
        return [tool.title, tool.summary, ...tool.api].some((item) => item.toLowerCase().includes(needle));
    });
    const callMatches = allApiCalls().filter((call) => {
        return [call.module.title, call.group, call.name, call.module.summary].filter(Boolean).some((item) => item.toLowerCase().includes(needle));
    });

    app.innerHTML = `
        <section class="section-stack">
            <article class="panel intro-panel">
                <h2>Search: ${escapeHtml(query)}</h2>
            </article>
            ${toolMatches.map((tool) => `
                <article class="tool-row">
                    <div>
                        <p class="eyebrow">Tool</p>
                        <h3>${escapeHtml(tool.title)}</h3>
                        <p>${escapeHtml(tool.summary)}</p>
                    </div>
                    <a class="button" href="#${tool.id}" data-route="${tool.id}">Open</a>
                </article>
            `).join("")}
            ${callMatches.map(renderCallCard).join("") || (!toolMatches.length ? "<article class=\"panel\"><p>No results.</p></article>" : "")}
        </section>
    `;
}

function copyCode(id) {
    const text = document.getElementById(id)?.textContent || "";
    navigator.clipboard?.writeText(text);
}

function route() {
    if (searchInput.value.trim()) {
        renderSearch(searchInput.value);
        return;
    }

    const current = location.hash.replace("#", "") || "tools";
    const routes = {
        tools: renderTools,
        "tool-title": renderTitleTool,
        "tool-text": renderTextTool,
        "tool-gui": renderGuiTool,
        "tool-abilities": renderAbilitiesTool
    };

    if (current.startsWith("api-")) {
        renderApiModule(current.slice(4));
        return;
    }

    (routes[current] || renderTools)();
}

document.addEventListener("click", (event) => {
    const copyButton = event.target.closest("[data-copy]");
    if (copyButton) {
        copyCode(copyButton.dataset.copy);
    }
});

searchInput.addEventListener("input", () => renderSearch(searchInput.value));
window.addEventListener("hashchange", route);
populateApiNav();
route();
