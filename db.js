import mysql from "mysql2/promise";

// You MUST have the word 'export' here so moods.js can see it
export const db = await mysql.createPool({
  host: "127.0.0.1",
  user: "root",
  password: "", // XAMPP default is empty
  database: "mood_db",
  port: 3306
});

console.log("💎 Database Pool Exported");