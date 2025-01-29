// Describe: This file contains the test cases for the organization page.
// BeforeEach: Should login to the portal.

import { faker } from "@faker-js/faker";

describe("Organization Page", () => {
  beforeEach(() => {
    // Load login data from the fixture file
    cy.fixture("user").then((data) => {
      // Call the login command with the loaded data
      cy.login(data.username, data.password);
    });

    cy.visitMainMenuGrid("Organizations");
    cy.createNewRecord("organization");
  });

  it("Step 1 Title: Organization", () => {
    // // Verify the form title
    cy.get("p.text-sm.text-foreground").should("contain", "Organization");
  });

  it("Step 1 Parent Organization (required) and Name  (required)", () => {
    // cy.url().should("include", "/portal/organizations/wizard");

    cy.get("[data-test-id=parent_organization_id]").click(); // Open the dropdown
    cy.wait(1000);
    cy.get('[role="option"]').first().click({ force: true });
    cy.wait(1000);

    // // Verify the form title
    // cy.get("p.text-sm.text-foreground").should("contain", "Organization");

    // Enter Organization Name
    cy.get("[data-test-id=name]").type(faker.company.name());

    // Submit the form
    cy.get("[data-test-id=submitFormButton]").click();
  });

  it("I should be to create an active record.", () => {
    // cy.url().should("include", "/portal/organizations/wizard");

    cy.get("[data-test-id=parent_organization_id]").click(); // Open the dropdown
    cy.wait(1000);
    cy.get('[role="option"]').first().click({ force: true });
    cy.wait(1000);

    // // Verify the form title
    // cy.get("p.text-sm.text-foreground").should("contain", "Organization");

    // Enter Organization Name
    cy.get("[data-test-id=name]").type(faker.company.name());

    // Submit the form
    cy.get("[data-test-id=submitFormButton]").click();
    cy.wait(2000);
    cy.get("[data-test-id=wizardNextButton]").click();
    cy.wait(2000);
    cy.get("[data-test-id=wizardSaveContinueButton]").click();
  });
});
