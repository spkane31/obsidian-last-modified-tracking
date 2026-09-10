import { Notice, Plugin, TAbstractFile, TFile, moment } from 'obsidian';
import type { Moment } from 'moment';

import { DATE_TIME_FORMAT, formatDateTime, normalizeDateTimeProperty } from './date-time';
import {
	buildDailyBriefingPath,
	buildUpdatedDocumentLinks,
	removeUpdatedDocumentsSection,
	type UpdatedDocument,
} from './daily-briefing';
import { updatePropertyTypes } from './property-types';
import {
	DEFAULT_SETTINGS,
	LastModifiedTrackingSettingTab,
	type LastModifiedTrackingSettings,
} from './settings';

// Obsidian exposes Moment at runtime, but its current declaration is a namespace
// rather than Moment's callable factory type.
const createMoment = moment as unknown as {
	(): Moment;
	(input: string): Moment;
	(input: string, format: string, strict: boolean): Moment;
};

const LEGACY_DATE_TIME_FORMAT = 'MMM D, YYYY h:mm A';
const UPDATED_DOCUMENTS_PROPERTY = 'updated_documents';

export default class LastModifiedTrackingPlugin extends Plugin {
	settings: LastModifiedTrackingSettings = DEFAULT_SETTINGS;

	private readonly timers = new Map<string, number>();
	private readonly ignoredChangesThrough = new Map<string, number>();
	private readonly filesBeingUpdated = new Set<string>();

	async onload(): Promise<void> {
		await this.loadSettings();
		const migrated = await this.migrateTrackingProperties(false);
		await this.ensurePropertyTypes();
		if (migrated > 0) {
			new Notice(`Migrated tracking timestamps in ${migrated} note${migrated === 1 ? '' : 's'}.`);
		}

		this.registerEvent(this.app.vault.on('create', (file) => {
			if (isMarkdownFile(file)) {
				void this.initializeNewNote(file);
			}
		}));

		this.registerEvent(this.app.workspace.on('editor-change', (_editor, view) => {
			if (view.file instanceof TFile && this.shouldTrack(view.file)) {
				this.scheduleLastModifiedUpdate(view.file);
			}
		}));

		this.addCommand({
			id: 'refresh-todays-daily-briefing',
			name: "Refresh today's daily briefing",
			callback: () => this.refreshDailyBriefing(createMoment()),
		});
		this.addCommand({
			id: 'migrate-tracking-properties-to-date-time',
			name: 'Migrate tracking properties to Date & time',
			callback: () => this.migrateTrackingProperties(),
		});

		this.addSettingTab(new LastModifiedTrackingSettingTab(this.app, this));
	}

	onunload(): void {
		for (const timer of this.timers.values()) {
			window.clearTimeout(timer);
		}
	}

	async loadSettings(): Promise<void> {
		this.settings = { ...DEFAULT_SETTINGS, ...await this.loadData() };
	}

	async saveSettings(): Promise<void> {
		await this.saveData(this.settings);
	}

	private async initializeNewNote(file: TFile): Promise<void> {
		const now = createMoment();
		await this.updateFrontmatter(file, now, false);
		await this.refreshDailyBriefing(now);
	}

	private scheduleLastModifiedUpdate(file: TFile): void {
		const ignoredUntil = this.ignoredChangesThrough.get(file.path) ?? 0;
		if (this.filesBeingUpdated.has(file.path) || ignoredUntil > Date.now()) {
			return;
		}

		const existingTimer = this.timers.get(file.path);
		if (existingTimer !== undefined) {
			window.clearTimeout(existingTimer);
		}

		const timer = window.setTimeout(() => {
			this.timers.delete(file.path);
			void this.recordModification(file);
		}, this.settings.updateDelayMs);
		this.timers.set(file.path, timer);
	}

	private async recordModification(file: TFile): Promise<void> {
		if (!this.shouldTrack(file)) {
			return;
		}

		const now = createMoment();
		await this.updateFrontmatter(file, now, true);
		await this.refreshDailyBriefing(now);
	}

	private async updateFrontmatter(file: TFile, timestamp: Moment, overwriteLastModified: boolean): Promise<void> {
		this.filesBeingUpdated.add(file.path);
		this.ignoredChangesThrough.set(file.path, Date.now() + 2_000);

		try {
			await this.app.fileManager.processFrontMatter(file, (frontmatter) => {
				const normalizedCreated = normalizeDateTimeProperty(
					frontmatter[this.settings.createdProperty],
					(value) => this.parseDateTime(value),
				);
				if (normalizedCreated !== undefined) {
					frontmatter[this.settings.createdProperty] = normalizedCreated;
				} else if (!frontmatter[this.settings.createdProperty]) {
					frontmatter[this.settings.createdProperty] = formatDateTime(timestamp);
				}

				if (overwriteLastModified || !frontmatter[this.settings.lastModifiedProperty]) {
					frontmatter[this.settings.lastModifiedProperty] = formatDateTime(timestamp);
				}
			});
		} finally {
			this.filesBeingUpdated.delete(file.path);
		}
	}

