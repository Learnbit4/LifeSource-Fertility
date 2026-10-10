import { mysqlTable, varchar, int, mysqlEnum, datetime, text, boolean, timestamp, index, primaryKey } from "drizzle-orm/mysql-core";
export const users = mysqlTable("users", {
  id: varchar("id", { length: 36 }).primaryKey(),
  email: varchar("email", { length: 160 }).notNull().unique(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  name: varchar("name", { length: 120 }).notNull(),
  phone: varchar("phone", { length: 15 }).notNull(),
  role: mysqlEnum("role", ["RECIPIENT", "CLINIC", "ADMIN"]).notNull().default("RECIPIENT"),
  verifiedAt: datetime("verified_at"), // set by staff after identity checks; gates donor photos
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
export const sessions = mysqlTable("sessions", {
  id: varchar("id", { length: 64 }).primaryKey(), // sha256 of the cookie token; the raw token is never stored
  userId: varchar("user_id", { length: 36 }).notNull().references(() => users.id),
  expiresAt: datetime("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (t) => [index("sessions_user").on(t.userId)]);
export const favorites = mysqlTable("favorites", {
  userId: varchar("user_id", { length: 36 }).notNull().references(() => users.id),
  donorId: varchar("donor_id", { length: 16 }).notNull().references(() => donors.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (t) => [primaryKey({ columns: [t.userId, t.donorId] })]);
export const donors = mysqlTable("donors", {
  id: varchar("id", { length: 16 }).primaryKey(),
  code: varchar("code", { length: 24 }).notNull().unique(),
  tier: mysqlEnum("tier", ["STANDARD", "PREMIUM"]).notNull(),
  mot10Stock: int("mot10_stock").notNull().default(0),
  mot20Stock: int("mot20_stock").notNull().default(0),
});
export const orders = mysqlTable("orders", {
  id: varchar("id", { length: 36 }).primaryKey(),
  reference: varchar("reference", { length: 16 }).notNull().unique(),
  status: mysqlEnum("status", ["PENDING", "PAID", "EXPIRED", "CANCELLED"]).notNull().default("PENDING"),
  userId: varchar("user_id", { length: 36 }).references(() => users.id),
  buyerName: varchar("buyer_name", { length: 120 }).notNull(),
  buyerPhone: varchar("buyer_phone", { length: 15 }).notNull(),
  buyerEmail: varchar("buyer_email", { length: 160 }).notNull(),
  usdTotal: int("usd_total").notNull(),
  kesAmount: int("kes_amount").notNull(),
  usdToKesRate: varchar("usd_to_kes_rate", { length: 16 }).notNull(),
  termsVersion: varchar("terms_version", { length: 40 }).notNull(),
  needsReview: boolean("needs_review").notNull().default(false),
  reviewNote: varchar("review_note", { length: 255 }),
  expiresAt: datetime("expires_at").notNull(),
  paidAt: datetime("paid_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (t) => [index("orders_status_expires").on(t.status, t.expiresAt)]);
export const orderItems = mysqlTable("order_items", {
  id: int("id").autoincrement().primaryKey(),
  orderId: varchar("order_id", { length: 36 }).notNull().references(() => orders.id),
  donorId: varchar("donor_id", { length: 16 }).notNull().references(() => donors.id),
  vial: mysqlEnum("vial", ["MOT10", "MOT20"]).notNull(),
  processing: mysqlEnum("processing", ["ICI", "IUI"]).notNull(),
  qty: int("qty").notNull(),
  unitUsd: int("unit_usd").notNull(),
});
export const payments = mysqlTable("payments", {
  id: int("id").autoincrement().primaryKey(),
  orderId: varchar("order_id", { length: 36 }).notNull().references(() => orders.id),
  checkoutRequestId: varchar("checkout_request_id", { length: 80 }).notNull().unique(),
  merchantRequestId: varchar("merchant_request_id", { length: 80 }),
  phone: varchar("phone", { length: 15 }).notNull(),
  amountKes: int("amount_kes").notNull(),
  status: mysqlEnum("status", ["INITIATED", "SUCCESS", "FAILED", "CANCELLED"]).notNull().default("INITIATED"),
  mpesaReceipt: varchar("mpesa_receipt", { length: 24 }).unique(),
  resultCode: int("result_code"),
  resultDesc: varchar("result_desc", { length: 255 }),
  rawCallback: text("raw_callback"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});
export const bookings = mysqlTable("bookings", {
  id: varchar("id", { length: 36 }).primaryKey(),
  reference: varchar("reference", { length: 16 }).notNull().unique(),
  userId: varchar("user_id", { length: 36 }).references(() => users.id),
  service: mysqlEnum("service", ["IUI", "IVF"]).notNull(),
  slotDate: varchar("slot_date", { length: 10 }).notNull(),
  slotTime: varchar("slot_time", { length: 5 }).notNull(),
  // "YYYY-MM-DDTHH:MM" while the booking is active, NULL once cancelled. UNIQUE => no double-booking, and cancelled slots free up.
  activeSlot: varchar("active_slot", { length: 16 }).unique(),
  name: varchar("name", { length: 120 }).notNull(),
  phone: varchar("phone", { length: 15 }).notNull(),
  email: varchar("email", { length: 160 }).notNull(),
  status: mysqlEnum("status", ["REQUESTED", "CONFIRMED", "CANCELLED"]).notNull().default("REQUESTED"),
  termsVersion: varchar("terms_version", { length: 40 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
