import { z } from "zod";
import Entities from "~/auto-generated/entities";

const ZodCreateEntity = z.object({
  entity: z.string().refine(
    (value) => {
      return Entities.includes(value);
    },
    {
      message: "Invalid entity name. It must be one of the DnaOrm models.",
    },
  ),
});

export default ZodCreateEntity;
