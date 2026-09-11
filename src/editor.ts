import { PluginValue, ViewPlugin, type EditorView, type ViewUpdate } from '@codemirror/view';
import { editorInfoField, TFile } from 'obsidian';

import type LastModifiedTrackingPlugin from './main';

/** Reports explicit user edits while ignoring editor reloads from other plugins or sync. */
export function userChangeListenerExtension(plugin: LastModifiedTrackingPlugin) {
	return ViewPlugin.define((view) => new UserChangeListener(plugin, view));
}

class UserChangeListener implements PluginValue {
	constructor(
		private readonly plugin: LastModifiedTrackingPlugin,
		private readonly view: EditorView,
	) {}

	update(update: ViewUpdate): void {
		const file = this.view.state.field(editorInfoField).file;
		if (file instanceof TFile && isUserChange(update)) {
			this.plugin.queueUserModification(file);
		}
	}
}

function isUserChange(update: ViewUpdate): boolean {
	if (!update.docChanged || update.transactions.some((transaction) => transaction.isUserEvent('set'))) {
		return false;
	}

	return update.transactions.some((transaction) => (
		transaction.isUserEvent('input')
		|| transaction.isUserEvent('delete')
		|| transaction.isUserEvent('move')
	));
}
