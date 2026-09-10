import assert from 'node:assert/strict';
import test from 'node:test';

import { formatDateTime } from '../src/date-time.ts';

test('stores a local Obsidian Date & time value with seconds', () => {
	const timestamp = { format: (format: string) => format === 'YYYY-MM-DD[T]HH:mm:ss' ? '2026-09-10T12:42:05' : '' };

	assert.equal(formatDateTime(timestamp), '2026-09-10T12:42:05');
});
