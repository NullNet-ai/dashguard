import { faker } from "@faker-js/faker";

export const setUpEmployeeContactStepThree = () => {
  cy.wait(3000);
  cy.get("[data-test-id=user_role_id]").click();
  cy.wait(2000);
  cy.get('[role="option"]').first().click({ force: true });
  cy.wait(2000);
  cy.get("[data-test-id=submitFormButton]").click();
  cy.wait(2000);
  cy.get("[data-test-id=wizardNextButton]").click();
  cy.wait(3000);
};

export const setUpEmployeeContactStepFour = () => {
  cy.location("href").then((url) => {
    const modifiedUrl = url.replace("/4?", "/5?");
    cy.visit(modifiedUrl);
  });
};

export const setUpEmployeeContactStepFive = () => {
  cy.wait(3000);

  cy.get("[data-test-id=organizations]").click();
  cy.wait(1000);
  cy.get('[role="option"]').first().click({ force: true });

  cy.get("[data-test-id=job_title]").type(faker.person.jobTitle());
  cy.wait(2000);

  cy.get("[data-test-id=submitFormButton]").click();
  cy.wait(2000);

  cy.get("[data-test-id=wizardNextButton]").click();
};

export const setUpEmployeeContactStepSix = (email: string) => {
  cy.wait(5000);

  cy.get("[data-test-id=email]").should(($input: any) => {
    expect($input.val().toLowerCase()).to.equal(email.toLowerCase());
  });
  cy.get("[data-test-id=email]").should("have.attr", "readonly");

  const validPassword = "Passw0rd!";
  cy.get("[data-test-id=password]").type(validPassword);

  cy.get("[data-test-id=password]").should("have.value", validPassword);

  cy.get("[data-test-id=submitFormButton]").click();
  cy.wait(2000);

  cy.get("[data-test-id=wizardNextButton]").click();
};
