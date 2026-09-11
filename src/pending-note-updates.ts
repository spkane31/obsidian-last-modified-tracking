export interface PendingNoteUpdate {
	path: string;
	overwriteLastModified: boolean;
}

/** Holds user edits until their note is no longer the active editor file. */
export class PendingNoteUpdates {
	private readonly updates = new Map<string, boolean>();

	markCreated(path: string): void {
		if (!this.updates.has(path)) {
			this.updates.set(path, false);
		}
	}

	markModified(path: string): void {
		this.updates.set(path, true);
	}

	takeInactive(activePath: string | null): PendingNoteUpdate[] {
		const inactive: PendingNoteUpdate[] = [];
		for (const [path, overwriteLastModified] of this.updates) {
			if (path === activePath) {
				continue;
			}

			this.updates.delete(path);
			inactive.push({ path, overwriteLastModified });
		}

		return inactive;
	}
}
