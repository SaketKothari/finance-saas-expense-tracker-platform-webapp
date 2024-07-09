import { z } from 'zod';
import { createInsertSchema } from 'drizzle-zod';
import { relations } from 'drizzle-orm';
import { integer, pgTable, text, timestamp } from 'drizzle-orm/pg-core';

export const accounts = pgTable('accounts', {
  id: text('id').primaryKey(),
  plaidId: text('plaid_id'),
  name: text('name').notNull(),
  userId: text('user_id').notNull(),
});

export const accountsRelations = relations(accounts, ({ many }) => ({
  // 1 account have many transactions
  transactions: many(transactions),
}));

// generate Zod schemas from Drizzle ORM schemas
export const insertAccountSchema = createInsertSchema(accounts);

export const categories = pgTable('categories', {
  id: text('id').primaryKey(),
  plaidId: text('plaid_id'),
  name: text('name').notNull(),
  userId: text('user_id').notNull(),
});

export const categoriesRelations = relations(categories, ({ many }) => ({
  transactions: many(transactions),
}));

export const insertCategorySchema = createInsertSchema(categories);

export const transactions = pgTable('transactions', {
  id: text('id').primaryKey(),
  amount: integer('amount').notNull(),
  payee: text('payee').notNull(),
  notes: text('notes'),
  date: timestamp('date', { mode: 'date' }).notNull(),

  // creating relation with the account
  accountId: text('account_id')
    .references(() => accounts.id, {
      // Rules
      onDelete: 'cascade',
    })
    .notNull(),
  categoryId: text('category_id').references(() => categories.id, {
    onDelete: 'set null',
  }),
});

// one to many
export const transactionsRelation = relations(transactions, ({ one }) => ({
  // Each transaction has 1 only account
  account: one(accounts, {
    fields: [transactions.accountId],
    references: [accounts.id],
  }),
  categories: one(categories, {
    fields: [transactions.categoryId],
    references: [categories.id],
  }),
}));

export const insertTransactionSchema = createInsertSchema(transactions, {
  date: z.coerce.date(),
});

export const connectedBanks = pgTable('connected_banks', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  accessToken: text('access_token').notNull(),
});
