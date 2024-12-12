// PATH: /Users/kitmikhaelbagares/Documents/Dna/PlatformApp/recruitment-portal/src/app/portal/(settings)/timezones
// url: http://localhost:3000/portal/settings/timezones
// Create a test script that will test the following:
// 1. Visit the user types page
// 2. Click on the create button
// 3. go to link for wizard
// precondition: user must be logged in

import { faker } from "@faker-js/faker";

const newArray = [
  faker.location.timeZone(),
  faker.location.timeZone(),
  faker.location.timeZone(),
];

describe("Timezones", () => {
  beforeEach(() => {
    // Load login data from the fixture file
    cy.fixture("user").then((data) => {
      // Call the login command with the loaded data
      cy.login(data.username, data.password);
    });
  });

  it("Should access timezones Menu", () => {
    cy.visitMenuSettingsGrid("Timezones");
    cy.wait(1000);
  });

  newArray.forEach((name) => {
    it("Should create timezone.", () => {
      cy.visitMenuSettingsGrid("Timezones");
      cy.createNewRecord("timezone");

      // degree types
      cy.get("[data-test-id=timezone]").type(name);

      // submit form
      cy.get("[data-test-id=submitFormButton]").click();
      cy.wait(1000);
      cy.get("[data-test-id=wizardNextButton]").click();
      cy.wait(1000);

      //wizardSaveContinueButton
      cy.get("[data-test-id=wizardSaveContinueButton]").click();
      cy.wait(1000);
      cy.url().should("include", "/portal/timezone/record");
      cy.wait(2000);
    });
  });
});
