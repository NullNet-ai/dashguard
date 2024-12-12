// PATH: /Users/kitmikhaelbagares/Documents/Dna/PlatformApp/recruitment-portal/src/app/portal/(settings)/position_roles
// url: http://localhost:3000/portal/settings/position_roles
// Create a test script that will test the following:
// 1. Visit the user roles page
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
  faker.person.jobTitle(),
];

describe("Position Roles", () => {
  beforeEach(() => {
    // Load login data from the fixture file
    cy.fixture("user").then((data) => {
      // Call the login command with the loaded data
      cy.login(data.username, data.password);
    });
  });

  it("Should access Positions Menu", () => {
    cy.visitMenuSettingsGrid("PositionRoles");
    cy.wait(1000);
  });

  newArray.forEach((name) => {
    it("Should create position role.", () => {
      cy.visitMenuSettingsGrid("PositionRoles");
      cy.createNewRecord("position_role");

      // position roles
      cy.get("[data-test-id=position_role]").type(name);

      // submit form
      cy.get("[data-test-id=submitFormButton]").click();
      cy.wait(1000);
      cy.get("[data-test-id=wizardNextButton]").click();
      cy.wait(1000);

      //wizardSaveContinueButton
      cy.get("[data-test-id=wizardSaveContinueButton]").click();
      cy.wait(1000);
      cy.url().should("include", "/portal/position_role/record");
      cy.wait(2000);
    });
  });
});
