# Pumpkin WASM API research

Stand: 2026-04-18

Geprüfter Pumpkin-Stand:

- Repository: https://github.com/Pumpkin-MC/Pumpkin
- Branch: `master`
- Commit: `a55c42c835ddd650338f35bc5e869d315e049f1a`
- Lokaler Snapshot: `/tmp/Pumpkin-wasm-current`
- WIT-Pfad: `pumpkin-plugin-wit/v0.1.0`
- Host-Implementierung: `pumpkin/src/plugin/loader/wasm/wasm_host/wit/v0_1_0`
- High-Level Rust-API: `pumpkin-plugin-api`

## Einordnung

Der aktuelle WASM-Stand ist wesentlich weiter als alte lokale Caches gezeigt haben. Die API basiert auf WIT-Dateien in `pumpkin-plugin-wit/v0.1.0` und wird in `pumpkin-plugin-api` per `wit_bindgen` als Rust-Plugin-API bereitgestellt.

Die offizielle Webseite zeigt aktuell teils gemischte Inhalte. Die englischen Command-Seiten nennen explizit das "Wasm Plugin Template", waehrend einzelne lokalisierte Seiten noch native `cdylib`-Beispiele zeigen. Fuer die neue Doku sollte deshalb der GitHub-`master` mit WIT und Host-Code als technische Quelle der Wahrheit behandelt werden.

## WIT-Dateien

Aktuell existieren diese WIT-Dateien:

- `block-entity.wit`
- `command.wit`
- `common.wit`
- `context.wit`
- `entity.wit`
- `event.wit`
- `gui.wit`
- `i18n.wit`
- `log.wit`
- `metadata.wit`
- `permission.wit`
- `player.wit`
- `plugin.wit`
- `scheduler.wit`
- `scoreboard.wit`
- `server.wit`
- `text.wit`
- `world.wit`

## Plugin Lifecycle

`plugin.wit` definiert das Component-World-Interface `pumpkin:plugin/plugin`.

Imports:

- `logging`
- `gui`
- `scoreboard`
- `server`
- `text`
- `command`
- `context`
- `i18n`
- `scheduler`
- `%world`
- `entity`

Exports:

- `init-plugin`
- `on-load(context)`
- `on-unload(context)`
- `metadata`
- `common`
- `handle-event(event-id, server, event)`
- `handle-command(command-id, sender, server, args)`
- `handle-task(handler-id, server)`

Die Rust-API erwartet ein Plugin, das `pumpkin_plugin_api::Plugin` implementiert und per `pumpkin_plugin_api::register_plugin!(...)` registriert wird.

## Context

`context.wit` bietet:

- Event-Registrierung: `register-event`
- Command-Registrierung: `register-command`
- Permission-Registrierung: `register-permission`
- privaten Plugin-Datenordner: `get-data-folder`
- Server-Handle: `get-server`

Host-Status: implementiert.

## Server

`server.wit` bietet:

- `get-difficulty`
- `get-player-count`
- `get-mspt`
- `get-tps`
- `get-all-players`
- `get-player-by-name`
- `get-player-by-uuid`

Host-Status: implementiert in `server.rs`.

Wichtig fuer Tools:

- Online-Spielerlisten sind jetzt moeglich.
- Spielerlookup nach Name und UUID ist vorhanden.
- TPS/MSPT-Anzeige ist fuer ein Server-Status-Tool nutzbar.

## Player

`player.wit` ist aktuell breit ausgebaut.

Basis:

- `as-entity`
- `get-id`
- `get-name`
- `get-position`
- `get-yaw`
- `get-pitch`
- `get-world`
- `get-gamemode`
- `set-gamemode`
- `get-locale`
- `get-ping`

Permissions und Metadaten:

- `get-permission-level`
- `set-permission-level`
- `has-permission`
- `get-display-name`

Messaging und Titles:

- `send-system-message`
- `show-title`
- `show-subtitle`
- `show-actionbar`
- `send-title-animation`

Teleport und Moderation:

- `teleport(position, yaw, pitch, world)`
- `teleport-world(world, position, yaw, pitch)`
- `kick`
- `respawn`
- `ban`
- `ban-ip`

