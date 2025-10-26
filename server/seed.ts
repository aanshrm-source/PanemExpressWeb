import { db } from "./db";
import { routes } from "@shared/schema";

async function seed() {
  console.log("Seeding database...");

  const existingRoutes = await db.select().from(routes);
  
  if (existingRoutes.length > 0) {
    console.log("Routes already seeded. Skipping...");
    return;
  }

  const routesToSeed = [
    {
      name: "Delhi to Mumbai Express",
      fromStation: "Delhi",
      toStation: "Mumbai",
      distanceKm: 1400,
    },
    {
      name: "Mumbai to Delhi Express",
      fromStation: "Mumbai",
      toStation: "Delhi",
      distanceKm: 1400,
    },
    {
      name: "Chennai to Kolkata Mail",
      fromStation: "Chennai",
      toStation: "Kolkata",
      distanceKm: 1650,
    },
    {
      name: "Kolkata to Chennai Mail",
      fromStation: "Kolkata",
      toStation: "Chennai",
      distanceKm: 1650,
    },
    {
      name: "Bangalore to Hyderabad Express",
      fromStation: "Bangalore",
      toStation: "Hyderabad",
      distanceKm: 575,
    },
    {
      name: "Hyderabad to Bangalore Express",
      fromStation: "Hyderabad",
      toStation: "Bangalore",
      distanceKm: 575,
    },
  ];

  for (const route of routesToSeed) {
    await db.insert(routes).values(route);
    console.log(`Added route: ${route.name}`);
  }

  console.log("Database seeding completed!");
}

seed()
  .catch((error) => {
    console.error("Seeding failed:", error);
    process.exit(1);
  })
  .finally(() => {
    process.exit(0);
  });
