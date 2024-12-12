import "dotenv/config";
import { EClientDatabaseProvider, ORM } from "@dna-platform/common-orm";
import { type Model } from "@dna-platform/common-orm/build/models/common";

// Log startup message
console.table({
  START_UP: "INITIALIZE DNA ORM",
});

// Declare global extension for TypeScript
const dnaClientGlobal = global as unknown as { orm: Model<any> };

// Create and assign dnaClient to the global object
export const dnaClientOrm = ORM({
  storage_type: EClientDatabaseProvider.LOCAL,
});

// Assign to global
if (process.env.NODE_ENV !== "production") dnaClientGlobal.orm = dnaClientOrm;
