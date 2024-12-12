describe("Date Selection Functionality", () => {
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

  it("should allow user to manually input a specific date", () => {


    // Find the date input and type a specific date
    cy.get("[data-test-id=smart-dateDateInput]")
      .clear()
      .type("12/25/2024")
      .should("have.value", "12/25/2024");
  });

  it("should allow user to select a date using the date picker", () => {

    // Open the date picker
    cy.get("[data-test-id=smart-dateDatePicker]").click();

    // Select a specific date (e.g., 15th of the month)
    cy.contains("button[name=day]", "15").click();

    // Verify the selected date is correctly displayed in the input
    cy.get("[data-test-id=smart-dateDateInput]").should(
      "have.value",
      "12/15/2024",
    );
  });
});
