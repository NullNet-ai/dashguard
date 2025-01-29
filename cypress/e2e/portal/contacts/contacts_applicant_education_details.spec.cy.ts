// Describe: This file contains the test cases for the organization page.
// BeforeEach: Should login to the portal.

import { faker } from "@faker-js/faker";
import { setUpContactStepOne, setUpContactStepTwo } from "./prerequisite/contact.cy";
import { setUpApplicantContactCreationStepFour, setUpApplicantContactCreationStepThree } from "./prerequisite/category_applicant.cy";

describe("Contact Education Details", () => {
  beforeEach(() => {
    // Load login data from the fixture file
    cy.fixture("user").then((data) => {
      // Call the login command with the loaded data
      cy.login(data.username, data.password);
    });

    cy.visitMainMenuGrid("Contacts");
    cy.createNewRecord("contact");

    const email = faker.person?.firstName() + "@gmail.com";

    setUpContactStepOne(email);
    setUpContactStepTwo("Applicant");
    setUpApplicantContactCreationStepThree();
    setUpApplicantContactCreationStepFour();
  });

  it(`Given the user creates an Applicant, when they are in the step 5, then they should be able to enter multiple Applicant's education details with the following details: Institution, Country, Degree, Degree Level, Completed On, Notes`, () => {
    const index = "educations\\.0\\";
    cy.get(`[data-test-id=${index}.institution]`).type(
      "University of the Philippines",
    );
    cy.get(`[data-test-id="${index}.country_id"]`).click({ force: true });
    cy.wait(1000); // Wait for dropdown to fully open
    cy.get('[role="option"]').first().click({ force: true });
    cy.get(`[data-test-id=${index}.degree]`).type(
      "Bachelor of Science in Computer Science",
    );
    cy.get(`[data-test-id="${index}.degree_level_id"]`).click({
      force: true,
    });
    cy.wait(1000);
    cy.get("[role='option']")
      .contains("Bachelor's Degree")
      .click({ force: true });
    cy.wait(1000);
    cy.get(`[data-test-id=buttonTriggerEducations\\.0\\.completed_on]`).type(
      "2024",
    );
    cy.get(`[data-test-id=${index}.note]`).type(faker.lorem.paragraph(2));
  });
  it(`Should display error message in the required fields when submitting the Applicant's Education Details form with empty values for the required fields.`, () => {
    const index = "educations\\.0\\";
    cy.get("[data-test-id=submitFormButton]").click();
    cy.wait(1000);
    //Display error messages
    cy.get("[id$='-form-item-message']")
      .should("be.visible")
      .and("contain", "Institution Name is required.");
    cy.get(`[data-test-id=${index}.institution]`).should(
      "have.attr",
      "aria-invalid",
      "true",
    );
    cy.get("[id$='-form-item-message']")
      .should("be.visible")
      .and("contain", "Country Name is required.");
    cy.get(`[data-test-id="${index}.country_id"]`).should(
      "have.attr",
      "aria-invalid",
      "true",
    );
    cy.get("[id$='-form-item-message']")
      .should("be.visible")
      .and("contain", "Degree Title is required.");
    cy.get(`[data-test-id=${index}.degree]`).should(
      "have.attr",
      "aria-invalid",
      "true",
    );
    cy.get("[id$='-form-item-message']")
      .should("be.visible")
      .and("contain", "Degree Level is required.");
    cy.get(`[data-test-id="${index}.degree_level_id"]`).should(
      "have.attr",
      "aria-invalid",
      "true",
    );
  });
  //!NO data-test-id for the Add button in multi forms
  // it(`Given the user creates an Applicant, when they are in the step 5, then they should be able to enter multiple Applicant's education details with the following details: Institution, Country, Degree, Degree Level, Completed On, Notes`, () => {
    
  //   //Fill up the first education details
  //   const index_0 = "educations\\.0\\";
  //   cy.get(`[data-test-id=${index_0}.institution]`).type(
  //     "University of the Philippines",
  //   );
  //   cy.get(`[data-test-id="${index_0}.country_id"]`).click({ force: true });
  //   cy.wait(1000); // Wait for dropdown to fully open
  //   cy.get('[role="option"]').first().click({ force: true });
  //   cy.get(`[data-test-id=${index_0}.degree]`).type(
  //     "Bachelor of Science in Computer Science",
  //   );
  //   cy.get(`[data-test-id="${index_0}.degree_level_id"]`).click({
  //     force: true,
  //   });
  //   cy.wait(1000);
  //   cy.get("[role='option']")
  //     .contains("Bachelor's Degree")
  //     .click({ force: true });
  //   cy.wait(1000);
  //   cy.get(`[data-test-id=buttonTriggerEducations\\.0\\.completed_on]`).type(
  //     "2024",
  //   );
  //   cy.get(`[data-test-id=${index_0}.note]`).type(faker.lorem.paragraph(2));
  //   //Click Add button to add another education details
  //   cy.get("[data-test-id=educationsAddButton]").click();
  //   cy.wait(1000);
  //   //Fill up the second education details
  //   const index_1 = "educations\\.1\\";
  //   cy.get(`[data-test-id=${index_1}.institution]`).type(
  //     "University of San Carlos",
  //   );
  //   cy.get(`[data-test-id="${index_1}.country_id"]`).click({ force: true });
  //   cy.wait(1000); // Wait for dropdown to fully open
  //   cy.get('[role="option"]').first().click({ force: true });
  //   cy.get(`[data-test-id=${index_1}.degree]`).type(
  //     "Bachelor of Science in Information Technology",
  //   );
  //   cy.get(`[data-test-id="${index_1}.degree_level_id"]`).click({
  //     force: true,
  //   });
  //   cy.wait(1000);
  //   cy.get("[role='option']")
  //     .contains("Bachelor's Degree")
  //     .click({ force: true });
  //   cy.wait(1000);
  //   cy.get(`[data-test-id=buttonTriggerEducations\\.1\\.completed_on]`).type(
  //     "2023",
  //   );
  //   cy.get(`[data-test-id=${index_1}.note]`).type(faker.lorem.paragraph(2));
  //   //Submit the form
  //   cy.get("[data-test-id=submitFormButton]").click();

  // })
});


