import { z } from "zod";

const ZodGetFilters = z.object({
  filter_id: z.string(),
});

export default ZodGetFilters;
