// src/payment/processor.rs

use crate::payment::PaymentService;

pub struct PaymentProcessor {
    pub service: PaymentService,
}

impl PaymentProcessor {
    pub fn new(service: PaymentService) -> Self {
        Self { service }
    }
}