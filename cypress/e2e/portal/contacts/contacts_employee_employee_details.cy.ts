// Describe: This file contains the test cases for the organization page.
// BeforeEach: Should login to the portal.

import { faker } from "@faker-js/faker";

describe("Contact Page", () => {
  beforeEach(() => {
    // Load login data from the fixture file
    cy.fixture("user").then((data) => {
      // Call the login command with the loaded data
      cy.login(data.username, data.password);
    });

    cy.visitMainMenuGrid("Contacts");
    cy.createNewRecord("contact");

    //STEP 1
    const random_number = Math.floor(Math.random() * 900) + 10000; //This expression will generate a random 5-digit number between 10000 and 10999
    const phone_number = `88888${random_number}`;
    const first_name = faker.person?.firstName();
    cy.get("[data-test-id=emails1]").type(faker.internet.email());
    cy.get("[data-test-id=phones1]").type(phone_number);
    cy.get("[data-test-id=first_name]").type(first_name);
    cy.get("[data-test-id=last_name]").type(faker.person?.lastName());
    // cy.get("[data-test-id=submitFormButton]").click();
    // cy.wait(2000);
    cy.get("[data-test-id=wizardNextButton]").click();
    cy.wait(10000);
    cy.wait(10000);

    //STEP 2
    cy.get("[data-test-id=categories]").click();
    cy.wait(2000);
    cy.get("[role='option']").contains("Employee").click({ force: true });
    cy.wait(2000);
    cy.get("[data-test-id=submitFormButton]").click(); //Why next?
    // cy.wait(4000);
    // cy.get("[data-test-id=wizardNextButton]").click(); //Weird
    cy.wait(5000);

    //STEP 3
    cy.get("[data-test-id=user_role_id]").click();
    cy.wait(2000);
    cy.get('[role="option"]').first().click({ force: true });
    cy.wait(2000);
    cy.get("[data-test-id=submitFormButton]").click();
    cy.wait(2000);
    cy.get("[data-test-id=wizardNextButton]").click();
    cy.wait(5000);

    //STEP 4
    // cy.get("[data-test-id=wizardNextButton]").click();
    // cy.get("[data-test-id=wizardNextButton]").click();
    // cy.wait(10000);

    //@@clicking next takes too much time
    cy.location("href").then((url) => {
      // @@@bypassing just to proceed po.
      const modifiedUrl = url.replace("/4?", "/5?");

      // Optionally, you can visit the modified URL
      cy.visit(modifiedUrl);
    });
  });

  it(`Given the user creates an Employee, when they are in the step 5, then they should be able to enter Organization, Sub Organization, Job Title.`, () => {
    cy.get("[data-test-id=organizations]").click();
    cy.wait(1000); // Don't want to use the global-organization so please create a new organization
    cy.get('[role="option"]').first().click({ force: true });

    cy.get('[data-test-id="sub_organizations"]').click({ force: true });
    cy.wait(1000); // Wait for dropdown to fully open
    cy.get('[role="option"]').first().click({ force: true });

    cy.get("[data-test-id=job_title]").type(faker.person.jobTitle());
    cy.wait(2000);

    cy.get("[data-test-id=submitFormButton]").click(); //Why next?
  });

  it(`When in the Employee Details form, the Organization field should be prefilled with the login organization.`, () => {
    cy.get('select[name="organizations"]').should(
      "contain",
      "global-organization", //This should be the organization from the logged in account
    );
    cy.wait(2000);
  });

  it(`When submitting the Employee Details form with empty job title, then display error message Job Title is required.`, () => {
    cy.get("[data-test-id=submitFormButton]").click();
    cy.wait(2000);

    cy.get("[id$='-form-item-message']")
      .should("be.visible")
      .and("contain", "Job Title is required.");

    cy.get("[data-test-id=job_title]").should(
      "have.attr",
      "aria-invalid",
      "true",
    );
  });
});