	private async refreshDailyBriefing(day: Moment): Promise<void> {
		const briefing = this.app.vault.getAbstractFileByPath(this.dailyBriefingPath(day));
		if (!(briefing instanceof TFile)) {
			return;
		}

		const documents = buildUpdatedDocumentLinks(this.updatedDocumentsForDay(day, briefing.path));
		const current = this.app.metadataCache.getFileCache(briefing)?.frontmatter?.[UPDATED_DOCUMENTS_PROPERTY];
		if (!sameStringArray(current, documents)) {
			this.ignoredChangesThrough.set(briefing.path, Date.now() + 2_000);
			await this.app.fileManager.processFrontMatter(briefing, (frontmatter) => {
				frontmatter[UPDATED_DOCUMENTS_PROPERTY] = documents;
			});
		}

		const contents = await this.app.vault.read(briefing);
		const updatedContents = removeUpdatedDocumentsSection(contents);
		if (contents !== updatedContents) {
			this.ignoredChangesThrough.set(briefing.path, Date.now() + 2_000);
			await this.app.vault.modify(briefing, updatedContents);
		}
	}

	private updatedDocumentsForDay(day: Moment, briefingPath: string): UpdatedDocument[] {
		return this.app.vault.getMarkdownFiles()
			.filter((file) => file.path !== briefingPath)
			.flatMap((file) => {
				const value = this.app.metadataCache.getFileCache(file)?.frontmatter?.[this.settings.lastModifiedProperty];
				const parsed = this.parseDateTime(value);
				if (!parsed.isValid() || !parsed.isSame(day, 'day')) {
					return [];
				}

				return [{ path: file.path, displayName: file.basename, timestamp: parsed.valueOf() }];
			})
			.sort((a, b) => b.timestamp - a.timestamp)
			.map(({ path, displayName }) => ({ path, displayName }));
	}

	private dailyBriefingPath(day: Moment): string {
		return buildDailyBriefingPath(this.settings.dailyBriefingFolder, day.format(this.settings.dailyBriefingDateFormat));
	}

	private parseDateTime(value: unknown): Moment {
		const stringValue = String(value ?? '');
		const dateTime = createMoment(stringValue, DATE_TIME_FORMAT, true);
		return dateTime.isValid() ? dateTime : createMoment(stringValue, LEGACY_DATE_TIME_FORMAT, true);
	}

	private async ensurePropertyTypes(): Promise<void> {
		const path = `${this.app.vault.configDir}/types.json`;
		const requiredTypes = {
			[this.settings.createdProperty]: 'datetime',
			[this.settings.lastModifiedProperty]: 'datetime',
			[UPDATED_DOCUMENTS_PROPERTY]: 'multitext',
		} as const;

		try {
			const adapter = this.app.vault.adapter;
			if (await adapter.exists(path)) {
				await adapter.process(path, (contents) => updatePropertyTypes(contents, requiredTypes));
			} else {
				await adapter.write(path, updatePropertyTypes('{"types": {}}', requiredTypes));
			}
		} catch (error) {
			console.warn('Last Modified Tracking could not register Obsidian property types.', error);
		}
	}

	private async migrateTrackingProperties(notify = true): Promise<number> {
		let migrated = 0;
		for (const file of this.app.vault.getMarkdownFiles()) {
			const frontmatter = this.app.metadataCache.getFileCache(file)?.frontmatter;
			const created = normalizeDateTimeProperty(
				frontmatter?.[this.settings.createdProperty],
				(value) => this.parseDateTime(value),
			);
			const lastModified = normalizeDateTimeProperty(
				frontmatter?.[this.settings.lastModifiedProperty],
				(value) => this.parseDateTime(value),
			);
			if (created === undefined && lastModified === undefined) {
				continue;
			}

			await this.app.fileManager.processFrontMatter(file, (properties) => {
				if (created !== undefined) properties[this.settings.createdProperty] = created;
				if (lastModified !== undefined) properties[this.settings.lastModifiedProperty] = lastModified;
			});
			migrated++;
		}

		if (notify) {
			new Notice(`Migrated tracking timestamps in ${migrated} note${migrated === 1 ? '' : 's'}.`);
		}

		return migrated;
	}

	private shouldTrack(file: TFile): boolean {
		return file.extension === 'md';
	}
}

function isMarkdownFile(file: TAbstractFile): file is TFile {
	return file instanceof TFile && file.extension === 'md';
}

function sameStringArray(value: unknown, expected: string[]): boolean {
	return Array.isArray(value) && value.length === expected.length && value.every((item, index) => item === expected[index]);
}
