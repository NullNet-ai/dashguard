# Wizard API Documentation

## Overview

This document outlines the `wizardRouter` API, which provides functionalities for managing wizard steps using Redis for caching and the DNA platform for entity management.

## Table of Contents

- [Wizard API Documentation](#wizard-api-documentation)
  - [Overview](#overview)
  - [Table of Contents](#table-of-contents)
  - [Router Structure](#router-structure)
    - [wizardCreateStep](#wizardcreatestep)
    - [getCurrentStep](#getcurrentstep)
    - [activator](#activator)
    - [createEntity](#createentity)

---

## Router Structure

The `wizardRouter` is created using TRPC, which allows for easy type-safe API development in TypeScript. It includes multiple procedures to manage the steps in a wizard.

```typescript
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { z } from "zod"; // Zod is used for input validation
import Entities from "~/auto-generated/entities";
import { IResponse } from "@dna-platform/common-orm";

export const wizardRouter = createTRPCRouter({
  // Procedures go here
});
```

### wizardCreateStep

**Description**: Saves the current step for a specific entity in Redis.

- **Method**: `POST`

- **Input**:
  - `identifier`: string - Unique identifier for the entity.
  - `step`: string - The current step of the wizard.
  - `entity`: string - The name of the entity, must match one of the DnaOrm models.

```typescript
.mutation(async ({ input, ctx }) => {
  const res = await ctx?.redisClient.cacheData(
    `wizard_${input.entity}:${input.identifier}`,
    input?.step,
  );
  return res;
});
```

### getCurrentStep

**Description**: Retrieves the current step for a specific entity from Redis.

- **Method**: `GET`

- **Input**:
  - `identifier`: string - Unique identifier for the entity.
  - `entity`: string - The name of the entity, must match one of the DnaOrm models.

```typescript
.mutation(async ({ input, ctx }) => {
  const res = await ctx?.redisClient.getCachedData(
    `wizard_${input.entity}:${input.identifier}`,
  );
  return {
    identifier: input.identifier,
    entity: input.entity,
    step: res || 1,
  };
});
```

### activator

**Description**: Activates the last step for a specific entity.

- **Method**: `POST`

- **Input**:
  - `identifier`: string - Unique identifier for the entity.
  - `entity`: string - The name of the entity, must match one of the DnaOrm models.

```typescript
.mutation(async ({ input, ctx }) => {
  await ctx.dnaClient
    .update(input.identifier, {
      entity: input.entity,
      token: "free",
      mutation: {
        params: {
          status: "active",
        },
        pluck: ["id", "code"],
      },
    })
    .execute();

  const recordFound = await ctx.dnaClient
    .findOne(input.identifier, {
      entity: input.entity,
      token: "free",
      query: {
        pluck: ["id", "code"],
      },
    })
    .execute();

  return recordFound;
});
```

### createEntity

**Description**: Creates a new entity and initializes it in Redis.

- **Method**: `POST`

- **Input**:
  - `entity`: string - The name of the entity, must match one of the DnaOrm models.

```typescript
.mutation(async ({ input, ctx }) => {
  const record = await ctx.dnaClient
    .create({
      entity: input.entity,
      token: "free",
      mutation: {
        params: {
          status: "draft",
        },
        pluck: ["id", "code"],
      },
    })
    .execute();

  ctx?.redisClient.cacheData(
    `wizard_${input.entity}:${record?.data?.[0]?.id}`,
    JSON.stringify(1),
  );
  return record as IResponse<Record<string, any>>;
});


