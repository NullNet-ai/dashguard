// PATH: /Users/kitmikhaelbagares/Documents/Dna/PlatformApp/recruitment-portal/src/app/portal/(settings)/degree_levels
// url: http://localhost:3000/portal/settings/degree_levels
// Create a test script that will test the following:
// 1. Visit the user types page
// 2. Click on the create button
// 3. go to link for wizard
// precondition: user must be logged in

const newArray = [
  "Bachelor's Degree",
  "Master's Degree",
  "Doctorate Degree",
  "Associate Degree",
];

describe("Degree Levels", () => {
  beforeEach(() => {
    // Load login data from the fixture file
    cy.fixture("user").then((data) => {
      // Call the login command with the loaded data
      cy.login(data.username, data.password);
    });
  });

  it("Should access Degree Levels Menu", () => {
    cy.visitMenuSettingsGrid("DegreeLevels");
    cy.wait(1000);
  });

  newArray.forEach((name) => {
    it("Should create degree level.", () => {
      cy.visitMenuSettingsGrid("DegreeLevels");
      cy.createNewRecord("degree_level");

      // degree types
      cy.get("[data-test-id=degree_level]").type(name);

      // submit form
      cy.get("[data-test-id=submitFormButton]").click();
      cy.wait(1000);
      cy.get("[data-test-id=wizardNextButton]").click();
      cy.wait(1000);

      //wizardSaveContinueButton
      cy.get("[data-test-id=wizardSaveContinueButton]").click();
      cy.wait(1000);
      cy.url().should("include", "/portal/degree_level/record");
      cy.wait(2000);
    });
  });
});
