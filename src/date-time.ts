export const DATE_TIME_FORMAT = 'YYYY-MM-DD[T]HH:mm:ss';

interface FormattableDateTime {
	format(format: string): string;
}

/** Formats a timestamp in Obsidian's Date & time frontmatter representation. */
export function formatDateTime(timestamp: FormattableDateTime): string {
	return timestamp.format(DATE_TIME_FORMAT);
}
