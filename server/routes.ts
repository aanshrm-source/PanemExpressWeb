import type { Express } from "express";
import { createServer, type Server } from "http";
import bcrypt from "bcrypt";
import { nanoid } from "nanoid";
import { storage } from "./storage";
import { sendBookingConfirmation, sendCancellationEmail } from "./email";
import {
  insertUserSchema,
  loginSchema,
  insertBookingSchema,
  COACH_CLASSES,
  type InsertUser,
  type LoginCredentials,
  type InsertBooking,
} from "@shared/schema";

declare module "express-session" {
  interface SessionData {
    userId: string;
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  app.post("/api/auth/register", async (req, res) => {
    try {
      const validatedData = insertUserSchema.parse(req.body) as InsertUser;

      const existingUsername = await storage.getUserByUsername(validatedData.username);
      if (existingUsername) {
        return res.status(400).json({ message: "Username already exists" });
      }

      const existingEmail = await storage.getUserByEmail(validatedData.email);
      if (existingEmail) {
        return res.status(400).json({ message: "Email already exists" });
      }

      const hashedPassword = await bcrypt.hash(validatedData.password, 6);

      const user = await storage.createUser({
        ...validatedData,
        password: hashedPassword,
      });

      req.session.userId = user.id;
      
      // Explicitly save session and wait for it to complete
      await new Promise<void>((resolve, reject) => {
        req.session.save((err) => {
          if (err) {
            console.error("Session save error:", err);
            reject(err);
          } else {
            resolve();
          }
        });
      });

      res.json({
        user: {
          username: user.username,
          email: user.email,
        },
      });
    } catch (error: any) {
      console.error("Registration error:", error);
      res.status(400).json({ message: error.message || "Registration failed" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const validatedData = loginSchema.parse(req.body) as LoginCredentials;

      const user = await storage.getUserByUsername(validatedData.username);
      if (!user) {
        return res.status(401).json({ message: "Invalid username or password" });
      }

      const validPassword = await bcrypt.compare(validatedData.password, user.password);
      if (!validPassword) {
        return res.status(401).json({ message: "Invalid username or password" });
      }

      req.session.userId = user.id;
      
      // Explicitly save session and wait for it to complete
      await new Promise<void>((resolve, reject) => {
        req.session.save((err) => {
          if (err) {
            console.error("Session save error:", err);
            reject(err);
          } else {
            resolve();
          }
        });
      });

      res.json({
        user: {
          username: user.username,
          email: user.email,
        },
      });
    } catch (error: any) {
      console.error("Login error:", error);
      res.status(400).json({ message: error.message || "Login failed" });
    }
  });

  app.post("/api/auth/logout", async (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Logout failed" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });

  app.get("/api/auth/me", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const user = await storage.getUser(req.session.userId);
      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }

      res.json({
        user: {
          username: user.username,
          email: user.email,
        },
      });
    } catch (error) {
      console.error("Auth check error:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  app.get("/api/routes", async (req, res) => {
    try {
      const routes = await storage.getAllRoutes();
      res.json(routes);
    } catch (error) {
      console.error("Get routes error:", error);
      res.status(500).json({ message: "Failed to fetch routes" });
    }
  });

  app.get("/api/bookings/seats", async (req, res) => {
    try {
      const { routeId, travelDate, coach } = req.query;

      if (!routeId || !travelDate || !coach) {
        return res.status(400).json({ message: "Missing required parameters" });
      }

      const bookedSeats = await storage.getBookedSeats(
        routeId as string,
        travelDate as string,
        coach as string
      );

      res.json(bookedSeats);
    } catch (error) {
      console.error("Get booked seats error:", error);
      res.status(500).json({ message: "Failed to fetch booked seats" });
    }
  });

  app.get("/api/bookings", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const bookings = await storage.getUserBookings(req.session.userId);
      res.json(bookings);
    } catch (error) {
      console.error("Get bookings error:", error);
      res.status(500).json({ message: "Failed to fetch bookings" });
    }
  });

  app.get("/api/bookings/pnr/:pnr", async (req, res) => {
    try {
      const { pnr } = req.params;
      const booking = await storage.getBookingByPNR(pnr);

      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }

      res.json(booking);
    } catch (error) {
      console.error("Get booking by PNR error:", error);
      res.status(500).json({ message: "Failed to fetch booking" });
    }
  });

  app.post("/api/bookings", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const validatedData = insertBookingSchema.parse(req.body) as InsertBooking;

      const route = await storage.getRoute(validatedData.routeId);
      if (!route) {
        return res.status(400).json({ message: "Invalid route" });
      }

      const bookedSeats = await storage.getBookedSeats(
        validatedData.routeId,
        validatedData.travelDate,
        validatedData.coach
      );

      const seatAlreadyBooked = bookedSeats.some(
        (seat) => seat.row === validatedData.row && seat.column === validatedData.column
      );

      if (seatAlreadyBooked) {
        return res.status(400).json({ message: "Seat already booked" });
      }

      const coachKey = validatedData.coach as keyof typeof COACH_CLASSES;
      if (!COACH_CLASSES[coachKey]) {
        return res.status(400).json({ message: "Invalid coach class" });
      }

      const ratePerKm = COACH_CLASSES[coachKey].ratePerKm;
      const baseFare = route.distanceKm * ratePerKm;
      const discount = validatedData.passengerAge >= 60 ? 0.2 : 0;
      const finalFare = baseFare * (1 - discount);

      const pnr = nanoid(10).toUpperCase();

      const bookingData = {
        ...validatedData,
        userId: req.session.userId,
        fare: finalFare.toFixed(2),
        pnr,
      };
      
      const booking = await storage.createBooking(bookingData);

      const bookingWithDetails = await storage.getBookingByPNR(pnr);
      if (bookingWithDetails) {
        sendBookingConfirmation(bookingWithDetails);
      }

      res.json(booking);
    } catch (error: any) {
      console.error("Create booking error:", error);
      res.status(400).json({ message: error.message || "Failed to create booking" });
    }
  });

  app.delete("/api/bookings/:id", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const { id } = req.params;

      const bookingWithDetails = await storage.getBookingByPNR(
        (await storage.getUserBookings(req.session.userId)).find(b => b.id === id)?.pnr || ""
      );

      await storage.cancelBooking(id, req.session.userId);

      if (bookingWithDetails) {
        sendCancellationEmail(bookingWithDetails);
      }

      res.json({ message: "Booking cancelled successfully" });
    } catch (error) {
      console.error("Cancel booking error:", error);
      res.status(500).json({ message: "Failed to cancel booking" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
