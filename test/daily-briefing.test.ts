import assert from 'node:assert/strict';
import test from 'node:test';

import {
	buildDailyBriefingPath,
	buildUpdatedDocumentLinks,
	removeUpdatedDocumentsSection,
} from '../src/daily-briefing.ts';

test('builds a nested year/month/day daily briefing path', () => {
	assert.equal(
		buildDailyBriefingPath('daily-briefing', '2026/09/10'),
		'daily-briefing/2026/09/10.md',
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

test('removes the legacy managed section without touching user authored content', () => {
	const existing = '# Morning briefing\n\nMy priorities\n\n<!-- last-modified-tracking:start -->\n## Documents updated\n\n- stale\n<!-- last-modified-tracking:end -->\n';

	assert.equal(
		removeUpdatedDocumentsSection(existing),
		'# Morning briefing\n\nMy priorities\n',
	);
});
