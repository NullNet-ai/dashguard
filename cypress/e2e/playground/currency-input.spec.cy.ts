describe("Currency Input Functionality", () => {
  beforeEach(() => {
    cy.visit("http://localhost:3000");
    cy.get("[data-test-id=email]").type("admin@dnamicro.com");
    cy.get("[data-test-id=password]").type("ch@ng3m3Pl3@s3!!");
    cy.get("[data-test-id=loginSubmitButton]").click();
    cy.wait(2000);
    cy.url().then((url) => {
      if (url.includes("/portal/dashboard")) {
        cy.visit("http://localhost:3000/playground/forms");
      }
    });

    cy.url().should("include", "/playground/forms");
  });

  it("should allow user to input numeric values with up to two decimal places", () => {
    cy.get("[data-test-id=amountCurrencyInput]")
      .clear()
      .type("100000")
      .should("have.value", "$1,000.00");

    cy.get("[data-test-id=amountCurrencyInput]")
      .clear()
      .type("9999")
      .should("have.value", "$99.99");
  });

  it("should format the input as currency with a currency symbol", () => {
    cy.get("[data-test-id=amountCurrencyInput]")
      .clear()
      .type("100000")
      .should("have.value", "$1,000.00");

    cy.get("[data-test-id=amountCurrencyInput]")
      .clear()
      .type("123456789")
      .should("have.value", "$1,234,567.89");
  });

  it("should allow user to select a currency from the dropdown", () => {
    cy.get("[data-test-id=amountCurrencyTrigger]").click();
    cy.get("[data-test-id=amountCurrencySelectOptionEUR]").click();

    cy.get("[data-test-id=amountCurrencyInput]")
      .clear()
      .type("100000")
      .should("have.value", "£1,000.00");
  });
});