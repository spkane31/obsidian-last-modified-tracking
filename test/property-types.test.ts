import assert from 'node:assert/strict';
import test from 'node:test';

import { updatePropertyTypes } from '../src/property-types.ts';

test('registers timestamps as date & time properties', () => {
	const contents = JSON.stringify({ types: { status: 'text', created: 'text' } }, null, 2);

	assert.deepEqual(
		JSON.parse(updatePropertyTypes(contents, {
			created: 'datetime',
			last_modified: 'datetime',
		})),
		{
			types: {
				status: 'text',
				created: 'datetime',
				last_modified: 'datetime',
			},
		},
	);
});