GUI:

- `open-gui`

Inventory:

- `get-selected-slot`
- `get-item-in-hand`
- `get-inventory-item`

Status:

- Health, Max-Health
- Food, Saturation, Exhaustion
- Absorption
- XP-Level, XP-Progress, XP-Points
- Sneaking, Sprinting, On-Ground, Flying
- Player-Abilities inklusive `fly-speed` und `walk-speed`
- IP-Adresse

Host-Status: implementiert in `player.rs`.

Wichtig fuer Tools:

- Title Generator ist direkt umsetzbar.
- Actionbar/Subtitles sind direkt umsetzbar.
- Fly-Speed/Walk-Speed-Tool ist direkt umsetzbar.
- Player-State-Debugger ist umsetzbar.
- Home/TPA-Plugins sind technisch deutlich realistischer als vorher.

## World und Entity

`world.wit` definiert sowohl eine `world`-Resource als auch eine generische `entity`-Resource.

World:

- `get-id`
- Block-State lesen und setzen
- Time-of-day lesen und setzen
- World-Age
- Dimension
- Top-Block-Y
- Motion-Blocking-Height
- Weather: rain/thunder lesen und setzen
- World-Broadcast
- Scoreboard-Zugriff
- Sound abspielen
- Partikel spawnen
- Explosion erzeugen
- Sea-Level und Min-Y
- Entities der Welt listen

Entity:

- ID, UUID, Type
- Position, Welt, Rotation
- Ground/Sneak/Sprint/Invisible/Glowing
- Teleport
- Velocity lesen und setzen
- Pose
- Name und Custom-Name
- Invulnerable
- Fire-Ticks
- Remove

Host-Status: implementiert in `world.rs`.

Einschraenkung:

- `create-explosion` ignoriert laut Host-Code aktuell `create-fire` und `interaction`, weil der interne Explosion-Code derzeit nur Position und Power nutzt.

Wichtig fuer Tools:

- Block-State-Viewer/Setter.
- Weather/Time-Tool.
- Sound- und Particle-Generator.
- Explosion-Generator, aber mit klarer Warnung zu derzeit ignorierten Optionen.
- Entity-Inspector.

## Commands

`command.wit` bietet eine Brigadier-artige Command-API.

Command-Erstellung:

- `command(names, description)`
- `command-node.literal`
- `command-node.argument`
- `then`
- `execute-with-handler-id`

Argumenttypen:

- Bool
- Float, Double, Integer, Long mit optionalen Grenzen
- String: single-word, quotable, greedy
- Entities
- Entity
- Players
- GameProfile
- BlockPos
- Position3D
- Position2D
- BlockState
- BlockPredicate
- Item
- ItemPredicate
- Component
- Rotation
- ResourceLocation
- EntityAnchor
- Gamemode
- Difficulty
- Time
- Resource

Ausgewertete Argumentwerte:

- Players, Entities, Entity
- BlockPos, Pos3D, Pos2D
- Rotation
- GameMode, Difficulty
- Item, ItemPredicate
- Block, BlockPredicate
- ResourceLocation
- BossbarColor, BossbarStyle
- Particle
- Msg, TextComponent
- Time
- Number
- Bool
- Simple String
- SoundCategory
- DamageType
- Effect
- Enchantment
- EntityAnchor

Command-Sender:

- Nachricht senden
- Success Count setzen
- Player/Console pruefen
- als Player bekommen
- Permission-Level pruefen
- Permission-Node pruefen
- Position und Welt lesen
- Locale und Feedback-Flags lesen

Host-Status: groesstenteils implementiert.

Bekannte Luecken:

- `command-sender.get-command-sender-type` ist im Host noch `todo!()`.
- `command-node.require-with-handler-id` ist im Host noch `todo!()`.
- In `get-value` liefern `OwnedArg::Entities`, `OwnedArg::Entity`, `OwnedArg::GameProfiles` und `OwnedArg::CommandTree` aktuell noch `Arg::Simple("")`, also keine echten Resources.

## Events

`event.wit` definiert 30 Event-Typen.

Player-Events:

