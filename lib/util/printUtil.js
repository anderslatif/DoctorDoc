import Table from "cli-table";


export function printTable(header, rows) {
    
    const table = new Table({
        head: header,
    });
    
    table.push(...rows);
    
    console.log(table.toString());
}

export function printHeader(headerMessage) {
    const terminalWidth = process.stdout.columns;
    const headerText = ` ${headerMessage} `;
    const headerPaddingLength = Math.floor((terminalWidth - headerText.length) / 2);
    const quarterHeaderPadding = '='.repeat(headerPaddingLength / 2);
    
    console.log(quarterHeaderPadding + headerText.bgGrey.black + quarterHeaderPadding.repeat(3));
}

export function printErrorMessage(message) {
    console.error(message.bold.underline.red);
}

