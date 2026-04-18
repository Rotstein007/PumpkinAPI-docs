# PumpkinAPI-docs

Neues Dokumentations- und Tooling-Projekt fuer die aktuelle Pumpkin-WASM-Plugin-API.

Ziel:

- W3Schools-artige, praxisnahe API-Doku fuer Pumpkin-WASM-Plugins.
- Generator-Tools fuer Features, die die WASM-API direkt unterstuetzt.
- Keine Wiederverwendung des alten statischen PumpkinAPI-Editor-Modells als technische Quelle.

Aktuelle technische Grundlage:

- Pumpkin `master`
- Commit `a55c42c835ddd650338f35bc5e869d315e049f1a`
- WIT-Quelle: `pumpkin-plugin-wit/v0.1.0`
- Host-Abgleich: `pumpkin/src/plugin/loader/wasm/wasm_host/wit/v0_1_0`
- Rust-Wrapper: `pumpkin-plugin-api`

Research:

- [Aktueller WASM-API-Stand](docs/research/wasm-api-current.md)

Lokale Nutzung:

```bash
npm run build
```

Der Build validiert die kuratierten API-Daten und kopiert die statische Seite nach `dist/`.

Erste geplante Tools:

- Title Generator
- TextComponent / Tellraw Generator
- Command Tree Generator
- Scheduler / Countdown Generator
- GUI / Inventory Layout Generator
- Scoreboard Generator
- Sound / Particle Generator
- Player Ability Generator
