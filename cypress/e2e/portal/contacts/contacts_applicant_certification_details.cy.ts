import { faker } from "@faker-js/faker";
import {
  setUpContactStepOne,
  setUpContactStepTwo,
} from "./prerequisite/contact.cy";
import {
  setUpApplicantContactCreationStepThree,
  setUpApplicantContactCreationStepFour,
  setUpApplicantContactCreationStepFive,
  setUpApplicantContactCreationStepSix,
  setUpApplicantContactCreationStepSeven,
} from "./prerequisite/category_applicant.cy";

describe("Contact Page", () => {
  before(() => {
    cy.fixture("user").then((data) => {
      cy.login(data.username, data.password);
    });

    cy.visitMainMenuGrid("Contacts");
    cy.createNewRecord("contact");

    setUpContactStepOne(faker.internet.email());
    setUpContactStepTwo("Applicant");
    setUpApplicantContactCreationStepThree();
    setUpApplicantContactCreationStepFour();
    setUpApplicantContactCreationStepFive();
    setUpApplicantContactCreationStepSix();
  });

  it(`Given the user creates an Applicant, when they are in the step 7, then they should be able to enter a Certificate, Institution, Issued On, Valid Till.`, () => {
    setUpApplicantContactCreationStepSeven();
  });
});
