import { App, PluginSettingTab, Setting } from 'obsidian';

import type LastModifiedTrackingPlugin from './main';

export interface LastModifiedTrackingSettings {
	createdProperty: string;
	lastModifiedProperty: string;
	dailyBriefingFolder: string;
	dailyBriefingDateFormat: string;
	updateDelayMs: number;
}

export const DEFAULT_SETTINGS: LastModifiedTrackingSettings = {
	createdProperty: 'created',
	lastModifiedProperty: 'last_modified',
	dailyBriefingFolder: 'daily-briefing',
	dailyBriefingDateFormat: 'YYYY/MM/DD',
	updateDelayMs: 1000,
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
		this.addTextSetting('Daily briefing folder', 'Folder containing briefing notes. The default is daily-briefing.', 'dailyBriefingFolder');
		this.addTextSetting('Daily briefing path format', 'MomentJS path format beneath the briefing folder, without .md.', 'dailyBriefingDateFormat');

		new Setting(containerEl)
			.setName('Update delay (milliseconds)')
			.setDesc('Wait briefly after typing to avoid an Obsidian merge prompt.')
			.addText((text) => text
				.setValue(String(this.plugin.settings.updateDelayMs))
				.onChange(async (value) => {
					const parsed = Number.parseInt(value, 10);
					this.plugin.settings.updateDelayMs = Number.isFinite(parsed) && parsed >= 0 ? parsed : DEFAULT_SETTINGS.updateDelayMs;
					await this.plugin.saveSettings();
				}),
			);
	}

	private addTextSetting(
		name: string,
		description: string,
		key: Exclude<keyof LastModifiedTrackingSettings, 'updateDelayMs'>,
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
