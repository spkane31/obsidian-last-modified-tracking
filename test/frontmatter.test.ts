import assert from 'node:assert/strict';
import test from 'node:test';

import { sortFrontmatterKeys } from '../src/frontmatter.ts';

test('sorts frontmatter keys alphabetically while preserving values', () => {
	const frontmatter: Record<string, unknown> = {
		title: 'Note',
		last_modified: '2024-01-02T03:04:05',
		created: '2024-01-01T00:00:00',
		status: 'active',
	};

	sortFrontmatterKeys(frontmatter);

	assert.deepEqual(Object.keys(frontmatter), ['created', 'last_modified', 'status', 'title']);
	assert.equal(frontmatter.created, '2024-01-01T00:00:00');
	assert.equal(frontmatter.last_modified, '2024-01-02T03:04:05');
	assert.equal(frontmatter.status, 'active');
	assert.equal(frontmatter.title, 'Note');
});
