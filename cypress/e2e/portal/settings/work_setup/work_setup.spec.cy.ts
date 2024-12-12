// PATH: /Users/kitmikhaelbagares/Documents/Dna/PlatformApp/recruitment-portal/src/app/portal/(settings)/work_setups
// url: http://localhost:3000/portal/settings/work_setups
// Create a test script that will test the following:
// 1. Visit the user types page
// 2. Click on the create button
// 3. go to link for wizard
// precondition: user must be logged in

const newArray = ["Hybrid", "Remote", "Onsite"];

describe("Work Setup", () => {
  beforeEach(() => {
    // Load login data from the fixture file
    cy.fixture("user").then((data) => {
      // Call the login command with the loaded data
      cy.login(data.username, data.password);
    });
  });

  it("Should access work setups Menu", () => {
    cy.visitMenuSettingsGrid("WorkSetups");
    cy.wait(1000);
  });

  newArray.forEach((name) => {
    it("Should create work setup.", () => {
      cy.visitMenuSettingsGrid("WorkSetups");
      cy.createNewRecord("work_setup");

      // degree types
      cy.get("[data-test-id=work_setup]").type(name);

      // submit form
      cy.get("[data-test-id=submitFormButton]").click();
      cy.wait(1000);
      cy.get("[data-test-id=wizardNextButton]").click();
      cy.wait(1000);

      //wizardSaveContinueButton
      cy.get("[data-test-id=wizardSaveContinueButton]").click();
      cy.wait(1000);
      cy.url().should("include", "/portal/work_setup/record");
      cy.wait(2000);
    });
  });
});
