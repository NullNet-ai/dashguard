describe("Checkbox", () => {
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

  it("should toggle all checkboxes and submit successfully", () => {
    const checkboxCount = 2;
    cy.wait(2000);
    for (let i = 0; i <= checkboxCount; i++) {
      cy.get(`[data-test-id=checkbox${i}]`).should("exist");

      cy.get(`[data-test-id=checkbox${i}]`)
        .click()
        .should("have.attr", "aria-checked", "true");
      if (i < checkboxCount) {
        cy.get(`[data-test-id=checkbox${i}]`)
          .click()
          .should("have.attr", "aria-checked", "false");
      }
    }

    cy.wait(2000);
    cy.get(`[data-test-id=checkbox${checkboxCount}]`).should(
      "have.attr",
      "aria-checked",
      "true",
    );

    cy.get("[data-test-id=submitFormButton]").click();
  });

  it("should show an error message if no checkbox is selected", () => {
    cy.wait(1000);
    cy.get("[data-test-id=submitFormButton]").click();
    cy.wait(1000);
    cy.contains("At least one checkbox must be selected").should("be.visible");
    cy.wait(1000);
  });

  it("should submit successfully with all checkboxes selected", () => {
    const checkboxCount = 2;
    for (let i = 0; i <= checkboxCount; i++) {
      cy.get(`[data-test-id=checkbox${i}]`).then(($checkbox) => {
        if ($checkbox.attr("aria-checked") !== "true") {
          cy.wrap($checkbox)
            .click()
            .should("have.attr", "aria-checked", "true");
        }
      });
    }

    cy.get("[data-test-id=submitFormButton]").click();
  });
});
