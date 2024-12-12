// Describe: This file contains the test cases for the contact - applicant skill details.
// BeforeEach:
// Should login to the portal.
// Should create an Applicant Contact.
// Do Steps 1 to 5 of the wizard.

import { faker } from "@faker-js/faker";
import {
  setUpContactStepOne,
  setUpContactStepTwo,
} from "./prerequisite/contact.cy";
import {
  setUpApplicantContactCreationStepFive,
  setUpApplicantContactCreationStepFour,
  setUpApplicantContactCreationStepThree,
} from "./prerequisite/category_applicant.cy";

describe("Contact - Applicant Skill Details", () => {
  const random_number = Math.floor(Math.random() * 900) + 10000; //This expression will generate a random 5-digit number between 10000 and 10999
  const phone_number = `88888${random_number}`;

  beforeEach(() => {
    //LOGIN
    cy.fixture("user").then((data) => {
      cy.login(data.username, data.password);
    });
    //MENU & GRID
    cy.visitMainMenuGrid("Contacts");
    cy.createNewRecord("contact");
    //WIZARD
    const email = faker.person?.firstName() + "@gmail.com";

    setUpContactStepOne(email);
    setUpContactStepTwo("Applicant");
    setUpApplicantContactCreationStepThree();
    setUpApplicantContactCreationStepFour();
    setUpApplicantContactCreationStepFive();
  });

  it(`When they are in step 6. Then, the user should be able to select the following sill details:`, () => {
    const skill_index = "skills\\.0\\";
    cy.get(`[data-test-id=${skill_index}.skill]`).type(faker.company.name());
    cy.get(`[data-test-id=${skill_index}.years_of_experience]`).click({
      force: true,
    });
    cy.wait(1000);
    cy.get('[role="option"]').first().click({ force: true });
    cy.wait(1000);
    cy.get("[data-test-id=wizardNextButton]").click();
    cy.wait(1000);
  });
  //script to validate required fields
  it(`Should display error message in the required fields when submitting the Applicant's Skill Details form with empty values for the required fields.`, () => {
    cy.get("[data-test-id=submitFormButton]").click();
    cy.wait(2000);

    const skill_index = "skills\\.0\\";

    cy.get("[id$='-form-item-message']")
      .should("be.visible")
      .and("contain", "Skill is required.");

    cy.get(`[data-test-id=${skill_index}.skill]`).should(
      "have.attr",
      "aria-invalid",
      "true",
    );
    cy.get("[id$='-form-item-message']")
      .should("be.visible")
      .and("contain", "Years of Experience is required.");
    cy.get(`[data-test-id=${skill_index}.years_of_experience]`).should(
      "have.attr",
      "aria-invalid",
      "true",
    );
  });
  //!NO data-test-id for the Add button in multi forms
});
