import { faker } from "@faker-js/faker";
import {
  setUpContactStepOne,
  setUpContactStepTwo,
  setUpContactTags,
} from "./prerequisite/contact.cy";
import {
  setUpApplicantContactCreationStepThree,
  setUpApplicantContactCreationStepFour,
  setUpApplicantContactCreationStepFive,
  setUpApplicantContactCreationStepSix,
  setUpApplicantContactCreationStepSeven,
  // setUpApplicantContactCreationStepEight,
  setUpApplicantContactCreationStepNine,
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
    setUpApplicantContactCreationStepSeven();
    cy.wait(5000);
    cy.get("[data-test-id=wizardNextButton]").click();
    cy.wait(4000);
    setUpApplicantContactCreationStepNine();
  });

  it(`They should be able to confirm the details before completing the contact creation.`, () => {
    cy.wait(2000);
    setUpContactTags();
  });
});
