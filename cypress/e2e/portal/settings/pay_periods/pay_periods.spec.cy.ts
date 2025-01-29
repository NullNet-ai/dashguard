// PATH: /Users/kitmikhaelbagares/Documents/Dna/PlatformApp/recruitment-portal/src/app/portal/(settings)/pay_periods
// url: http://localhost:3000/portal/settings/pay_periods
// Create a test script that will test the following:
// 1. Visit the user types page
// 2. Click on the create button
// 3. go to link for wizard
// precondition: user must be logged in

const newArray = ["Weekly", "Monthly", "Quarterly"];

describe("Pay Periods", () => {
  beforeEach(() => {
    // Load login data from the fixture file
    cy.fixture("user").then((data) => {
      // Call the login command with the loaded data
      cy.login(data.username, data.password);
    });
  });

  it("Should access Pay Periods Menu", () => {
    cy.visitMenuSettingsGrid("PayPeriods");
    cy.wait(1000);
  });

  newArray.forEach((name) => {
    it("Should create pay period.", () => {
      cy.visitMenuSettingsGrid("PayPeriods");
      cy.createNewRecord("pay_period");

      // degree types
      cy.get("[data-test-id=pay_period]").type(name);

      // submit form
      cy.get("[data-test-id=submitFormButton]").click();
      cy.wait(1000);
      cy.get("[data-test-id=wizardNextButton]").click();
      cy.wait(1000);

      //wizardSaveContinueButton
      cy.get("[data-test-id=wizardSaveContinueButton]").click();
      cy.wait(1000);
      cy.url().should("include", "/portal/pay_period/record");
      cy.wait(2000);
    });
  });
});
