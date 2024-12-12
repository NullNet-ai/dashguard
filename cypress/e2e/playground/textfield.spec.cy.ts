describe("TextField", () => {
  beforeEach(() => {
    cy.visit("http://localhost:3000");
    cy.get("[data-test-id=email]").type("admin@dnamicro.com");
    cy.get("[data-test-id=password]").type("ch@ng3m3Pl3@s3!!");
    cy.get("[data-test-id=loginSubmitButton]").click();
    cy.wait(4000);
    cy.url().then((url) => {
      if (url.includes("/portal/dashboard")) {
        cy.wait(4000);

        cy.visit("http://localhost:3000/playground/forms");

        cy.wait(4000);
      }
    });
    cy.wait(4000);

    cy.url().should("include", "/playground/forms");
  });

  it("should input the TextField form", () => {
    cy.wait(4000);

    cy.get("[data-test-id=textfield]").should("exist");
    // Additional tests for the TextField component
    cy.get("[data-test-id=textfield]").type("Sample text");
    cy.get("[data-test-id=textfield]").should("have.value", "Sample text");
    cy.wait(4000);

    cy.get("[data-test-id=submitFormButtonFormBuilderTextField]").click();
  });

  it("should show an error message if no value is entered", () => {
    cy.wait(4000);
    cy.get("[data-test-id=submitFormButtonFormBuilderTextField]").click();

    cy.get("[data-test-id=textfield]").should("exist");
    cy.get("[data-test-id=input]").should("exist");
    cy.wait(4000);
  });
});
