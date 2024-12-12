// Describe: This file contains the test cases for the organization page.
// BeforeEach: Should login to the portal.

import { faker } from "@faker-js/faker";

describe("Contact Page", () => {
  before(() => {
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
    
    cy.get("[data-test-id=wizardNextButton]").click();
    cy.wait(8000);

    //STEP 2
    cy.get("[data-test-id=categories]").click();
    cy.wait(2000);
    cy.get("[role='option']").contains("Applicant").click({ force: true });
    cy.wait(3000);
    cy.get("[data-test-id=submitFormButton]").click();
    cy.wait(1000);
    cy.get("[data-test-id=wizardNextButton]").click();
    cy.wait(2000);

    //STEP 3
    cy.get("[data-test-id=wizardNextButton]").click();
    cy.wait(5000);
  });

  it(`Given the user creates an Applicant, when they are in the step 4, then they should be able to enter applicant's professional details such as Current Title, Years of Experience, Current Company, Current Salary, Salary Currency, Notice Period.`, () => {
    cy.get("[data-test-id=current_title]").type(faker.person.jobTitle());
    cy.get("[data-test-id=years_of_experience]").type("3");
    cy.get("[data-test-id=current_company]").type(faker.company.name());
    cy.get("[data-test-id=current_salary]").type(
      faker.commerce.price({ min: 1000 }),
    );
    cy.get("[data-test-id=salary_currency]").type(faker.finance.currencyCode());
    cy.get("[data-test-id=notice_period]").click();
    cy.wait(2000);
    cy.get("[role='option']").contains("30 Days").click({ force: true });
    cy.wait(3000);
    cy.get("[data-test-id=submitFormButton]").click();
  });
});
