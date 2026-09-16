import postgres from "postgres";

const sql = postgres(process.env.DATABASE_URL!, { max: 1 });
const r = await sql`select column_name, is_nullable from information_schema.columns where table_name='users' order by ordinal_position`;
console.log(r);
await sql.end();