- `player-join-event`
- `player-leave-event`
- `player-login-event`
- `player-chat-event`
- `player-command-send-event`
- `player-permission-check-event`
- `player-move-event`
- `player-teleport-event`
- `player-change-world-event`
- `player-exp-change-event`
- `player-item-held-event`
- `player-changed-main-hand-event`
- `player-gamemode-change-event`
- `player-custom-payload-event`
- `player-fish-event`
- `player-egg-throw-event`
- `player-interact-unknown-entity-event`
- `player-interact-event`
- `player-toggle-sneak-event`
- `player-toggle-flight-event`
- `player-toggle-sprint-event`

Block-Events:

- `block-redstone-event`
- `block-break-event`
- `block-burn-event`
- `block-can-build-event`
- `block-grow-event`
- `block-place-event`

Server/World-Events:

- `server-command-event`
- `server-broadcast-event`
- `spawn-change-event`

Host-Status: Registrierung und Dispatch sind implementiert.

Bekannte Luecke:

- `PlayerInteractEvent` kann im Host zwar nach WASM konvertiert werden, aber `from_v0_1_0_wasm_event` ist nicht unterstuetzt und panict. Das ist fuer blockierende/cancelbare Verarbeitung kritisch. In der Doku sollte dieses Event als "read-only/non-blocking safer" oder "blocking currently unsafe" markiert werden, bis das im Host behoben ist.

## Scheduler

`scheduler.wit` bietet:

- `schedule-delayed-task(handler-id, delay-ticks)`
- `schedule-repeating-task(handler-id, delay-ticks, period-ticks)`
- `cancel-task(task-id)`

`plugin.wit` exportiert passend dazu `handle-task`.

Die Rust-API bietet `pumpkin_plugin_api::scheduler::SchedulerExt` fuer `Context` und `Server`.

Host-Status: implementiert in `scheduler.rs`.

Wichtig fuer Tools:

- Countdown-Generator.
- Timer-Beispiele.
- TPA-Warmup.
- periodische Scoreboard/Actionbar-Updates.

## Text Components

`text.wit` bietet:

- Plain Text
- Translation Components
- Children
- Text lesen und als Bytes encoden
- Named Color
- RGB Color
- Bold, Italic, Underlined, Strikethrough, Obfuscated
- Insertion
- Font
- Shadow Color
- Click Events: open-url, run-command, suggest-command, copy-to-clipboard
- Hover Events: show-text, show-item, show-entity

Host-Status: implementiert.

Wichtig fuer Tools:

- Title Generator.
- Tellraw/TextComponent Generator.
- Hover/Click Chat Generator.
- Command-Button Generator, z. B. Accept/Decline fuer TPA.

## GUI

`gui.wit` bietet:

- GUI-Typen fuer Container wie 9x1 bis 9x6, 3x3, anvil, beacon, furnace, hopper, loom, merchant, shulker-box, smithing, stonecutter usw.
- GUI-Erstellung mit Titel
- Slot-Item setzen
- Slot-Item lesen

Host-Status: implementiert.

Einschraenkungen:

- Aktuell sichtbar sind nur GUI-Aufbau und Oeffnen ueber `player.open-gui`.
- Keine dedizierten GUI-Click-/Inventory-Events in WIT gefunden.

Wichtig fuer Tools:

- Inventory/GUI Layout Generator ist sinnvoll.
- Generierter Code sollte zunaechst statische Menues erzeugen; interaktive Klicklogik braucht passende Events, die aktuell nicht sichtbar sind.

## Scoreboard

`scoreboard.wit` bietet:

- Objectives erstellen/loeschen
- Display-Slot setzen
- Scores setzen/loeschen
- Teams erstellen/loeschen/aktualisieren
- Spieler zu Teams hinzufuegen/entfernen
- Render-Type Integer/Hearts
- alle Sidebar-Team-Farben
- Nametag-Visibility
- Collision-Rule
- Team-Settings mit Prefix/Suffix/Farbe/Friendly-Fire

Host-Status: implementiert.

Wichtig fuer Tools:

- Scoreboard Generator.
- Team Generator.
- Sidebar Generator.

