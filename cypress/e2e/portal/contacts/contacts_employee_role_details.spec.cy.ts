// Describe: This file contains the test cases for the contact - employee role details.
// BeforeEach:
// Should login to the portal.
// Should create an Employee Contact.

import { faker } from "@faker-js/faker";
import {
  setUpContactStepOne,
  setUpContactStepTwo,
} from "./prerequisite/contact.cy";

describe("Contact - Employee Role Details", () => {
  beforeEach(() => {
    //LOGIN
    cy.fixture("user").then((data) => {
      cy.login(data.username, data.password);
    });
    //MENU & GRID
    cy.visitMainMenuGrid("Contacts");
    //WIZARD
    cy.createNewRecord("contact");

    const email = faker.person?.firstName() + "@gmail.com";
    setUpContactStepOne(email);
    setUpContactStepTwo("Employee");
  });

  it(`When they are in step 3. Then, the user should be able to select the employee's role.`, () => {
    cy.url().should("include", "?categories=Employee");
    cy.get("[data-test-id=user_role_id]").click();
    cy.wait(1000);
    cy.get("[role='option']").contains("Recruiter").click({ force: true });
    cy.get("[data-test-id=submitFormButton]").click();
    //Validate that the role is not empty
    cy.get("[data-test-id=user_role_id]").should("not.contain", "Select");
    //verify that the role is selected
    cy.get("[data-test-id=user_role_id]").should("contain", "Recruiter");
    cy.wait(1000);
    cy.get("[data-test-id=wizardNextButton]").click();
    cy.wait(1000);
  });

  it(`When submitting the Role Details form with no selected Role, then display error message Role is required.`, () => {
    cy.get("[data-test-id=submitFormButton]").click();
    cy.wait(2000);

    cy.get("[id$='-form-item-message']")
      .should("be.visible")
      .and("contain", "Role is required.");

    cy.get("[data-test-id=user_role_id]").should(
      "have.attr",
      "aria-invalid",
      "true",
    );
  });
});
