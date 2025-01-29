// PATH: /Users/kitmikhaelbagares/Documents/Dna/PlatformApp/recruitment-portal/src/app/portal/(settings)/benefits
// url: http://localhost:3000/portal/settings/benefits
// Create a test script that will test the following:
// 1. Visit the user types page
// 2. Click on the create button
// 3. go to link for wizard
// precondition: user must be logged in

const newArray = ["Weekly Vacation Leave", "6 Sick Leaves"];

describe("Benefits", () => {
  beforeEach(() => {
    // Load login data from the fixture file
    cy.fixture("user").then((data) => {
      // Call the login command with the loaded data
      cy.login(data.username, data.password);
    });
  });

  it("Should access Benefits Menu", () => {
    cy.visitMenuSettingsGrid("Benefits");
    cy.wait(1000);
  });

  newArray.forEach((name) => {
    it("Should create benefit.", () => {
      cy.visitMenuSettingsGrid("Benefits");
      cy.createNewRecord("benefit");

      // benefit
      cy.get("[data-test-id=benefit]").type(name);

      // submit form
      cy.get("[data-test-id=submitFormButton]").click();
      cy.wait(1000);
      cy.get("[data-test-id=wizardNextButton]").click();
      cy.wait(1000);

      //wizardSaveContinueButton
      cy.get("[data-test-id=wizardSaveContinueButton]").click();
      cy.wait(1000);
      cy.url().should("include", "/portal/benefit/record");
      cy.wait(2000);
    });
  });
});
