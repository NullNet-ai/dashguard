import { faker } from "@faker-js/faker";

export const setUpContactStepOne = (email: string) => {
  const random_number = Math.floor(Math.random() * 900) + 10000;
  const phone_number = `88888${random_number}`;
  const first_name = faker.person?.firstName();
  cy.get("[data-test-id=emails1]").type(email);
  cy.get("[data-test-id=phones1]").type(phone_number);
  cy.get("[data-test-id=first_name]").type(first_name);
  cy.get("[data-test-id=last_name]").type(faker.person?.lastName());
  cy.get("[data-test-id=wizardNextButton]").click();
  cy.wait(3000);
};
export const setUpContactStepTwo = (category: string) => {
  cy.wait(6000);
  cy.get("[data-test-id=categories]").click();
  cy.wait(2000);
  cy.get("[role='option']").contains(category).click({ force: true });
  cy.wait(2000);
  cy.get("[data-test-id=submitFormButtonContactCategoryDetails]").click();
  cy.wait(3000);
};

export const setUpContactTags = () => {
  cy.wait(3000);

  cy.get("[data-test-id=tagsInput]").type("Verified{enter}");
  cy.get("[data-test-id=tagsInput]").type("Correct Info{enter}");
  cy.get("[data-test-id=submitFormButtonTags]").click();
  // cy.get("[data-test-id=wizardSaveContinueButton]").click();
};
