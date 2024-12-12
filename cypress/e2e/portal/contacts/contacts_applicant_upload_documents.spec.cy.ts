// Describe: This file contains the test cases for the organization page.
// BeforeEach: Should login to the portal.

import { faker } from "@faker-js/faker";
import {
  setUpContactStepOne,
  setUpContactStepTwo,
} from "./prerequisite/contact.cy";
import {
  setUpApplicantContactCreationStepEight,
  setUpApplicantContactCreationStepFive,
  setUpApplicantContactCreationStepFour,
  setUpApplicantContactCreationStepSeven,
  setUpApplicantContactCreationStepSix,
  setUpApplicantContactCreationStepThree,
} from "./prerequisite/category_applicant.cy";

describe("Contact Page", () => {
  before(() => {
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
    setUpApplicantContactCreationStepFive();
    setUpApplicantContactCreationStepSix();
    setUpApplicantContactCreationStepSeven();
  });

  it(`Given the user creates an Applicant, when they are in the step 8, then they should have the option to upload any documents with the following types: PDF, Doc, JPG, GIF. Then upload with a maximum file size of 10 MB. Then be able to upload multiple files.`, () => {
    setUpApplicantContactCreationStepEight();
  });
});
