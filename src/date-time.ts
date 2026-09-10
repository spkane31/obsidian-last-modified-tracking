export const DATE_TIME_FORMAT = 'YYYY-MM-DD[T]HH:mm:ss';

interface FormattableDateTime {
	format(format: string): string;
}

interface ParsedDateTime extends FormattableDateTime {
	isValid(): boolean;
}

/** Formats a timestamp in Obsidian's Date & time frontmatter representation. */
export function formatDateTime(timestamp: FormattableDateTime): string {
	return timestamp.format(DATE_TIME_FORMAT);
}

/**
 * Converts a recognized legacy timestamp only when its stored representation
 * differs from Obsidian's Date & time representation.
 */
export function normalizeDateTimeProperty(
	value: unknown,
	parse: (value: string) => ParsedDateTime,
): string | undefined {
	const stringValue = String(value ?? '');
	const parsed = parse(stringValue);
	if (!parsed.isValid()) {
		return undefined;
	}

	const normalized = formatDateTime(parsed);
	return stringValue === normalized ? undefined : normalized;
}
