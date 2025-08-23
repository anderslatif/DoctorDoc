import { printHeader, printTable, printErrorMessage } from "../util/printUtil.js";

export function adocValidateDates(adocFilePaths) {
    for (const file of adocFilePaths) {
        validateDatesInASingleAdocFile(file);
    }
}

function validateDatesInASingleAdocFile({ filename, fullPath, directory, fileContent }) {
	const currentYear = new Date().getFullYear();
	const weekdayMap = {
		Sunday: 0,
		Monday: 1,
		Tuesday: 2,
		Wednesday: 3,
		Thursday: 4,
		Friday: 5,
		Saturday: 6,
	};

	const taughtOnMatch = fileContent.match(/\*\*Taught on\*\*:\s*([^\n]+)/);
	if (!taughtOnMatch) {
        return;
    }

	if (taughtOnMatch[1].toLowerCase().trim() === 'ignore') {
		return;
	}

	const days = taughtOnMatch[1].split(',').map(day => day.trim());
	const targetWeekdays = days.map((day) => weekdayMap[day]).filter((day) => day !== undefined);
	if (targetWeekdays.length === 0) {
		printErrorMessage('In order to validate the dates, the file must contain a line with "**Taught on**: <day of the week>".');
		return;
	}

	const dateRegex = /\|\s*(\w+\.*)\s+(\d{1,2})(?:st|nd|rd|th)?/g;
	let match;
	while ((match = dateRegex.exec(fileContent)) !== null) {
		let [_, monthRaw, dayStr] = match;
		const day = parseInt(dayStr, 10);

		let month = monthRaw.replace(/\./, '');
		let dateString = `${month} ${day}, ${currentYear}`;
		let parsedDate = new Date(dateString);

		if (isNaN(parsedDate)) {
			printHeader(' Invalid Date Format ');
			printTable([], [["File:".underline.cyan, filename.bgMagenta.white], ["Invalid text:".underline.cyan, match[0].italic]]);
			continue;
		}

		if (!targetWeekdays.includes(parsedDate.getDay())) {
			printHeader(' Date Weekday Mismatch ');
			printTable([], [
				["File:".underline.cyan, filename.bgMagenta.white],
				["Date:".underline.cyan, dateString],
				["Expected weekday(s):".underline.cyan, taughtOnMatch[1]]
			]);
		}
	}
}