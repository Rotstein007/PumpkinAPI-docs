window.PUMPKIN_API_DATA = {
    checkedAt: "2026-04-18",
    repository: "https://github.com/Pumpkin-MC/Pumpkin",
    branch: "master",
    commit: "a55c42c835ddd650338f35bc5e869d315e049f1a",
    witPath: "pumpkin-plugin-wit/v0.1.0",
    hostPath: "pumpkin/src/plugin/loader/wasm/wasm_host/wit/v0_1_0",
    modules: [
        {
            id: "plugin",
            title: "Plugin Lifecycle",
            status: "implemented",
            summary: "WASM component entrypoints for load, unload, metadata, events, commands and scheduled tasks.",
            source: "plugin.wit",
            items: [
                "init-plugin",
                "on-load(context)",
                "on-unload(context)",
                "metadata",
                "common",
                "handle-event(event-id, server, event)",
                "handle-command(command-id, sender, server, args)",
                "handle-task(handler-id, server)"
            ],
            toolIdeas: ["Plugin skeleton generator", "Metadata generator"]
        },
        {
            id: "context",
            title: "Context",
            status: "implemented",
            summary: "Registration and plugin runtime access.",
            source: "context.wit",
            items: [
                "register-event(handler-id, event-type, event-priority, blocking)",
                "register-command(command, permission)",
                "register-permission(permission)",
                "get-data-folder()",
                "get-server()"
            ],
            toolIdeas: ["Permission generator", "Event listener snippet"]
        },
        {
            id: "server",
            title: "Server",
            status: "implemented",
            summary: "Global server info, performance metrics and online player lookup.",
            source: "server.wit",
            items: [
                "get-difficulty()",
                "get-player-count()",
                "get-mspt()",
                "get-tps()",
                "get-all-players()",
                "get-player-by-name(name)",
                "get-player-by-uuid(id)"
            ],
            toolIdeas: ["Server status widget", "Online players command"]
        },
        {
            id: "player",
            title: "Player",
            status: "implemented",
            summary: "Player state, messaging, titles, teleport, moderation, inventory reads, health, food, XP and abilities.",
            source: "player.wit",
            groups: [
                {
                    title: "Basic state",
                    items: ["as-entity", "get-id", "get-name", "get-position", "get-yaw", "get-pitch", "get-world", "get-gamemode", "set-gamemode", "get-locale", "get-ping"]
                },
                {
                    title: "Permissions and metadata",
                    items: ["get-permission-level", "set-permission-level", "has-permission", "get-display-name"]
                },
                {
                    title: "Messaging and titles",
                    items: ["send-system-message", "show-title", "show-subtitle", "show-actionbar", "send-title-animation"]
                },
                {
                    title: "Teleport and moderation",
                    items: ["teleport", "teleport-world", "kick", "respawn", "ban", "ban-ip"]
                },
                {
                    title: "GUI and inventory",
                    items: ["open-gui", "get-selected-slot", "get-item-in-hand", "get-inventory-item"]
                },
                {
                    title: "Status and abilities",
                    items: ["get-health", "set-health", "get-max-health", "set-max-health", "get-food-level", "set-food-level", "get-saturation", "set-saturation", "get-exhaustion", "set-exhaustion", "get-absorption", "set-absorption", "get-experience-level", "get-experience-progress", "get-experience-points", "set-experience-level", "set-experience-progress", "set-experience-points", "add-experience-levels", "add-experience-points", "is-sneaking", "set-sneaking", "is-sprinting", "set-sprinting", "is-on-ground", "is-flying", "set-flying", "get-abilities", "set-abilities", "get-ip"]
                }
            ],
            toolIdeas: ["Title generator", "Fly speed generator", "Teleport snippet", "Player inspector"]
        },
        {
            id: "text",
            title: "Text Components",
            status: "implemented",
            summary: "Rich chat/title components with colors, formatting, hover and click events.",
            source: "text.wit",
            items: [
                "text(plain)",
                "translate(key, with)",
                "add-child",
                "add-text",
                "get-text",
                "encode",
                "color-named",
                "color-rgb",
                "bold",
                "italic",
                "underlined",
                "strikethrough",
                "obfuscated",
                "insertion",
                "font",
                "shadow-color",
                "click-open-url",
                "click-run-command",
                "click-suggest-command",
                "click-copy-to-clipboard",
                "hover-show-text",
                "hover-show-item",
                "hover-show-entity"
            ],
            toolIdeas: ["Tellraw generator", "Chat button generator", "Title generator"]
        },
        {
            id: "command",
            title: "Commands",
            status: "partial",
            summary: "Brigadier-like command trees, typed arguments, sender helpers and command errors.",
            source: "command.wit",
            groups: [
                {
                    title: "Command",
                    items: ["constructor(names, description)", "then(node)", "execute-with-handler-id"]
                },
                {
                    title: "CommandNode",
                    items: ["literal(name)", "argument(name, argument-type)", "then(node)", "execute-with-handler-id", "require-with-handler-id"]
                },
                {
                    title: "ConsumedArgs",
                    items: ["get-value(key)"]
                },
                {
                    title: "CommandSender",
                    items: ["get-command-sender-type", "send-message", "set-success-count", "is-player", "is-console", "as-player", "permission-level", "has-permission-level", "has-permission", "position", "world", "get-locale", "should-receive-feedback", "should-broadcast-console-to-ops", "should-track-output"]
                },
                {
                    title: "ArgumentType",
                    items: ["bool", "float", "double", "integer", "long", "string", "entities", "entity", "players", "game-profile", "block-pos", "position3d", "position2d", "block-state", "block-predicate", "item", "item-predicate", "component", "rotation", "resource-location", "entity-anchor", "gamemode", "difficulty", "time", "resource"]
                }
            ],
            limitations: [
                "command-sender.get-command-sender-type is still todo in host code.",
                "command-node.require-with-handler-id is still todo in host code.",
                "Entity, entities, game profiles and command tree values are not fully returned as resources by get-value yet."
            ],
            toolIdeas: ["Command tree generator", "Argument snippet generator"]
        },
        {
            id: "event",
            title: "Events",
            status: "partial",
            summary: "Player, block, server and world events with optional blocking/cancel support.",
            source: "event.wit",
            items: [
                "player-join-event",
                "player-leave-event",
                "player-login-event",
                "player-chat-event",
                "player-command-send-event",
                "player-permission-check-event",
                "player-move-event",
                "player-teleport-event",
                "player-change-world-event",
                "player-exp-change-event",
                "player-item-held-event",
                "player-changed-main-hand-event",
                "player-gamemode-change-event",
                "player-custom-payload-event",
                "player-fish-event",
                "player-egg-throw-event",
                "player-interact-unknown-entity-event",
                "player-interact-event",
                "player-toggle-sneak-event",
                "player-toggle-flight-event",
                "player-toggle-sprint-event",
                "block-redstone-event",
                "block-break-event",
                "block-burn-event",
                "block-can-build-event",
                "block-grow-event",
                "block-place-event",
                "server-command-event",
                "spawn-change-event",
                "server-broadcast-event"
            ],
            limitations: [
                "PlayerInteractEvent can be converted to WASM, but host reverse conversion currently panics. Avoid blocking/cancel workflows for this event until fixed."
            ],
            toolIdeas: ["Event listener snippet generator", "Move cancel example"]
        },
        {
            id: "scheduler",
            title: "Scheduler",
            status: "implemented",
            summary: "Delayed, repeating and cancellable tick-based tasks.",
            source: "scheduler.wit",
            items: [
                "schedule-delayed-task(handler-id, delay-ticks)",
                "schedule-repeating-task(handler-id, delay-ticks, period-ticks)",
                "cancel-task(task-id)"
            ],
            toolIdeas: ["Countdown generator", "Repeating actionbar generator"]
        },
        {
            id: "world",
            title: "World and Entity",
            status: "partial",
            summary: "Block state access, time, weather, sounds, particles, explosions, scoreboards and entity operations.",
            source: "world.wit",
            groups: [
                {
                    title: "World",
                    items: ["get-id", "get-block-state-id", "get-block-state", "set-block-state", "get-time-of-day", "set-time-of-day", "get-world-age", "get-dimension", "get-top-block-y", "get-motion-blocking-height", "is-raining", "set-raining", "is-thundering", "set-thundering", "broadcast-system-message", "get-scoreboard", "play-sound", "spawn-particle", "create-explosion", "get-sea-level", "get-min-y", "get-entities"]
                },
                {
                    title: "Entity",
                    items: ["get-id", "get-uuid", "get-type", "get-position", "get-world", "get-yaw", "get-pitch", "get-head-yaw", "is-on-ground", "is-sneaking", "is-sprinting", "is-invisible", "is-glowing", "teleport", "set-velocity", "get-velocity", "get-pose", "get-name", "set-custom-name", "get-custom-name", "set-custom-name-visible", "is-custom-name-visible", "is-invulnerable", "set-invulnerable", "get-fire-ticks", "set-fire-ticks", "remove"]
                }
            ],
            limitations: [
                "create-explosion currently ignores create-fire and interaction in the host implementation."
            ],
            toolIdeas: ["Block tool", "Weather/time tool", "Sound generator", "Particle generator"]
        },
        {
            id: "gui",
            title: "GUI",
            status: "partial",
            summary: "Create container GUIs, set slot items and open them for players.",
            source: "gui.wit",
            items: [
                "Gui(type, title)",
                "set-item(slot, item-stack)",
                "get-item(slot)",
                "player.open-gui(gui)"
            ],
            limitations: [
                "No dedicated GUI click or inventory interaction events are visible in the current WIT."
            ],
            toolIdeas: ["Static inventory layout generator"]
        },
        {
            id: "scoreboard",
            title: "Scoreboard",
            status: "implemented",
            summary: "Objectives, display slots, scores and teams.",
            source: "scoreboard.wit",
            items: [
                "add-objective",
                "remove-objective",
                "set-display-slot",
                "update-score",
                "remove-score",
                "create-team",
                "remove-team",
                "update-team",
                "add-player-to-team",
                "remove-player-from-team"
            ],
            toolIdeas: ["Sidebar generator", "Team generator"]
        },
        {
            id: "permission",
            title: "Permissions",
            status: "implemented",
            summary: "Permission nodes, defaults and child permissions.",
            source: "permission.wit",
            items: [
                "permission-level zero..four",
                "permission-default deny",
                "permission-default allow",
                "permission-default op(level)",
                "permission-child",
                "permission"
            ],
            toolIdeas: ["Permission node generator"]
        },
        {
            id: "i18n",
            title: "I18n",
            status: "partial",
            summary: "Host translations and custom translation loading.",
            source: "i18n.wit",
            items: [
                "translate(key, locale)",
                "load-translations(namespace, json, locale)"
            ],
            limitations: [
                "Host locale mapping should be verified because it currently converts WIT locale variants through a debug-string path."
            ],
            toolIdeas: ["Translation JSON generator"]
        },
        {
            id: "logging",
            title: "Logging",
            status: "implemented",
            summary: "Direct logs and tracing forwarding.",
            source: "log.wit",
            items: [
                "log(level, message)",
                "log-tracing(event)"
            ],
            toolIdeas: ["Logging snippet"]
        },
        {
            id: "block-entity",
            title: "Block Entity",
            status: "declared-only",
            summary: "Block entity and command block signatures are declared, but host code is still TODO.",
            source: "block-entity.wit",
            items: [
                "resource-location",
                "get-position",
                "get-id",
                "is-dirty",
                "clear-dirty",
                "get-block-entity",
                "last-output",
                "track-output",
                "success-count",
                "command",
                "auto",
                "condition-met",
                "powered"
            ],
            limitations: [
                "block_entity.rs host implementation is currently todo for visible functions."
            ],
            toolIdeas: []
        }
    ],
    tools: [
        {
            id: "tool-title",
            title: "Title Generator",
            summary: "Generate Rust code for title, subtitle, actionbar and animation timing.",
            api: ["player.show-title", "player.show-subtitle", "player.show-actionbar", "player.send-title-animation", "text-component"]
        },
        {
            id: "tool-text",
            title: "TextComponent Generator",
            summary: "Generate styled TextComponent code with color, hover and click actions.",
            api: ["text-component.color-rgb", "text-component.bold", "text-component.hover-show-text", "text-component.click-run-command"]
        },
        {
            id: "tool-gui",
            title: "GUI Layout Generator",
            summary: "Generate a static GUI layout with item stacks and an open call.",
            api: ["gui", "gui.set-item", "player.open-gui"]
        },
        {
            id: "tool-abilities",
            title: "Player Ability Generator",
            summary: "Generate code for fly speed, walk speed and flying state.",
            api: ["player.get-abilities", "player.set-abilities", "player.set-flying"]
        }
    ]
};
