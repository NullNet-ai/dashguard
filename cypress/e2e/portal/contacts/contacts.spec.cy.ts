// Describe: This file contains the test cases for the organization page.
// BeforeEach: Should login to the portal.

import { faker } from "@faker-js/faker";

describe("Organization Page", () => {
  beforeEach(() => {
    cy.visit("http://localhost:3000");
    cy.get("[data-test-id=email]").type("admin@dnamicro.com");
    cy.get("[data-test-id=password]").type("ch@ng3m3Pl3@s3!!");
    cy.get("[data-test-id=loginSubmitButton]").click();

    cy.get("[data-test-id=sidebarMainMenuOrganizations]").click();
    cy.url().should("include", "/portal/organizations/grid");
  });

  it(`When they want to create a new organization
Then, they should redirected to a wizard and must be able to enter the following `, () => {
    cy.get("[data-test-id=gridCreateButton]").click();
    cy.url().should("include", "/portal/organizations/wizard");

    // TODO Parent Organization ( Select ) ( Auto Fill Value )
    cy.get("[data-test-id=name]").type(faker?.company?.name());
    cy.get("[data-test-id=submitFormButton]").click();
    cy.wait(1000);
    // cy.get("[data-test-id=wizardNextButton]").click();
    // cy.wait(1000);
  });
});
