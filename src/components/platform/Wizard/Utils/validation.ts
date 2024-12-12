/* eslint-disable @typescript-eslint/no-explicit-any */
import { type IState } from "../type";

interface IValidation extends IState {
  section: string;
  utils: any;
}

export const handleValidation = async (step: number, config: IValidation) => {
  if (step === 0) {
    console.error("Invalid step");
    return;
  }
  const stepValidating = `STEP_${step}`;
  const stepValidation = config?.stepValidation?.[stepValidating];
  const entity = config?.section || config?.entityName?.toLocaleLowerCase();

  if (!stepValidation) {
    console.error("Invalid step validation");
    return;
  }
  if (!entity) {
    console.error("Invalid entity");
    return;
  }
  try {
    // const validated = await config?.utils.wizard.validate.fetch({
    //   code: config?.entityCode,
    //   entity: entity,
    //   validateConfig: stepValidation,
    // });
    return true;
  } catch (error) {
    console.error("Validation failed", error);
  }
};
