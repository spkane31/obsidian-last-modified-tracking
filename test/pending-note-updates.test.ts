import assert from 'node:assert/strict';
import test from 'node:test';

import { PendingNoteUpdates } from '../src/pending-note-updates.ts';

test('holds a note update until the note is no longer active', () => {
	const updates = new PendingNoteUpdates();
	updates.markCreated('Ideas.md');
	updates.markModified('Ideas.md');

	assert.deepEqual(updates.takeInactive('Ideas.md'), []);
	assert.deepEqual(updates.takeInactive('Daily.md'), [
		{ path: 'Ideas.md', overwriteLastModified: true },
	]);
	assert.deepEqual(updates.takeInactive('Daily.md'), []);
});
