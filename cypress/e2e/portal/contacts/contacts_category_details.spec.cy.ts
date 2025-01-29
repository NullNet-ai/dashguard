import { faker } from "@faker-js/faker";
import { setUpContactStepOne } from "./prerequisite/contact.cy";

describe("Contact Category Details", () => {
  beforeEach(() => {
    // Load login data from the fixture file
    cy.fixture("user").then((data) => {
      // Call the login command with the loaded data
      cy.login(data.username, data.password);
    });

    cy.visitMainMenuGrid("Contacts");
    cy.createNewRecord("contact");
    cy.wait(1000);
    //STEP 1
    const email = faker.person?.firstName() + "@gmail.com";

    setUpContactStepOne(email);
  });

  it(`Given the user creates a new Contact. When they are in Step 2. Then, they should be able to specify the category of the Contact they create.`, () => {
    cy.get("[data-test-id=categories]").click();
    cy.wait(2000);
    cy.get("[role='option']").contains("Applicant").click({ force: true });
    cy.wait(3000);
    cy.get("[data-test-id=submitFormButton]").click();
    //Validate that the category is not empty
    cy.get("[data-test-id=categories]").should("not.contain", "Select");
    //verify that the category is selected
    cy.get("[data-test-id=categories]").should("contain", "Applicant");
    cy.wait(1000);
    cy.get("[data-test-id=wizardNextButton]").click();
    cy.wait(2000);
  });

  it(`When submitting the Category Details form with no selected Category, then display error message Category is required.`, () => {
    cy.get("[data-test-id=submitFormButton]").click();
    cy.wait(2000);

    cy.get("[id$='-form-item-message']")
      .should("be.visible")
      .and("contain", "Category is required.");

    cy.get("[data-test-id=categories]").should(
      "have.attr",
      "aria-invalid",
      "true",
    );
  });
});
