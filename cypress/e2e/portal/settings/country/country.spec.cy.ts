// PATH: /Users/kitmikhaelbagares/Documents/Dna/PlatformApp/recruitment-portal/src/app/portal/(settings)/countries
// url: http://localhost:3000/portal/settings/countries
// Create a test script that will test the following:
// 1. Visit the user types page
// 2. Click on the create button
// 3. go to link for wizard
// precondition: user must be logged in

import { faker } from "@faker-js/faker";

describe("Country", () => {
  beforeEach(() => {
    // Load login data from the fixture file
    cy.fixture("user").then((data) => {
      // Call the login command with the loaded data
      cy.login(data.username, data.password);
    });
  });

  it("Should access Country Menu", () => {
    cy.visitMenuSettingsGrid("Country");
    cy.wait(1000);
  });

  it("Should create country.", () => {
    cy.visitMenuSettingsGrid("Country");
    cy.createNewRecord("country");

    // country
    cy.get("[data-test-id=country]").type(faker.location.country());

    // submit form
    cy.get("[data-test-id=submitFormButtonCountryBasicDetails]").click();
    cy.wait(1000);
    cy.get("[data-test-id=wizardNextButton]").click();
    cy.wait(1000);

    //wizardSaveContinueButton
    cy.get("[data-test-id=wizardSaveContinueButton]").click();
    cy.wait(1000);
    cy.url().should("include", "/portal/country/record");
    cy.wait(2000);
  });
});
