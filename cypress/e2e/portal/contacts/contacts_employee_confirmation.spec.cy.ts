import { faker } from "@faker-js/faker";
import {
  setUpContactStepOne,
  setUpContactStepTwo,
  setUpContactTags,
} from "./prerequisite/contact.cy";
import {
  setUpEmployeeContactStepFive,
  setUpEmployeeContactStepFour,
  setUpEmployeeContactStepSix,
  setUpEmployeeContactStepThree,
} from "./prerequisite/category_employee.cy";

export const setupEmployeeContactCreationStep6 = () => {
  cy.fixture("user").then((data) => {
    cy.login(data.username, data.password);
  });

  cy.visitMainMenuGrid("Contacts");
  cy.createNewRecord("contact");

  const email = faker.person?.firstName() + "@gmail.com";

  setUpContactStepOne(email);
  setUpContactStepTwo("Employee");
  setUpEmployeeContactStepThree();
  setUpEmployeeContactStepFour();
  setUpEmployeeContactStepFive();
  setUpEmployeeContactStepSix(email);
};

describe("Applicant Contact Creation - Step 7", () => {
  beforeEach(() => {
    setupEmployeeContactCreationStep6();
  });

  it("Given the user creates an “Employee” Contact. When they are done filling up the necessary details. Then, they should be able to confirm the details before completing the contact creation", () => {
    setUpContactTags();
  });
});
