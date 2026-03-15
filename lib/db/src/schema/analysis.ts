import { pgTable, text, real, timestamp, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const analysisRecordsTable = pgTable("analysis_records", {
  id: uuid("id").primaryKey().defaultRandom(),
  bpm: real("bpm").notNull(),
  confidence: real("confidence").notNull().default(0),
  label: text("label"),
  analyzedAt: timestamp("analyzed_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertAnalysisRecordSchema = createInsertSchema(analysisRecordsTable).omit({ id: true, analyzedAt: true });
export type InsertAnalysisRecord = z.infer<typeof insertAnalysisRecordSchema>;
export type AnalysisRecord = typeof analysisRecordsTable.$inferSelect;
