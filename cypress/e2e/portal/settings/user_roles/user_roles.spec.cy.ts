// PATH: /Users/kitmikhaelbagares/Documents/Dna/PlatformApp/recruitment-portal/src/app/portal/(settings)/user_roles
// url: http://localhost:3000/portal/settings/user_roles
// Create a test script that will test the following:
// 1. Visit the user types page
// 2. Click on the create button
// 3. go to link for wizard
// precondition: user must be logged in

import { faker } from "@faker-js/faker";
// const newArray = new Array(100).map(() => {
//   return faker?.company?.buzzNoun();
// });
const newArray = [
  faker.person.jobTitle(),
  faker.person.jobTitle(),
  faker.person.jobTitle(),
];

describe("User Roles", () => {
  beforeEach(() => {
    // Load login data from the fixture file
    cy.fixture("user").then((data) => {
      // Call the login command with the loaded data
      cy.login(data.username, data.password);
    });
  });

  it("Should access User Roles Menu", () => {
    cy.visitMenuSettingsGrid("Roles");
    cy.wait(1000);
  });

  newArray.forEach((name) => {
    it("Should create user role.", () => {
      cy.visitMenuSettingsGrid("Roles");
      cy.createNewRecord("user_role");

      // degree types
      cy.get("[data-test-id=role]").type(name);

      // submit form
      cy.get("[data-test-id=submitFormButton]").click();
      cy.wait(1000);
      cy.get("[data-test-id=wizardNextButton]").click();
      cy.wait(1000);

      //wizardSaveContinueButton
      cy.get("[data-test-id=wizardSaveContinueButton]").click();
      cy.wait(1000);
      cy.url().should("include", "/portal/user_role/record");
      cy.wait(2000);
    });
  });
});
