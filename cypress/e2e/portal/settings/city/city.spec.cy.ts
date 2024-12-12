// PATH: /Users/kitmikhaelbagares/Documents/Dna/PlatformApp/recruitment-portal/src/app/portal/(settings)/cities
// url: http://localhost:3000/portal/settings/cities
// Create a test script that will test the following:
// 1. Visit the user types page
// 2. Click on the create button
// 3. go to link for wizard
// precondition: user must be logged in

import { faker } from "@faker-js/faker";

describe("City", () => {
  beforeEach(() => {
    // Load login data from the fixture file
    cy.fixture("user").then((data) => {
      // Call the login command with the loaded data
      cy.login(data.username, data.password);
    });
  });

  it("Should access City Menu", () => {
    cy.visitMenuSettingsGrid("City");
    cy.wait(1000);
  });

  it("Should create city.", () => {
    cy.visitMenuSettingsGrid("City");
    cy.createNewRecord("city");

    // city
    cy.get("[data-test-id=country_id]").click();
    cy.wait(2000);
    cy.get("[role='option']").first().click({ force: true });
    cy.wait(2000);
    cy.get("[data-test-id=city]").type(faker.location.city());

    // submit form
    cy.get("[data-test-id=submitFormButtoncity]").click();
    cy.wait(1000);
    cy.get("[data-test-id=wizardNextButton]").click();
    cy.wait(1000);

    //wizardSaveContinueButton
    cy.get("[data-test-id=wizardSaveContinueButton]").click();
    cy.wait(1000);
    cy.url().should("include", "/portal/city/record");
    cy.wait(2000);
  });
});
