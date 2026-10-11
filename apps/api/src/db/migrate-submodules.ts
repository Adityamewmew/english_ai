import { client } from "./index";

async function run() {
  console.log("Applying sub-module tables and columns to database...");

  await client.unsafe(`
    CREATE TABLE IF NOT EXISTS sub_modules (
      id varchar(36) PRIMARY KEY,
      module_id varchar(20) NOT NULL,
      skill_type varchar(20) NOT NULL,
      title varchar(150) NOT NULL,
      order_index integer NOT NULL DEFAULT 1,
      created_at timestamp DEFAULT NOW() NOT NULL
    );
  `);
  console.log("✓ Table sub_modules ready");

  await client.unsafe(`
    ALTER TABLE module_sections ADD COLUMN IF NOT EXISTS sub_module_id varchar(36);
  `);
  console.log("✓ Column module_sections.sub_module_id ready");

  await client.unsafe(`
    CREATE TABLE IF NOT EXISTS user_sub_module_progress (
      id varchar(36) PRIMARY KEY,
      user_id varchar(36) NOT NULL,
      sub_module_id varchar(36) NOT NULL,
      status varchar(20) NOT NULL DEFAULT 'locked',
      score integer,
      completed_at timestamp,
      created_at timestamp DEFAULT NOW() NOT NULL,
      updated_at timestamp DEFAULT NOW() NOT NULL
    );
  `);
  console.log("✓ Table user_sub_module_progress ready");

  await client.unsafe(`
    CREATE UNIQUE INDEX IF NOT EXISTS user_sub_module_idx ON user_sub_module_progress (user_id, sub_module_id);
  `);
  console.log("✓ Unique index user_sub_module_idx ready");

  console.log("All sub-module migrations applied successfully!");
  process.exit(0);
}

run().catch((err) => {
  console.error("Migration error:", err);
  process.exit(1);
});
