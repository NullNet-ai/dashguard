import "dotenv/config";
import { EClientDatabaseProvider, ORM } from "@dna-platform/common-orm";

// import { dnaClientOrm } from "~/lib/dnaClient";

export const dnaClient = ORM({
  storage_type: EClientDatabaseProvider.LOCAL,
});

// export const dnaClient = dnaClientOrm;
