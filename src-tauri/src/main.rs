// src/main.rs
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use Stardust::run;

fn main() {
    run();
}

// sqlx migrate run --source migrations/sqlite --database-url sqlite://./Stardust.sqlite
// sqlx migrate run --source migrations/postgres --database-url postgres://postgres:SuryaSociety@localhost:5432/stardust
