CREATE TABLE `bookings` (
	`id` varchar(36) NOT NULL,
	`reference` varchar(16) NOT NULL,
	`service` enum('IUI','IVF') NOT NULL,
	`slot_date` varchar(10) NOT NULL,
	`slot_time` varchar(5) NOT NULL,
	`active_slot` varchar(16),
	`name` varchar(120) NOT NULL,
	`phone` varchar(15) NOT NULL,
	`email` varchar(160) NOT NULL,
	`status` enum('REQUESTED','CONFIRMED','CANCELLED') NOT NULL DEFAULT 'REQUESTED',
	`terms_version` varchar(40) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `bookings_id` PRIMARY KEY(`id`),
	CONSTRAINT `bookings_reference_unique` UNIQUE(`reference`),
	CONSTRAINT `bookings_active_slot_unique` UNIQUE(`active_slot`)
);
--> statement-breakpoint
CREATE TABLE `donors` (
	`id` varchar(16) NOT NULL,
	`code` varchar(24) NOT NULL,
	`tier` enum('STANDARD','PREMIUM') NOT NULL,
	`mot10_stock` int NOT NULL DEFAULT 0,
	`mot20_stock` int NOT NULL DEFAULT 0,
	CONSTRAINT `donors_id` PRIMARY KEY(`id`),
	CONSTRAINT `donors_code_unique` UNIQUE(`code`)
);
--> statement-breakpoint
CREATE TABLE `order_items` (
	`id` int AUTO_INCREMENT NOT NULL,
	`order_id` varchar(36) NOT NULL,
	`donor_id` varchar(16) NOT NULL,
	`vial` enum('MOT10','MOT20') NOT NULL,
	`processing` enum('ICI','IUI') NOT NULL,
	`qty` int NOT NULL,
	`unit_usd` int NOT NULL,
	CONSTRAINT `order_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `orders` (
	`id` varchar(36) NOT NULL,
	`reference` varchar(16) NOT NULL,
	`status` enum('PENDING','PAID','EXPIRED','CANCELLED') NOT NULL DEFAULT 'PENDING',
	`buyer_name` varchar(120) NOT NULL,
	`buyer_phone` varchar(15) NOT NULL,
	`buyer_email` varchar(160) NOT NULL,
	`usd_total` int NOT NULL,
	`kes_amount` int NOT NULL,
	`usd_to_kes_rate` varchar(16) NOT NULL,
	`terms_version` varchar(40) NOT NULL,
	`needs_review` boolean NOT NULL DEFAULT false,
	`review_note` varchar(255),
	`expires_at` datetime NOT NULL,
	`paid_at` datetime,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `orders_id` PRIMARY KEY(`id`),
	CONSTRAINT `orders_reference_unique` UNIQUE(`reference`)
);
--> statement-breakpoint
CREATE TABLE `payments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`order_id` varchar(36) NOT NULL,
	`checkout_request_id` varchar(80) NOT NULL,
	`merchant_request_id` varchar(80),
	`phone` varchar(15) NOT NULL,
	`amount_kes` int NOT NULL,
	`status` enum('INITIATED','SUCCESS','FAILED','CANCELLED') NOT NULL DEFAULT 'INITIATED',
	`mpesa_receipt` varchar(24),
	`result_code` int,
	`result_desc` varchar(255),
	`raw_callback` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `payments_id` PRIMARY KEY(`id`),
	CONSTRAINT `payments_checkout_request_id_unique` UNIQUE(`checkout_request_id`),
	CONSTRAINT `payments_mpesa_receipt_unique` UNIQUE(`mpesa_receipt`)
);
--> statement-breakpoint
ALTER TABLE `order_items` ADD CONSTRAINT `order_items_order_id_orders_id_fk` FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `order_items` ADD CONSTRAINT `order_items_donor_id_donors_id_fk` FOREIGN KEY (`donor_id`) REFERENCES `donors`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `payments` ADD CONSTRAINT `payments_order_id_orders_id_fk` FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `orders_status_expires` ON `orders` (`status`,`expires_at`);