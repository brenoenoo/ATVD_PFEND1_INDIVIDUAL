import mysql from 'mysql2/promise';

export function criarPool(){
    return mysql.createPool({
        host: process.env.DB_HOST,
        port: Number(process.env.DB_PORT),
        user: process.env.DB_USER,
        password: process.env.DB_PASS || '',
        database: process.env.DB_NAME,
        waitForConnections: true, // permite fila de espera para conexões quando o limite for atingido
        connectionLimit: 10, // limite máximo de conexões simultâneas
        queueLimit: 0 // limite da fila do waitForConnections, 0 significa sem limite
    })   
}