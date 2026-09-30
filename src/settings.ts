import { App, PluginSettingTab, Setting } from 'obsidian';

import type LastModifiedTrackingPlugin from './main';

export interface LastModifiedTrackingSettings {
	createdProperty: string;
	lastModifiedProperty: string;
}

export const DEFAULT_SETTINGS: LastModifiedTrackingSettings = {
	createdProperty: 'created',
	lastModifiedProperty: 'last_modified',
};

export class LastModifiedTrackingSettingTab extends PluginSettingTab {
	constructor(app: App, private readonly plugin: LastModifiedTrackingPlugin) {
		super(app, plugin);
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();

		containerEl.createEl('h2', { text: 'Last modified tracking' });

		this.addTextSetting('Created property', 'Date & time property added when a note is first created.', 'createdProperty');
		this.addTextSetting('Last modified property', 'Date & time property updated after you edit a note.', 'lastModifiedProperty');
	}

	private addTextSetting(
		name: string,
		description: string,
		key: keyof LastModifiedTrackingSettings,
	): void {
		new Setting(this.containerEl)
			.setName(name)
			.setDesc(description)
			.addText((text) => text
				.setValue(this.plugin.settings[key] as string)
				.onChange(async (value) => {
					this.plugin.settings[key] = value.trim() as never;
					await this.plugin.saveSettings();
				}),
			);
	}
}
