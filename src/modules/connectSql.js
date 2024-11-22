import * as mysql from "mysql2";

const connectSql = mysql.createConnection({
    host:"localhost",
    user:"root",
    password:"",
    database:"taxi"
})
export { connectSql }