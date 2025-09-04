import { config } from "dotenv";
import postgres from "postgres";

// Load environment variables
config({ path: ".env.local" });

async function nukeDatabase() {
  console.log("🚀 Starting database nuke operation...");

  // Create database connection
  const sql = postgres(process.env.DATABASE_URL!);

  try {
    // Get all table names from the database
    const tables = await sql`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public'
    `;

    if (tables.length === 0) {
      console.log("✅ No tables found to drop.");
      return;
    }

    console.log(`📋 Found ${tables.length} tables to drop:`);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    tables.forEach((table: any) => {
      console.log(`  - ${table.tablename}`);
    });

    // Disable foreign key checks temporarily
    await sql`SET session_replication_role = replica`;

    // Drop all tables
    for (const table of tables) {
      const tableName = table.tablename;
      console.log(`🗑️  Dropping table: ${tableName}`);
      await sql`DROP TABLE IF EXISTS ${sql(tableName)} CASCADE`;
    }

    // Re-enable foreign key checks
    await sql`SET session_replication_role = DEFAULT`;

    console.log("✅ All tables have been dropped successfully!");

    // Verify all tables are gone
    const remainingTables = await sql`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public'
    `;

    if (remainingTables.length === 0) {
      console.log("✅ Verification: No tables remain in the database.");
    } else {
      console.log(`⚠️  Warning: ${remainingTables.length} tables still exist.`);
    }
  } catch (error) {
    console.error("❌ Error during database nuke:", error);
    throw error;
  } finally {
    // Close the database connection
    await sql.end();
    console.log("🔌 Database connection closed.");
  }
}

// Run the script
if (require.main === module) {
  nukeDatabase()
    .then(() => {
      console.log("🎉 Database nuke completed successfully!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("💥 Database nuke failed:", error);
      process.exit(1);
    });
}
