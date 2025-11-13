const sql = require('mssql');

const connectionString = "server=. ;Database=Jason;Trusted Connection=Yes;Driver={SQL Server Native Client ll.ø)";

const query = "";

sql.query(connectionstring, query, (err, rows) => {

    console. log (rows) ;
    
});