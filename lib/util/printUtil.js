import Table from "cli-table";


export function printTable(header, rows) {

    const cellBorderWidth = 1;
    
    const table = new Table({
        head: header,
    });
    
    table.push(...rows);
    
    console.log(table.toString());
}