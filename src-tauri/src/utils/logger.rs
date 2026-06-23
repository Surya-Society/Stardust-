// src/utils/logger.rs
use log::info;
use chrono::Local;
use std::io::Write;

pub fn init_logger() {
    env_logger::Builder::new()
        .format(|buf, record| {
            let timestamp = Local::now().format("%Y-%m-%d %H:%M:%S");
            let level = record.level();
            let target = record.target();
            let message = record.args();
            
            writeln!(
                buf,
                "[{}] [{}] [{}] {}",
                timestamp,
                level,
                target,
                message
            )
        })
        .filter(None, log::LevelFilter::Info)
        .init();
    
    info!("📝 Logger initialized");
}