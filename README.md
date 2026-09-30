# Last Modified Tracking

An Obsidian plugin that records `created` and `last_modified` Date & time properties.

## Behavior

- A newly created Markdown note receives both properties as Obsidian `Date & time` values, stored as `YYYY-MM-DDTHH:mm:ss`.
- Explicit user edits queue a `last_modified` update until you navigate away from that note. Git/sync-driven editor reloads are ignored, and frontmatter is never written into an active editor buffer, avoiding Obsidian's external-modification merge warning.

## Development

```sh
npm install
npm test
npm run build
```

To use the plugin in a vault during development, copy `manifest.json` and the generated `main.js` into `.obsidian/plugins/last-modified-tracking/`, then enable it in Obsidian's Community plugins settings.

## Settings

The property names are configurable. On startup, the plugin converts recognized legacy timestamps before registering the Date & time property type; **Migrate tracking properties to Date & time** remains available from the Command palette for a manual retry.

## Deployment

Run `make deploy` to build and install the current plugin into the configured local vault.

1. Build:

```sh
npm run build
```

2. Find your vault folder—the directory containing .obsidian—then install the built files:

```sh
mkdir -p "/path/to/your/vault/.obsidian/plugins/last-modified-tracking"
cp main.js manifest.json "/path/to/your/vault/.obsidian/plugins/last-modified-tracking/"
```

3. In Obsidian, open Settings → Community plugins, enable community plugins if needed, then enable Last Modified Tracking. Restart Obsidian or toggle the plugin off/on if it does not appear immediately.

4. Create or edit a Markdown note, then navigate away from it. It should have:

---
created: 2026-09-10T09:00:00
last_modified: 2026-09-10T09:01:00
---
