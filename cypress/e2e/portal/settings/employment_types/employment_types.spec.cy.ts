// PATH: /Users/kitmikhaelbagares/Documents/Dna/PlatformApp/recruitment-portal/src/app/portal/(settings)/employment_types
// url: http://localhost:3000/portal/settings/employment_types
// Create a test script that will test the following:
// 1. Visit the user types page
// 2. Click on the create button
// 3. go to link for wizard
// precondition: user must be logged in

const newArray = ["Full Time", "Part Time"];

describe("Employment Types", () => {
  beforeEach(() => {
    // Load login data from the fixture file
    cy.fixture("user").then((data) => {
      // Call the login command with the loaded data
      cy.login(data.username, data.password);
    });
  });

  it("Should access EmploymentTypes Menu", () => {
    cy.visitMenuSettingsGrid("EmploymentTypes");
    cy.wait(1000);
  });

  newArray.forEach((name) => {
    it("Should create employee type.", () => {
      cy.visitMenuSettingsGrid("EmploymentTypes");
      cy.createNewRecord("employment_type");

      // EmploymentTypes
      cy.get("[data-test-id=employment_type]").type(name);

      // submit form
      cy.get("[data-test-id=submitFormButton]").click();
      cy.wait(1000);
      cy.get("[data-test-id=wizardNextButton]").click();
      cy.wait(1000);

      //wizardSaveContinueButton
      cy.get("[data-test-id=wizardSaveContinueButton]").click();
      cy.wait(1000);
      cy.url().should("include", "/portal/employment_type/record");
      cy.wait(2000);
    });
  });
});
