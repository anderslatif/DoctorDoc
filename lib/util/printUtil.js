import Table from "cli-table";


export function printTable(header, rows) {
    
    const table = new Table({
        head: header,
    });
    
    table.push(...rows);
    
    console.log(table.toString());
}

export function printErrorMessage(message) {
    console.error(message.bold.underline.red);
}
