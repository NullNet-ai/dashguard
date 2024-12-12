// Describe: This file contains the test cases for the organization page.
// BeforeEach: Should login to the portal.

import { faker } from "@faker-js/faker";

function generatePhoneNumber() {
  const random_number = Math.floor(Math.random() * 900) + 10000; // Generate a random 5-digit number
  return `88888${random_number}`;
}

describe("Contact Page", () => {
  beforeEach(() => {
    // Load login data from the fixture file
    cy.fixture("user").then((data) => {
      // Call the login command with the loaded data
      cy.login(data.username, data.password);
    });

    cy.visitMainMenuGrid("Contacts");
    cy.createNewRecord("contact");
  });

  it("When they are redirected to the Wizard Step 1, then, they should be able to enter Phone Number, Email, First Name, Middle Name, Last Name, Goes By.", () => {
    const phone_number = generatePhoneNumber();
    const first_name = faker?.person?.firstName();

    // Assert all input fields exist
    cy.get("[data-test-id=emails1]").should("exist");
    cy.get("[data-test-id=phones1]").should("exist");
    cy.get("[data-test-id=first_name]").should("exist");
    cy.get("[data-test-id=middle_name]").should("exist");
    cy.get("[data-test-id=last_name]").should("exist");
    cy.get("[data-test-id=goes_by]").should("exist");
    cy.get("[data-test-id=submitFormButton]").should("exist");

    // Interact with the fields
    cy.get("[data-test-id=emails1]").type(faker?.internet.email());
    cy.get("[data-test-id=phones1]").type(phone_number);
    cy.get("[data-test-id=first_name]").type(first_name);
    cy.get("[data-test-id=middle_name]").type(faker?.person?.middleName());
    cy.get("[data-test-id=last_name]").type(faker?.person?.lastName());
    cy.get("[data-test-id=goes_by]").type(first_name);

    // Submit the form
    cy.get("[data-test-id=submitFormButton]").click();
  });

  it("When submitting the Basic Details form without phone number value, then display error message Phone Number is required.", () => {
    cy.get("[data-test-id=phones1]").clear();
    cy.get("[data-test-id=submitFormButton]").click();

    cy.get("p.text-destructive")
      .should("be.visible")
      .and("contain", "Phone Number is required.");
  });

  it("When submitting the Basic Details form with +1 phone number value only, then display error message Phone number must be at least 10 characters.", () => {
    // attempt to submit the form
    cy.get("[data-test-id=submitFormButton]").click(); // Replace with the actual submit button test ID

    // Verify that the error message is displayed
    cy.get("p.text-destructive") //No specific test ID, so using the tag name
      .should("be.visible")
      .and("contain", "Phone Number must be at least 10 characters.");
  });

  it("When submitting the Basic Details form with an invalid phone number, then display error message Phone Number is invalid.", () => {
    const invalid_phone_number = "3333333333";

    cy.get("[data-test-id=phones1]").clear().type(invalid_phone_number);
    cy.get("[data-test-id=submitFormButton]").click();

    cy.get("p.text-destructive")
      .should("be.visible")
      .and("contain", "Phone Number is invalid.");
  });

  it("When submitting the Basic Details form with duplicate phone numbers, then display error message Duplicate phone number found.", () => {
    const phone_number = generatePhoneNumber();
    cy.get("[data-test-id=phones1]").type(phone_number);
    cy.get("[data-test-id=phones_AddPhoneButton]").click();
    cy.wait(1000);
    cy.get("[data-test-id=phones2]").should("exist");
    cy.get("[data-test-id=phones2]").type(phone_number);

    cy.get("[data-test-id=submitFormButton]").click();

    cy.get("p.text-destructive") //No specific test ID, so using the tag name
      .should("be.visible")
      .and("contain", "Duplicate phone number found.");
  });

  //!!Not allowed to remove primary phone number now
  // it("When submitting the Basic Details form without primary phone number, then display error message At least one phone number should be marked as primary.", () => {
  //   const phone_number = generatePhoneNumber();
  //   cy.get("[data-test-id=phones_AddPhoneButton]").click();
  //   cy.wait(2000);
  //   cy.get("[data-test-id=phones2]").should("exist");
  //   cy.get("[data-test-id=phones_remove_button_1]").should("exist");
  //   cy.wait(2000);
  //   cy.get("[data-test-id=phones2]").type(phone_number);
  //   cy.wait(2000);
  //   cy.get("[data-test-id=phones_remove_button_1]").click();
  //   cy.wait(5000);
  //   cy.get("[data-test-id=submitFormButton]").click();

  //   cy.get("p.text-destructive") //No specific test ID, so using the tag name
  //     .should("be.visible")
  //     .and("contain", "At least one phone number should be marked as primary.");
  // });

  // it("When in the Basic Details form and if primary phone numbers is removed, then I should be able to set new primary email.", () => {
  //   const phone_number = generatePhoneNumber();
  //   cy.get("[data-test-id=phones1]").type(phone_number);
  //   cy.get("[data-test-id=phones_AddPhoneButton]").click();
  //   cy.wait(2000);
  //   cy.get("[data-test-id=phones2]").should("exist");
  //   cy.wait(2000);
  //   cy.get("[data-test-id=phones2]").type(phone_number);
  //   cy.wait(2000);
  //   cy.get("[data-test-id=phones_remove_button_1]").click();
  //   cy.wait(2000);
  //   cy.get("[data-test-id=phones_is_primary_button_1]").click();
  //   cy.wait(2000);
  //   cy.get("[data-test-id=submitFormButton]").click();
  // });

  it("When submitting the Basic Details form without email value, then display error message Email is required.", () => {
    cy.get("[data-test-id=submitFormButton]").click();

    cy.get("p.text-destructive")
      .should("be.visible")
      .and("contain", "Email is required.");
  });

  it("When submitting the Basic Details form with invalid email value, then display error message Email is invalid.", () => {
    const invalid_email = "test";
    cy.get("[data-test-id=emails1]").type(invalid_email);
    cy.get("[data-test-id=submitFormButton]").click();

    cy.get("p.text-destructive")
      .should("be.visible")
      .and("contain", "Email is invalid.");
  });

  it("When submitting the Basic Details form with duplicate emails, then display error message Duplicate email found.", () => {
    const email = faker.internet.email();
    cy.get("[data-test-id=emails1]").type(email);
    cy.get("[data-test-id=emailsAddEmailButton]").click();
    cy.wait(1000);
    cy.get("[data-test-id=emails11]").should("exist");
    cy.get("[data-test-id=emails11]").type(email);

    cy.get("[data-test-id=submitFormButton]").click();

    cy.get("p.text-destructive")
      .should("be.visible")
      .and("contain", "Duplicate email found.");
  });

  //!!Not allowed to remove primary email now
  // it("When submitting the Basic Details form without primary email, then display error message At least one email should be marked as primary.", () => {
  //   const email = faker.internet.email();
  //   cy.get("[data-test-id=emails1]").type(email);
  //   cy.get("[data-test-id=emailsAddEmailButton]").click();
  //   cy.wait(1000);
  //   cy.get("[data-test-id=emails11]").should("exist");
  //   cy.get("[data-test-id=emails11]").type(email);
  //   cy.wait(2000);
  //   cy.get("[data-test-id=emails01RemoveEmailButton]").click();
  //   cy.wait(2000);
  //   cy.get("[data-test-id=submitFormButton]").click();

  //   cy.get("p.text-destructive") //No specific test ID, so using the tag name
  //     .should("be.visible")
  //     .and("contain", "At least one email should be marked as primary.");
  // });

  // it("When in the Basic Details form and if primary email is removed, then I should be able to set a new primary email.", () => {
  //   const email = faker.internet.email();
  //   cy.get("[data-test-id=emails1]").type(email);
  //   cy.get("[data-test-id=emailsAddEmailButton]").click();
  //   cy.wait(1000);
  //   cy.get("[data-test-id=emails11]").should("exist");
  //   cy.get("[data-test-id=emails11]").type(email);
  //   cy.wait(2000);
  //   cy.get("[data-test-id=emails01RemoveEmailButton]").click();
  //   cy.wait(2000);
  //   cy.get("[data-test-id=submitFormButton]").click();
  //   cy.wait(2000);
  //   cy.get("[data-test-id=phonesIsPrimaryButton01]").click();
  //   cy.wait(2000);
  //   cy.get("[data-test-id=submitFormButton]").click();
  // });

  it("When submitting the Basic Details form if first name is empty, then display error message First Name is required.", () => {
    cy.get("[data-test-id=submitFormButton]").click();

    cy.get("[id$='-form-item-message']")
      .should("be.visible")
      .and("contain", "First Name is required");

    // Optionally check the aria-invalid attribute
    cy.get("[data-test-id=first_name]").should(
      "have.attr",
      "aria-invalid",
      "true",
    );
  });

  it("When submitting the Basic Details form if last name is empty, then display error message Last Name is required.", () => {
    cy.get("[data-test-id=submitFormButton]").click();

    cy.get("[id$='-form-item-message']")
      .should("be.visible")
      .and("contain", "Last Name is required");

    cy.get("[data-test-id=last_name]").should(
      "have.attr",
      "aria-invalid",
      "true",
    );
  });
});