## Permissions

`permission.wit` bietet:

- Permission-Level 0 bis 4
- Defaults: deny, allow, op(level)
- Child Permissions
- Permission-Record mit Node, Description, Default und Children

Host-Status: implementiert ueber `context.register-permission`.

Wichtig:

- Permission-Nodes muessen zum Plugin-Namespace passen.
- Die offizielle Command-Doku weist explizit darauf hin.

## I18n

`i18n.wit` bietet:

- `translate(key, locale)`
- `load-translations(namespace, json, locale)`

Host-Status: implementiert, aber der Host-Code macht aktuell eine einfache Debug-String-Konvertierung fuer Locales. Das sollte in der Doku vorsichtig als "implemented, locale mapping should be verified" markiert werden.

## Logging

`log.wit` bietet:

- `log(level, message)`
- `log-tracing(event)`

Die Rust-API installiert einen `tracing`-Subscriber und bietet direkte Log-Level-Helfer.

Host-Status: implementiert.

## Block Entity

`block-entity.wit` bietet Signaturen fuer:

- allgemeine Block-Entity-Daten
- Command-Block-Daten

Host-Status: nicht produktiv nutzbar. `block_entity.rs` besteht fuer die sichtbaren Funktionen aktuell aus `todo!()`-Implementierungen.

Fuer die Doku:

- Als "declared but not implemented" markieren.
- Nicht in interaktiven Tools als lauffaehig ausgeben.

## Direkt sinnvolle Website-Tools

Sehr sinnvoll und durch aktuellen WASM-Stand gut abgedeckt:

- Title Generator: `show-title`, `show-subtitle`, `show-actionbar`, `send-title-animation`
- TextComponent/Tellraw Generator: Text, Farben, Styles, Hover, Click, Translations
- Sound Generator: `world.play-sound`
- Particle Generator: `world.spawn-particle`
- Player Ability Generator: Fly-Speed, Walk-Speed, Flying, Allow-Flying
- Gamemode/Health/Food/XP Helper
- Teleport Command Generator
- Scheduler/Countdown Generator
- Scoreboard/Sidebar Generator
- Team Generator
- GUI/Inventory Layout Generator fuer statische Menues
- Weather/Time Tool
- Block State Tool
- Permission Generator
- Event Listener Snippet Generator
- Command Tree Generator

Nur eingeschraenkt sinnvoll:

- Explosion Generator, weil `create-fire` und `interaction` im Host aktuell ignoriert werden.
- GUI Interaction Generator, weil sichtbare GUI-Click-Events fehlen.
- Block Entity / Command Block Tool, weil Host-Funktionen `todo!()` sind.
- Command Requirement Generator, weil `require-with-handler-id` `todo!()` ist.
- CommandSenderType-Demo, weil `get-command-sender-type` `todo!()` ist.

## Empfohlene Architektur fuer PumpkinAPI-docs

Die neue Seite sollte nicht wie der alte statische Beispiel-JavaDoc-Prototyp aufgebaut werden. Besser:

- Doku-Datenmodell aus WIT ableiten.
- Pro API-Eintrag Status speichern: `implemented`, `partial`, `declared-only`, `host-todo`, `docs-unclear`.
- Links auf GitHub-Datei und Zeile/Interface speichern.
- W3Schools-artige Seitenstruktur: "Tutorial", "API Reference", "Examples", "Try/Generate".
- Tools als eigene Generatorseiten, die Rust/WASM-Snippets erzeugen.
- Datenquelle spaeter automatisieren: GitHub-Commit ziehen, WIT parsen, Host-Code nach `todo!()` und bekannten Limitierungen scannen.

## Naechster Umsetzungsschritt

Als erstes sollte ein statisches Frontend entstehen mit:

- Startseite mit aktuellem Commit/Stand
- API Reference aus kuratierten JSON-Daten
- Title Generator
- TextComponent Generator
- Command Snippet Generator
- Status-Badges fuer implementierte und eingeschraenkte APIs

Danach koennen wir den WIT-Parser/Importer bauen, damit die Doku beim naechsten Pumpkin-API-Sprung nicht wieder manuell veraltet.
