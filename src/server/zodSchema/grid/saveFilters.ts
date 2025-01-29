import { z } from "zod";
import ZodAdvanceFilter from "./advanceFilter";

const ZodSaveFilters = z.object({
  filter_id: z.string(),
  filters: ZodAdvanceFilter,
});

export default ZodSaveFilters;
