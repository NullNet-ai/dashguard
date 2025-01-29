// Extend the Cypress Command interface to support custom commands
declare global {
  namespace Cypress {
    interface Chainable {
      login(username: string, password: string): Chainable<Element>;
      visitReportsPage(): Chainable<Element>;
      openReportWizard(): Chainable<Element>;
      visitMenuSettingsGrid(entity: string): Chainable<Element>;
      createNewRecord(entity: string): Chainable<Element>;
      visitMainMenuGrid(entity: string): Chainable<Element>;
    }
  }
}

// Add the login command to Cypress
Cypress.Commands.add("login", (username: string, password: string) => {
  cy.visit("http://localhost:3000"); // Navigate to the login page
  cy.get("[data-test-id=email]").type(username!); // Type the username
  cy.get("[data-test-id=password]").type(password!); // Type the password
  cy.get("[data-test-id=loginSubmitButton]").click(); // Submit the form
  cy.wait(3000); // Wait for the redirect
  cy.url().should("include", "portal/dashboard"); // Ensure we're redirected to the dashboard
});

// Command to visit reports grid
Cypress.Commands.add("visitReportsPage", () => {
  cy.get("[data-test-id=sidebarMainMenuReports]").click();
  cy.url().should("include", "/portal/report/grid");
});

// Command to open the wizard
Cypress.Commands.add("openReportWizard", () => {
  cy.get("[data-test-id=gridCreateButton]").should("be.visible");
  cy.get("[data-test-id=gridCreateButton]").click();
  cy.url().should("include", "/portal/report/wizard");
});

// Command to visit settings grid
Cypress.Commands.add("visitMenuSettingsGrid", (entity: string) => {
  const data_test_id = `sidebarSubMenuSettings${entity}`;
  cy.get("[data-test-id=sidebarGroupMenuSettings]").click();
  cy.get(`[data-test-id=${data_test_id}]`).click();
  // cy.url().should("include", `/portal/${entity}/grid`);
  cy.wait(3000);
});

Cypress.Commands.add("visitMainMenuGrid", (entity: string) => {
  const data_test_id = `sidebarMainMenu${entity}`;
  cy.get(`[data-test-id=${data_test_id}]`).click();
  cy.wait(3000);
  // cy.url().should("include", `/portal/${entity}/grid`);
});

Cypress.Commands.add("createNewRecord", (entity: string) => {
  cy.get("[data-test-id=gridCreateButton]").should("be.visible");
  cy.wait(1000);
  cy.get("button[data-test-id=gridCreateButton]").first().click();
  cy.wait(3000);
  cy.url().should("include", `/portal/${entity}/wizard`);
});
