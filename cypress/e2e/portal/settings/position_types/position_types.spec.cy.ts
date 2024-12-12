// PATH: /Users/kitmikhaelbagares/Documents/Dna/PlatformApp/recruitment-portal/src/app/portal/(settings)/position_types
// url: http://localhost:3000/portal/settings/position_types
// Create a test script that will test the following:
// 1. Visit the user types page
// 2. Click on the create button
// 3. go to link for wizard
// precondition: user must be logged in

const newArray = ["Full Time", "Part Time", "Contractual", "Intern"];

describe("Position Types", () => {
  beforeEach(() => {
    // Load login data from the fixture file
    cy.fixture("user").then((data) => {
      // Call the login command with the loaded data
      cy.login(data.username, data.password);
    });
  });

  it("Should access Position Types Menu", () => {
    cy.visitMenuSettingsGrid("PositionTypes");
    cy.wait(1000);
  });

  newArray.forEach((name) => {
    it("Should create position type.", () => {
      cy.visitMenuSettingsGrid("PositionTypes");
      cy.createNewRecord("position_type");

      // position types
      cy.get("[data-test-id=position_type]").type(name);

      // submit form
      cy.get("[data-test-id=submitFormButton]").click();
      cy.wait(1000);
      cy.get("[data-test-id=wizardNextButton]").click();
      cy.wait(1000);

      //wizardSaveContinueButton
      cy.get("[data-test-id=wizardSaveContinueButton]").click();
      cy.wait(1000);
      cy.url().should("include", "/portal/position_type/record");
      cy.wait(2000);
    });
  });
});
