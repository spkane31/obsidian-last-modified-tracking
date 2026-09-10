import assert from 'node:assert/strict';
import test from 'node:test';

import { formatDateTime, normalizeDateTimeProperty } from '../src/date-time.ts';

test('stores a local Obsidian Date & time value with seconds', () => {
	const timestamp = { format: (format: string) => format === 'YYYY-MM-DD[T]HH:mm:ss' ? '2026-09-10T12:42:05' : '' };

	assert.equal(formatDateTime(timestamp), '2026-09-10T12:42:05');
});

test('normalizes legacy timestamp text once and leaves invalid values alone', () => {
	const validTimestamp = {
		isValid: () => true,
		format: () => '2026-09-10T12:42:05',
	};
	const invalidTimestamp = {
		isValid: () => false,
		format: () => '',
	};

	assert.equal(normalizeDateTimeProperty('Sep 10, 2026 12:42 PM', () => validTimestamp), '2026-09-10T12:42:05');
	assert.equal(normalizeDateTimeProperty('2026-09-10T12:42:05', () => validTimestamp), undefined);
	assert.equal(normalizeDateTimeProperty('not a date', () => invalidTimestamp), undefined);
});
