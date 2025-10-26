import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, date, timestamp, decimal } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const routes = pgTable("routes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  fromStation: text("from_station").notNull(),
  toStation: text("to_station").notNull(),
  distanceKm: integer("distance_km").notNull(),
});

export const bookings = pgTable("bookings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  routeId: varchar("route_id").notNull().references(() => routes.id, { onDelete: "cascade" }),
  travelDate: date("travel_date").notNull(),
  coach: text("coach").notNull(),
  row: integer("row").notNull(),
  column: integer("column").notNull(),
  passengerName: text("passenger_name").notNull(),
  passengerAge: integer("passenger_age").notNull(),
  fare: decimal("fare", { precision: 10, scale: 2 }).notNull(),
  pnr: text("pnr").notNull().unique(),
  status: text("status").notNull().default("confirmed"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const usersRelations = relations(users, ({ many }) => ({
  bookings: many(bookings),
}));

export const routesRelations = relations(routes, ({ many }) => ({
  bookings: many(bookings),
}));

export const bookingsRelations = relations(bookings, ({ one }) => ({
  user: one(users, {
    fields: [bookings.userId],
    references: [users.id],
  }),
  route: one(routes, {
    fields: [bookings.routeId],
    references: [routes.id],
  }),
}));

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
}).extend({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  username: z.string().min(3, "Username must be at least 3 characters"),
});

export const insertRouteSchema = createInsertSchema(routes).omit({
  id: true,
});

export const insertBookingSchema = createInsertSchema(bookings).omit({
  id: true,
  pnr: true,
  createdAt: true,
  status: true,
  userId: true,
  fare: true,
}).extend({
  passengerAge: z.number().min(7, "Passenger must be at least 7 years old").max(125, "Invalid age"),
  passengerName: z.string().min(1, "Passenger name is required"),
  travelDate: z.string(),
});

export const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertRoute = z.infer<typeof insertRouteSchema>;
export type Route = typeof routes.$inferSelect;
export type InsertBooking = z.infer<typeof insertBookingSchema>;
export type Booking = typeof bookings.$inferSelect;
export type LoginCredentials = z.infer<typeof loginSchema>;

export type BookingWithDetails = Booking & {
  route: Route;
  user: User;
};

export const COACH_CLASSES = {
  BUSINESS: { name: "Business", ratePerKm: 5.0 },
  FIRST_CLASS: { name: "1st Class", ratePerKm: 3.5 },
  ECONOMY: { name: "Economy", ratePerKm: 2.0 },
  SECOND_CLASS: { name: "2nd Class", ratePerKm: 1.5 },
  NON_AC: { name: "Non A/C", ratePerKm: 1.0 },
} as const;

export const COACH_ORDER = ["BUSINESS", "FIRST_CLASS", "ECONOMY", "SECOND_CLASS", "NON_AC"] as const;
export const ROWS = 5;
export const COLUMNS = 4;
