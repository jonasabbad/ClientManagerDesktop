# Client Manager

A Windows desktop app for payment and service agencies to manage clients, service codes and Glovo riders.
Everything is stored locally in SQLite, and the app updates itself from GitHub Releases.

Built with Electron, React, TypeScript, Material UI and SQLite (better-sqlite3). The interface is in French and Arabic (RTL).

## Features

- **Dashboard**: totals, new clients today, codes per service, recent clients and activity.
- **Clients**: create, edit and search clients (name, phone, CIN, notes), each with its own service codes.
- **Services & Tarifs**: service categories and subcategories with custom fields for service codes.
- **Glovo riders**: a separate module for riders. In a profile's Résumé, click the rider ID to copy it ("Copié !").
- **Global search** across clients, codes and riders.
- **Printing** of a client's or rider's service codes.
- **Journal d'activité**: log of every change.
- **Sauvegarde**: backup and restore of the database, plus export to Excel, CSV and PDF.
- **Paramètres**: dark/light theme, French/Arabic, and **Mises à jour** to check for a new version.
- **Automatic updates**: new versions download in the background and install after a restart.

## Install

1. Download `Client-Manager-Setup-<version>.exe` from the
   [latest release](https://github.com/jonasabbad/ClientManagerDesktop/releases/latest).
2. Run it and follow the installer.
   Windows may warn about an unknown publisher because the installer isn't code-signed: click **More info → Run anyway**.

Later versions install themselves: the app checks for updates at startup, downloads them, and asks you to restart.
You can also check manually under **Paramètres → Mises à jour**.

> Versions 1.0.1 and older have no updater. Install 1.0.2 or later manually once; it updates itself after that.

A portable `.exe` is also published. It runs without installing but **does not update itself**.

## Your data

| What | Where |
|---|---|
| Database | `%APPDATA%\Client Manager\data\client-manager.db` |
| Update log | `%APPDATA%\Client Manager\logs\updater.log` |

The database is kept through updates and uninstalls. Make regular backups with **Sauvegarde → Sauvegarder la Base**.

## Development

Requires Node.js 20+ on Windows.

```bash
npm install          # also rebuilds better-sqlite3 for Electron
npm run dev          # start the app with hot reload
npm run typecheck    # TypeScript checks (main + renderer)
npm run dist         # build the installer into dist/ without publishing
```

Updates are disabled in `npm run dev`. They only run in an installed (NSIS) build.

### Project structure

```
src/
  main/            Electron main process
    database/      SQLite connection, migrations, critical-operation lock
    repositories/  SQL queries
    services/      business logic, backup/export, auto-updater
    ipc/           IPC handlers exposed to the renderer
  preload/         secure bridge: window.api
  renderer/        React UI (pages, components, i18n, theme)
  shared/          types and IPC channel names shared by both sides
electron-builder.yml          installer and GitHub publish settings
.github/workflows/release.yml builds and publishes a release when a v* tag is pushed
```

## Releasing

Short version: bump `version` in `package.json`, commit, then push a matching tag:

```bash
git tag v1.0.3
git push origin main v1.0.3
```

GitHub Actions builds the installer and publishes it with `latest.yml` to the release, and installed apps pick it up.
See [RELEASING.md](RELEASING.md) for the full process, publishing manually, and checking a release.

## License

MIT
