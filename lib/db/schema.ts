import { sql } from "drizzle-orm";
import {
  date,
  index,
  integer,
  pgEnum,
  pgTable,
  primaryKey,
  real,
  text,
  timestamp,
  uuid,
  vector,
} from "drizzle-orm/pg-core";
import { AdapterAccount } from "next-auth/adapters";
import { UserRole } from "../constants";

export const userRoleEnum = pgEnum("user_role", [UserRole.USER, UserRole.ADMIN]);
export const scopeEnum = pgEnum("scope", ["global", "regional", "local"]);
export const lifecycleStateEnum = pgEnum("lifecycle_state", [
  "active",
  "inactive",
  "archived",
  "draft",
]);
export const applicableRoleEnum = pgEnum("applicable_role", ["general", "advocate"]);

export const users = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name"),
  email: text("email").notNull(),
  emailVerified: timestamp("emailVerified", { mode: "date" }),
  image: text("image"),
  role: userRoleEnum("role").default(UserRole.USER),
});

export const accounts = pgTable(
  "account",
  {
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").notNull().$type<AdapterAccount["type"]>(),
    provider: text("provider").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => ({
    compoundKey: primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
  }),
);

export const sessions = pgTable("session", {
  sessionToken: text("sessionToken").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const verificationTokens = pgTable("verificationToken", {
  identifier: text("identifier").notNull(),
  token: text("token").notNull(),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

// Chat related tables
export const chats = pgTable("chat", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("userId").references(() => users.id),
  title: text("title"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const messages = pgTable("message", {
  id: uuid("id").defaultRandom().primaryKey(),
  chatId: uuid("chatId")
    .notNull()
    .references(() => chats.id, { onDelete: "cascade" }),
  role: text("role").notNull(), // 'user' | 'assistant'
  content: text("content").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const documents = pgTable(
  "documents",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    filePath: text("file_path").notNull(),
    chunkIndex: integer("chunk_index").notNull(),
    content: text("content").notNull(),
    embedding: vector("embedding", { dimensions: 1536 }),
    userId: text("user_id").references(() => users.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    userFilePathIdx: index("user_file_path_idx").on(table.userId, table.filePath),
  }),
);

// RAG related tables
export const ragChunks = pgTable("rag_chunks", {
  chunkId: text("chunk_id")
    .primaryKey()
    .default(sql`substring(md5(random()::text), 1, 12)`),
  content: text("content").notNull(),
  topic: text("topic"),
  jurisdiction: text("jurisdiction"),
  scope: scopeEnum("scope"),
  applicableRoles: applicableRoleEnum("applicable_roles").array(),
  authorityLevel: integer("authority_level").default(0),
  lifecycleState: lifecycleStateEnum("lifecycle_state").default("active"),
  lastReviewed: date("last_reviewed"),
  sourceIds: text("source_ids").array(),
  lexicalTriggers: text("lexical_triggers").array(),
  retrievalWeight: real("retrieval_weight").default(1.0),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const ragEmbeddings = pgTable("rag_embeddings", {
  id: uuid("id").defaultRandom().primaryKey(),
  chunkId: text("chunk_id")
    .notNull()
    .references(() => ragChunks.chunkId, { onDelete: "cascade" }),
  embedding: vector("embedding", { dimensions: 1536 }),
  model: text("model"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});
