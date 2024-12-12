// Describe: This file contains the test cases for the organization page.
// BeforeEach: Should login to the portal.

import { faker } from "@faker-js/faker";

describe("Organization Page", () => {
  beforeEach(() => {
    //LOGIN
    cy.fixture("user").then((data) => {
      cy.login(data.username, data.password);
    });

    cy.get("[data-test-id=sidebarMainMenuOrganizations]").click();
    cy.url().should("include", "/portal/organization/grid");
  });

  it(`When they want to create a new organization
Then, they should redirected to a wizard and must be able to enter the following `, () => {
    //WIZARD
    cy.createNewRecord("organization");
    cy.wait(1000);

    // TODO Parent Organization ( Select ) ( Auto Fill Value )
    cy.get("[data-test-id=name]").type(faker?.company?.name());
    cy.get("[data-test-id=submitFormButton]").click();
    cy.wait(1000);
    // cy.get("[data-test-id=wizardNextButton]").click();
    // cy.wait(1000);
  });
});
