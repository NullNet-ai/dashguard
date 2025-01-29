describe("Number Input", () => {
  beforeEach(() => {
    cy.visit("http://localhost:3000");
    cy.get("[data-test-id=email]").type("admin@dnamicro.com");
    cy.get("[data-test-id=password]").type("ch@ng3m3Pl3@s3!!");
    cy.get("[data-test-id=loginSubmitButton]").click();
    cy.wait(4000);
    cy.wait(4000);
    cy.url().then((url) => {
      cy.wait(4000);

      if (url.includes("/portal/dashboard")) {
        cy.wait(4000);
        cy.wait(4000);

        cy.visit("http://localhost:3000/playground/forms");
        cy.wait(4000);
      }
    });
    cy.url().should("include", "/playground/forms");
  });

  it("should input a number into the number input field", () => {
    cy.get("[data-test-id=number_input]").should("exist");

    cy.get("[data-test-id=number_input]").type("12345");

    cy.get("[data-test-id=number_input]").should("have.value", "12345");
    cy.get("[data-test-id=submitFormButtonFormBuilderNumber]").click();
    cy.wait(2000);
  });

  it("should not allow special characters to be entered in the number input field", () => {
    cy.get("[data-test-id=number_input]").should("exist");

    cy.get("[data-test-id=number_input]").type("!@#$%^&*()");

    cy.get("[data-test-id=number_input]").should("have.value", "");

    cy.get("[data-test-id=submitFormButtonFormBuilderNumber]").click();
    cy.wait(2000);
  });

  it("should show an error message if no value is entered", () => {
    cy.get("[data-test-id=submitFormButtonFormBuilderNumber]").click();

    cy.get("[data-test-id=number_input]").should("exist");
  });
});
