/**
 * Reorders a frontmatter object's own keys alphabetically, in place.
 *
 * `processFrontMatter` writes properties back out in object key order, so
 * this is how we keep a note's properties sorted after an update.
 */
export function sortFrontmatterKeys(frontmatter: Record<string, unknown>): void {
	const sortedEntries = Object.keys(frontmatter)
		.sort((a, b) => a.localeCompare(b))
		.map((key) => [key, frontmatter[key]] as const);

	for (const key of Object.keys(frontmatter)) {
		delete frontmatter[key];
	}

	for (const [key, value] of sortedEntries) {
		frontmatter[key] = value;
	}
}
