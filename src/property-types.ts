export type ObsidianPropertyType = 'datetime';

/**
 * Adds or updates entries in Obsidian's vault-wide property type registry.
 *
 * The registry is stored as `{ "types": { "property": "type" } }` in
 * `.obsidian/types.json` (or the vault's configured equivalent).
 */
export function updatePropertyTypes(contents: string, requiredTypes: Record<string, ObsidianPropertyType>): string {
	const parsed: unknown = JSON.parse(contents);
	if (!isRecord(parsed)) {
		throw new Error('Obsidian property type registry must be a JSON object.');
	}

	const existingTypes = parsed.types;
	if (existingTypes !== undefined && !isRecord(existingTypes)) {
		throw new Error('Obsidian property type registry has an invalid types entry.');
	}

	const types = { ...(existingTypes ?? {}) } as Record<string, unknown>;
	let changed = false;
	for (const [property, type] of Object.entries(requiredTypes)) {
		if (types[property] !== type) {
			types[property] = type;
			changed = true;
		}
	}

	if (!changed) {
		return contents;
	}

	return `${JSON.stringify({ ...parsed, types }, null, 2)}\n`;
}

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null && !Array.isArray(value);
}
