# Releasing Client Manager (auto-update via GitHub Releases)

Installed copies of Client Manager (NSIS installer) check
`https://github.com/jonasabbad/ClientManagerDesktop/releases` on startup, about 5 s after
launch, and from **Paramètres → Mises à jour → Rechercher des mises à jour**. A newer
release is downloaded in the background with a progress bar. The user is then
asked to restart; if they choose **Plus tard**, it installs the next time they quit.

## One-time prerequisites

1. **The repository's releases must be publicly downloadable.** The app downloads
   `latest.yml` and the installer anonymously and does **not** ship a GitHub token.
   For a private source repo, publish releases to a separate public repo and
   change `publish.repo` in `electron-builder.yml`.
2. **The code must be pushed to `jonasabbad/ClientManagerDesktop`**, including
   `.github/workflows/release.yml`, if you use the automated workflow.
3. **Users on 1.0.1 or older must install the first auto-update-enabled version
   manually, once.** Those builds don't include the updater. Every later version
   is picked up automatically.

## Every release (automated, recommended)

1. Bump the version (this also commits and tags when run in a git repo):

   ```bash
   npm version patch        # 1.0.2 -> 1.0.3 (use minor/major as needed)
   ```

   Without git, edit `"version"` in `package.json` by hand.

2. Push the commit and the tag:

   ```bash
   git push --follow-tags
   ```

3. GitHub Actions (`Release` workflow) checks that the tag matches `package.json`,
   then builds the NSIS installer and publishes these to the release `v<version>`:
   - `Client-Manager-Setup-<version>.exe`: the installer
   - `Client-Manager-Setup-<version>.exe.blockmap`: enables differential downloads
   - `latest.yml`: the update metadata installed apps read
   - `Client-Manager-Portable-<version>.exe`: optional, does not auto-update

4. Check the release page and confirm it contains `latest.yml`. It must be a
   published (not draft, not pre-release) release.

## Every release (manual, from this PC)

```powershell
# 1. bump "version" in package.json, then:
$env:GH_TOKEN = "<a token with repo scope; never commit it>"
npm run release
Remove-Item Env:GH_TOKEN
```

`npm run release` builds and uploads the same files as the workflow. `npm run dist`
builds into `dist/` without publishing.

## Verifying a release

1. On a PC running the **previous** version, open the app and wait about 10 s, or
   go to Paramètres → Mises à jour → Rechercher des mises à jour.
2. A bottom-right card shows the download progress, then a dialog asks to restart.
3. Click **Redémarrer et installer**. The app closes, installs silently and reopens.
4. Paramètres shows the new version, and all clients, codes and Glovo riders are
   still present.
5. If something fails, see `%APPDATA%\Client Manager\logs\updater.log`.

## Data safety

- The database is `%APPDATA%\Client Manager\data\client-manager.db`, outside the
  install folder. Updates replace only program files, and
  `deleteAppDataOnUninstall: false` keeps the data even when the old version's
  uninstaller runs during the update.
- Before installing, the app waits for any running backup, restore or export to
  finish, then closes the database (flushing the WAL) before quitting.
- Do **not** change `appId`, `nsis.guid`, `productName` or `app.name` in
  `src/main/main.ts`. Changing them would make the new version install side by
  side and/or look for the database in a different folder.
