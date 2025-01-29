describe("Email", () => {
  beforeEach(() => {
    cy.visit("http://localhost:3000");
    cy.get("[data-test-id=email]").type("admin@dnamicro.com");
    cy.get("[data-test-id=password]").type("ch@ng3m3Pl3@s3!!");
    cy.get("[data-test-id=loginSubmitButton]").click();
    cy.wait(4000);
    cy.url().then((url) => {
      if (url.includes("/portal/dashboard")) {
        cy.visit("http://localhost:3000/playground/forms");
      }
    });
    cy.url().should("include", "/playground/forms");
  });

  it("should input and submit a single email correctly", () => {
    const singleEmail = "test@example.com";
    cy.get("[data-test-id=email_input01]").clear().type(singleEmail);
    cy.get("[data-test-id=email_input01]").should("have.value", singleEmail);
    cy.wait(2000);
    // Should throw an error if duplicate email
    const multiEmail =
      "test1@example.com, test1@example.com, test3@example.com";
    const emailsArray = multiEmail.split(", ");

    emailsArray.forEach((email, index) => {
      cy.wait(2000);
      // Input the email into the newly added field
      cy.get(`[data-test-id=emails${index}1]`).clear().type(email);
      cy.get(`[data-test-id=emails${index}1]`).should("have.value", email);

      cy.wait(2000);
      // Click the "Add Email" button to add a new email field
      cy.get("[data-test-id=emailsAddEmailButton]").click();
      cy.wait(2000);

      cy.get(`[data-test-id=emails${index}1]`).clear().type(email);
      cy.get(`[data-test-id=emails${index}1]`).should("have.value", email);
      cy.wait(2000);

      // Attempt to delete primary email
      cy.get(`[data-test-id=emails${index}1RemoveEmailButton]`).click();
    });

    cy.get("[data-test-id=submitFormButton]").click();
  });

  it("should show an error message for invalid email format", () => {
    const invalidEmail = "invalid-email";
    cy.get("[data-test-id=emails1]").clear().type(invalidEmail);
    cy.get("[data-test-id=emails1]").should("have.value", invalidEmail);
    cy.get("[data-test-id=submitFormButton]").click();
    cy.contains("Please enter a valid email address").should("be.visible");
  });
});
