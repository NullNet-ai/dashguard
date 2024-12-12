// PATH: /Users/kitmikhaelbagares/Documents/Dna/PlatformApp/recruitment-portal/src/app/portal/(settings)/requirement_types
// url: http://localhost:3000/portal/settings/requirement_types
// Create a test script that will test the following:
// 1. Visit the user types page
// 2. Click on the create button
// 3. go to link for wizard
// precondition: user must be logged in

const newArray = ["MERN Stack", "SQL Expert", "React Native Developer"];

describe("Requirement Types", () => {
  beforeEach(() => {
    // Load login data from the fixture file
    cy.fixture("user").then((data) => {
      // Call the login command with the loaded data
      cy.login(data.username, data.password);
    });
  });

  it("Should access requirement types Menu", () => {
    cy.visitMenuSettingsGrid("RequirementTypes");
    cy.wait(1000);
  });

  newArray.forEach((name) => {
    it("Should create requirement type.", () => {
      cy.visitMenuSettingsGrid("RequirementTypes");
      cy.createNewRecord("requirement_type");

      // degree types
      cy.get("[data-test-id=requirement_type]").type(name);

      // submit form
      cy.get("[data-test-id=submitFormButton]").click();
      cy.wait(1000);
      cy.get("[data-test-id=wizardNextButton]").click();
      cy.wait(1000);

      //wizardSaveContinueButton
      cy.get("[data-test-id=wizardSaveContinueButton]").click();
      cy.wait(1000);
      cy.url().should("include", "/portal/requirement_type/record");
      cy.wait(2000);
    });
  });
});
