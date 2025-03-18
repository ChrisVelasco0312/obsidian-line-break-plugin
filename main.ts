import { Plugin, Editor, MarkdownView } from "obsidian";

export default class LineBreakPlugin extends Plugin {
	async onload() {
		// Register editor-change event for all editors
		this.registerEvent(
			this.app.workspace.on(
				"editor-change",
				(editor: Editor, markdownView: MarkdownView) => {
					this.handleEditorChange(editor);
				},
			),
		);

		// No need to manually attach to existing editors; the event catches all changes
	}

	private handleEditorChange(editor: Editor) {
		const cursor = editor.getCursor();
		const lineNumber = cursor.line;
		const lineContent = editor.getLine(lineNumber);

		// Check if the current line has reached or exceeded 80 characters
		if (lineContent.length >= 80) {
			// Find last space before 80 characters for a clean break, if possible
			let breakPoint = 80;
			for (let i = 79; i >= 0; i--) {
				if (lineContent[i] === " ") {
					breakPoint = i + 1; // Break after the space
					break;
				}
			}

			// Split the line
			const currentLine = lineContent.substring(0, breakPoint).trimEnd();
			const nextLine = lineContent.substring(breakPoint).trimStart();

			// Replace the line with the split content
			editor.replaceRange(
				`${currentLine}\n${nextLine}`,
				{ line: lineNumber, ch: 0 },
				{ line: lineNumber, ch: lineContent.length },
			);

			// Calculate new cursor position relative to original offset
			const originalOffset = cursor.ch;
			const newCh =
				originalOffset >= breakPoint ? originalOffset - breakPoint : 0;
			editor.setCursor({ line: lineNumber + 1, ch: newCh });
		}
	}

	onunload() {
		// No additional cleanup needed; Obsidian handles event unregistering
	}
}
