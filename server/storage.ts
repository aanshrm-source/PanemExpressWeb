import {
  users,
  routes,
  bookings,
  type User,
  type InsertUser,
  type Route,
  type InsertRoute,
  type Booking,
  type InsertBooking,
  type BookingWithDetails,
} from "@shared/schema";
import { db } from "./db";
import { eq, and } from "drizzle-orm";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  getAllRoutes(): Promise<Route[]>;
  getRoute(id: string): Promise<Route | undefined>;
  createRoute(route: InsertRoute): Promise<Route>;

  getUserBookings(userId: string): Promise<BookingWithDetails[]>;
  getBookingByPNR(pnr: string): Promise<BookingWithDetails | undefined>;
  getBookedSeats(routeId: string, travelDate: string, coach: string): Promise<{ row: number; column: number }[]>;
  createBooking(booking: InsertBooking & { pnr: string; userId: string; fare: string }): Promise<Booking>;
  cancelBooking(bookingId: string, userId: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async getAllRoutes(): Promise<Route[]> {
    return await db.select().from(routes);
  }

  async getRoute(id: string): Promise<Route | undefined> {
    const [route] = await db.select().from(routes).where(eq(routes.id, id));
    return route || undefined;
  }

  async createRoute(route: InsertRoute): Promise<Route> {
    const [newRoute] = await db.insert(routes).values(route).returning();
    return newRoute;
  }

  async getUserBookings(userId: string): Promise<BookingWithDetails[]> {
    const result = await db
      .select()
      .from(bookings)
      .where(eq(bookings.userId, userId))
      .leftJoin(routes, eq(bookings.routeId, routes.id))
      .leftJoin(users, eq(bookings.userId, users.id))
      .orderBy(bookings.travelDate);

    return result.map((row) => ({
      ...row.bookings,
      route: row.routes!,
      user: row.users!,
    })) as BookingWithDetails[];
  }

  async getBookingByPNR(pnr: string): Promise<BookingWithDetails | undefined> {
    const result = await db
      .select()
      .from(bookings)
      .where(eq(bookings.pnr, pnr))
      .leftJoin(routes, eq(bookings.routeId, routes.id))
      .leftJoin(users, eq(bookings.userId, users.id));

    if (result.length === 0) return undefined;

    const row = result[0];
    return {
      ...row.bookings,
      route: row.routes!,
      user: row.users!,
    } as BookingWithDetails;
  }

  async getBookedSeats(
    routeId: string,
    travelDate: string,
    coach: string
  ): Promise<{ row: number; column: number }[]> {
    const bookedSeats = await db
      .select({
        row: bookings.row,
        column: bookings.column,
      })
      .from(bookings)
      .where(
        and(
          eq(bookings.routeId, routeId),
          eq(bookings.travelDate, travelDate),
          eq(bookings.coach, coach),
          eq(bookings.status, "confirmed")
        )
      );

    return bookedSeats;
  }

  async createBooking(booking: InsertBooking & { pnr: string; userId: string; fare: string }): Promise<Booking> {
    const [newBooking] = await db.insert(bookings).values(booking).returning();
    return newBooking;
  }

  async cancelBooking(bookingId: string, userId: string): Promise<void> {
    await db
      .update(bookings)
      .set({ status: "cancelled" })
      .where(and(eq(bookings.id, bookingId), eq(bookings.userId, userId)));
  }
}

export const storage = new DatabaseStorage();
