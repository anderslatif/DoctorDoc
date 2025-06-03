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

	const dayMatch = fileContent.match(/\*\*Taught on\*\*:\s*(\w+)/);
	if (!dayMatch) {
        printErrorMessage('In order to validate the dates, the file must contain a line with "**Taught on**: <day of the week>".');
        return;
    }

	const targetWeekday = weekdayMap[dayMatch[1]];
	if (targetWeekday === undefined) return;

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

		if (parsedDate.getDay() !== targetWeekday) {
			printHeader(' Date Weekday Mismatch ');
			printTable([], [
				["File:".underline.cyan, filename.bgMagenta.white],
				["Date:".underline.cyan, dateString],
				["Expected weekday:".underline.cyan, dayMatch[1]]
			]);
		}
	}
}