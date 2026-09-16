import assert from 'node:assert/strict';
import test from 'node:test';

import {
	DEFAULT_DAILY_BRIEFING_FOLDER,
	buildDailyBriefingPath,
	buildUpdatedDocumentLinks,
	shouldIncludeUpdatedDocument,
	removeUpdatedDocumentsSection,
} from '../src/daily-briefing.ts';

test('builds a nested year/month/day daily briefing path', () => {
	assert.equal(
		buildDailyBriefingPath(DEFAULT_DAILY_BRIEFING_FOLDER, '2026/09/10'),
		'00_Inbox/Daily Notes/2026/09/10.md',
	);
});

test('renders updated documents as wiki links for a frontmatter list property', () => {
	const links = buildUpdatedDocumentLinks(
		[
			{ path: 'Projects/Alpha.md', displayName: 'Alpha' },
			{ path: 'Ideas.md', displayName: 'Ideas' },
		],
	);

	assert.deepEqual(links, ['[[Projects/Alpha|Alpha]]', '[[Ideas|Ideas]]']);
});

test('excludes documents under 06_Metadata from updated documents', () => {
	assert.equal(shouldIncludeUpdatedDocument('06_Metadata/Templates/Daily.md', 'Daily Notes/2026/09/15.md'), false);
	assert.equal(shouldIncludeUpdatedDocument('06_Metadata.md', 'Daily Notes/2026/09/15.md'), true);
	assert.equal(shouldIncludeUpdatedDocument('06_Metadata-Archive/Note.md', 'Daily Notes/2026/09/15.md'), true);
});

test('removes the legacy managed section without touching user authored content', () => {
	const existing = '# Morning briefing\n\nMy priorities\n\n<!-- last-modified-tracking:start -->\n## Documents updated\n\n- stale\n<!-- last-modified-tracking:end -->\n';

	assert.equal(
		removeUpdatedDocumentsSection(existing),
		'# Morning briefing\n\nMy priorities\n',
	);
});
