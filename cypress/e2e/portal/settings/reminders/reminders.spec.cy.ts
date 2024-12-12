// PATH: /Users/kitmikhaelbagares/Documents/Dna/PlatformApp/recruitment-portal/src/app/portal/(settings)/reminders
// url: http://localhost:3000/portal/settings/reminders
// Create a test script that will test the following:
// 1. Visit the user types page
// 2. Click on the create button
// 3. go to link for wizard
// precondition: user must be logged in

const newArray = [
  "15 minutes before time",
  "30 minutes before time",
  "1 hour before time",
];

describe("Reminders", () => {
  beforeEach(() => {
    // Load login data from the fixture file
    cy.fixture("user").then((data) => {
      // Call the login command with the loaded data
      cy.login(data.username, data.password);
    });
  });

  it("Should access reminders Menu", () => {
    cy.visitMenuSettingsGrid("Reminders");
    cy.wait(1000);
  });

  newArray.forEach((name) => {
    it("Should create reminder.", () => {
      cy.visitMenuSettingsGrid("Reminders");
      cy.createNewRecord("reminder");

      // degree types
      cy.get("[data-test-id=reminder]").type(name);

      // submit form
      cy.get("[data-test-id=submitFormButton]").click();
      cy.wait(1000);
      cy.get("[data-test-id=wizardNextButton]").click();
      cy.wait(1000);

      //wizardSaveContinueButton
      cy.get("[data-test-id=wizardSaveContinueButton]").click();
      cy.wait(1000);
      cy.url().should("include", "/portal/reminder/record");
      cy.wait(2000);
    });
  });
});
