describe("Radio", () => {
  beforeEach(() => {
    cy.visit("http://localhost:3000");
    cy.get("[data-test-id=email]").type("admin@dnamicro.com");
    cy.get("[data-test-id=password]").type("ch@ng3m3Pl3@s3!!");
    cy.get("[data-test-id=loginSubmitButton]").click();
    cy.wait(4000);
    cy.url().then((url) => {
      if (url.includes("/portal/dashboard")) {
        cy.wait(2000);
        cy.visit("http://localhost:3000/playground/forms");
      }
    });
    cy.wait(2000);
    cy.url().should("include", "/playground/forms");
  });

  it("should toggle radio buttons and submit successfully", () => {
    const radioCount = 2;
    cy.wait(2000);

    // Loop through each radio button, check and uncheck
    for (let i = 0; i <= radioCount; i++) {
      cy.get(`[data-test-id=radiooption${i}1]`).should("exist");

      // Click and ensure the radio button is selected
      cy.get(`[data-test-id=radiooption${i}1]`)
        .click()
        .should("have.attr", "aria-checked", "true");

      // Ensure no other radio buttons are selected
      for (let j = 0; j <= radioCount; j++) {
        if (j !== i) {
          cy.get(`[data-test-id=radiooption${j}1]`).should(
            "have.attr",
            "aria-checked",
            "false",
          );
        }
      }
    }

    // Submit the form
    cy.get("[data-test-id=submitFormButtonFormBuilderRadio]").click();
  });

  it("should show an error message if no radio button is selected", () => {
    cy.wait(1000);
    cy.get("[data-test-id=submitFormButtonFormBuilderRadio]").click();
    cy.wait(1000);
    cy.contains("Radio is required").should("be.visible");
    cy.wait(1000);
  });
});
