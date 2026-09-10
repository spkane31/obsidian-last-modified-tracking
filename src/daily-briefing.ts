export interface UpdatedDocument {
	path: string;
	displayName: string;
}

const sectionStart = '<!-- last-modified-tracking:start -->';
const sectionEnd = '<!-- last-modified-tracking:end -->';

/** Builds the vault-relative path for a dated daily briefing. */
export function buildDailyBriefingPath(folder: string, datedPath: string): string {
	const normalizedFolder = folder.replace(/^\/+|\/+$/g, '');
	return `${normalizedFolder}/${datedPath}.md`;
}

/** Builds wiki links suitable for an Obsidian list property. */
export function buildUpdatedDocumentLinks(documents: UpdatedDocument[]): string[] {
	return documents.map((document) => `[[${removeMarkdownExtension(document.path)}|${document.displayName}]]`);
}

/** Removes the generated section used by plugin versions before the list property. */
export function removeUpdatedDocumentsSection(contents: string): string {
	const existingSection = new RegExp(`\\n?${escapeRegExp(sectionStart)}[\\s\\S]*?${escapeRegExp(sectionEnd)}\\n?`);
	if (!existingSection.test(contents)) {
		return contents;
	}

	return contents.replace(existingSection, '\n').trimEnd() + '\n';
}

function removeMarkdownExtension(path: string): string {
	return path.endsWith('.md') ? path.slice(0, -3) : path;
}

function escapeRegExp(value: string): string {
	return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
