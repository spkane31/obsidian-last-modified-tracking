OBSIDIAN_PLUGIN_DIR := /Users/sean.kane/Documents/Obsidian Vault/.obsidian/plugins/last-modified-tracking

.PHONY: deploy

deploy:
	npm run build
	mkdir -p "$(OBSIDIAN_PLUGIN_DIR)"
	cp main.js manifest.json "$(OBSIDIAN_PLUGIN_DIR)/"
