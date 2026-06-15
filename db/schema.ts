import { z } from 'zod';
import { createInsertSchema } from 'drizzle-zod';
import { relations } from 'drizzle-orm';
import { boolean, integer, pgTable, text, timestamp } from 'drizzle-orm/pg-core';

export const accounts = pgTable('accounts', {
  id: text('id').primaryKey(),
  plaidId: text('plaid_id'),
  name: text('name').notNull(),
  userId: text('user_id').notNull(),
  currency: text('currency').default('INR').notNull(),
});

export const accountsRelations = relations(accounts, ({ many }) => ({
  transactions: many(transactions),
}));

export const insertAccountSchema = createInsertSchema(accounts);

export const categories = pgTable('categories', {
  id: text('id').primaryKey(),
  plaidId: text('plaid_id'),
  name: text('name').notNull(),
  userId: text('user_id').notNull(),
});

export const categoriesRelations = relations(categories, ({ many }) => ({
  transactions: many(transactions),
  transactionSplits: many(transactionSplits),
  spendingAlerts: many(spendingAlerts),
}));

export const insertCategorySchema = createInsertSchema(categories);

export const transactions = pgTable('transactions', {
  id: text('id').primaryKey(),
  amount: integer('amount').notNull(),
  payee: text('payee').notNull(),
  notes: text('notes'),
  date: timestamp('date', { mode: 'date' }).notNull(),
  accountId: text('account_id')
    .references(() => accounts.id, { onDelete: 'cascade' })
    .notNull(),
  categoryId: text('category_id').references(() => categories.id, {
    onDelete: 'set null',
  }),
  // India-specific fields
  receiptUrl: text('receipt_url'),
  upiRef: text('upi_ref'),
  taxCategory: text('tax_category'),
  currency: text('currency').default('INR').notNull(),
});

export const transactionsRelation = relations(transactions, ({ one, many }) => ({
  account: one(accounts, {
    fields: [transactions.accountId],
    references: [accounts.id],
  }),
  categories: one(categories, {
    fields: [transactions.categoryId],
    references: [categories.id],
  }),
  splits: many(transactionSplits),
}));

export const insertTransactionSchema = createInsertSchema(transactions, {
  date: z.coerce.date(),
});

// Transaction splits — one transaction broken across multiple categories
export const transactionSplits = pgTable('transaction_splits', {
  id: text('id').primaryKey(),
  transactionId: text('transaction_id')
    .references(() => transactions.id, { onDelete: 'cascade' })
    .notNull(),
  categoryId: text('category_id').references(() => categories.id, {
    onDelete: 'set null',
  }),
  amount: integer('amount').notNull(),
  notes: text('notes'),
});

export const transactionSplitsRelations = relations(transactionSplits, ({ one }) => ({
  transaction: one(transactions, {
    fields: [transactionSplits.transactionId],
    references: [transactions.id],
  }),
  category: one(categories, {
    fields: [transactionSplits.categoryId],
    references: [categories.id],
  }),
}));

export const insertTransactionSplitSchema = createInsertSchema(transactionSplits);

// Spending alerts — notify when category spending crosses a threshold
export const spendingAlerts = pgTable('spending_alerts', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  categoryId: text('category_id').references(() => categories.id, {
    onDelete: 'cascade',
  }),
  name: text('name').notNull(),
  threshold: integer('threshold').notNull(),
  period: text('period').notNull().default('monthly'),
  isActive: boolean('is_active').notNull().default(true),
});

export const spendingAlertsRelations = relations(spendingAlerts, ({ one }) => ({
  category: one(categories, {
    fields: [spendingAlerts.categoryId],
    references: [categories.id],
  }),
}));

export const insertSpendingAlertSchema = createInsertSchema(spendingAlerts);

// Plaid connected banks
export const connectedBanks = pgTable('connected_banks', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  accessToken: text('access_token').notNull(),
});

// Setu Account Aggregator connected banks (Indian banks)
export const setuConnectedBanks = pgTable('setu_connected_banks', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  consentHandle: text('consent_handle').notNull(),
  consentId: text('consent_id'),
  status: text('status').notNull().default('PENDING'),
  bankName: text('bank_name'),
});

export const insertSetuConnectedBankSchema = createInsertSchema(setuConnectedBanks);

export const subscriptions = pgTable('subscriptions', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().unique(),
  subscriptionId: text('subscription_id').notNull().unique(),
  status: text('status').notNull(),
});
