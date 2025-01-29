import { faker } from "@faker-js/faker";

const email = faker.person?.firstName();

describe("Employee Contact Creation - Step 6", () => {
  beforeEach(() => {
    // Load login data from the fixture file
    cy.fixture("user").then((data) => {
      // Call the login command with the loaded data
      cy.login(data.username, data.password);
    });

    cy.visitMainMenuGrid("Contacts");
    cy.createNewRecord("contact");

    //@@@ Timeout bypassing route
    // cy.visit(
    //   "http://localhost:3000/portal/contact/wizard/C100035/6?categories=Employee",
    // );

    //STEP 1
    const random_number = Math.floor(Math.random() * 900) + 10000; //This expression will generate a random 5-digit number between 10000 and 10999
    const phone_number = `88888${random_number}`;
    const first_name = faker.person?.firstName();
    cy.get("[data-test-id=emails1]").type(email);
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

    // STEP 5
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

  it("Should allow entering email and password for the employee's account in step 6.", () => {
    // Verify the email field is read-only and pre-filled with the primary email
    cy.get("[data-test-id=email]").should(($input: any) => {
      expect($input.val().toLowerCase()).to.equal(email.toLowerCase());
    });
    cy.get("[data-test-id=email]").should("have.attr", "readonly");

    // Enter a valid password
    const validPassword = "Passw0rd!";
    cy.get("[data-test-id=password]").type(validPassword);

    // Verify the password meets the requirements
    cy.get("[data-test-id=password]").should("have.value", validPassword);

    // Submit the form
    cy.get("[data-test-id=submitFormButton]").click();
  });

  it("Should validate password field.", () => {
    // Verify the email field is read-only and pre-filled with the primary email
    cy.get("[data-test-id=email]").should(($input: any) => {
      expect($input.val().toLowerCase()).to.equal(email.toLowerCase());
    });
    cy.get("[data-test-id=email]").should("have.attr", "readonly");

    cy.get("[data-test-id=submitFormButton]").click();
    cy.wait(2000);
    cy.get("[id$='-form-item-message']")
      .should("be.visible")
      .and("contain", "Password is required.");
    cy.wait(2000);

    // Enter a valid password
    cy.get("[data-test-id=password]").type("pass");

    cy.get("[id$='-form-item-message']")
      .should("be.visible")
      .and("contain", "Password must be at least 6 characters long.");
    cy.wait(2000);
    cy.get("[data-test-id=password]").clear();
    cy.wait(2000);

    cy.get("[data-test-id=password]").type("password");

    cy.get("[id$='-form-item-message']")
      .should("be.visible")
      .and("contain", "Password must include at least one special character.");
    cy.wait(2000);
    cy.get("[data-test-id=password]").clear();
    cy.wait(2000);

    const valid_password = "Passw0rd!";
    cy.get("[data-test-id=password]").type("Passw0rd!");

    // Verify the password meets the requirements
    cy.get("[data-test-id=password]").should("have.value", valid_password);

    // Submit the form
    cy.get("[data-test-id=submitFormButton]").click();
  });
});
