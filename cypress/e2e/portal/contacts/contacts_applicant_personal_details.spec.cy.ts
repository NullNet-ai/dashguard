import { faker } from "@faker-js/faker";

describe("Applicant Contact Creation - Step 3", () => {
  beforeEach(() => {
    // Load login data from the fixture file
    cy.fixture("user").then((data) => {
      // Call the login command with the loaded data
      cy.login(data.username, data.password);
    });

    cy.visitMainMenuGrid("Contacts");
    cy.createNewRecord("contact");

    const random_number = Math.floor(Math.random() * 900) + 10000; //This expression will generate a random 5-digit number between 10000 and 10999

    const phone_number = `88888${random_number}`;
    // STEP 1
    cy.get("[data-test-id=phones1]").type(phone_number);
    cy.get("[data-test-id=emails1]").type(faker.internet.email());
    cy.get("[data-test-id=first_name]").type(faker?.person?.firstName());
    cy.get("[data-test-id=last_name]").type(faker?.person?.lastName());
    cy.get("[data-test-id=wizardNextButton]").click(); // Navigate to step 2
    cy.wait(5000);
    // STEP 2
    // Open the dropdown and select "Applicant"
    cy.get("[data-test-id=categories]").click(); // Open the dropdown
    cy.wait(1000);
    cy.get('select[name="categories"]').select("Applicant", { force: true }); // Select the option
    cy.wait(2000);
    cy.get("[data-test-id=wizardNextButton]").click(); // Navigate to  step 3
    cy.wait(3000);
  });

  it("should allow entering Date of Birth, Nationality, and Address in step 3", () => {
    cy.get("[data-test-id=buttonTriggerDate_of_birth]").click();
    cy.wait(1000);
    cy.get('button[aria-label="Sunday, December 1st, 2024"]').click();

    cy.get('select[name="address.country"]').select("United States", {
      force: true,
    });

    cy.get("[data-test-id=nationalitiesInput]").type("Afghan{enter}");
    cy.get("[data-test-id=nationalitiesInput]").type("Filipino{enter}");

    cy.get('select[name="address.city"]').select("New York", { force: true }); // Select the option

    //Submit the form
    cy.get("[data-test-id=submitFormButton]").click();
    //Verify that the data entered are reflected correctly
    cy.get("[data-test-id=buttonTriggerDate_of_birth]").should(
      "contain",
      "12/01/2024",
    );
    cy.get('select[name="address.country"]').should("contain", "United States");
    //Verify that the nationalities are reflected correctly, containing both Afghan and Filipino
    //!TODO: Fix this assertion
    // cy.get("[data-test-id=nationalitiesInput]").should("contain", [
    //   "Afghan",
    //   "Filipino",
    // ]);
    cy.get('select[name="address.city"]').should("contain", "New York");
    cy.wait(1000);
    //Next
    cy.get("[data-test-id=wizardNextButton]").click();
  });

  it("should display an error message when submitting the form with invalid Date of Birth, ", () => {
    cy.get("[data-test-id=buttonTriggerDate_of_birth]").click();
    cy.wait(1000);
    cy.get('button[aria-label="Sunday, December 15th, 2024"]').click();
    cy.get("[data-test-id=submitFormButton]").click();
    cy.wait(2000);

    cy.get("[id$='-form-item-message']")
      .should("be.visible")
      .and("contain", "Date of Birth should not be greater than today.");

    cy.get("[data-test-id=buttonTriggerDate_of_birth]").should(
      "have.attr",
      "aria-invalid",
      "true",
    );
  } );
});
