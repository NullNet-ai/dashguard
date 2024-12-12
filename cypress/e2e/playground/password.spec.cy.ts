describe("Password Validation Form", () => {
  beforeEach(() => {
    cy.visit("http://localhost:3000");
    cy.get("[data-test-id=email]").type("admin@dnamicro.com");
    cy.get("[data-test-id=password]").type("ch@ng3m3Pl3@s3!!");
    cy.get("[data-test-id=loginSubmitButton]").click();
    cy.wait(4000);
    cy.url().then((url) => {
      cy.wait(4000);
      if (url.includes("/portal/dashboard")) {
        cy.wait(4000);
        cy.visit("http://localhost:3000/playground/forms");
      }
    });
    cy.wait(4000);
    cy.url().should("include", "/playground/forms");
  });

  it("should show an error if the password is less than 8 characters", () => {
    cy.get('[data-test-id="password"]').type("short1!");
    cy.get("[data-test-id=submitFormButtonFormBuilderPassword]").click();

    cy.contains("Password must be at least 8 characters long.").should(
      "be.visible",
    );
    cy.wait(2000);
  });

  it("should show an error if the password does not contain an uppercase letter", () => {
    cy.wait(4000);
    cy.get('[data-test-id="password"]').type("lowercase1!").blur();
    cy.wait(4000);
    cy.get("[data-test-id=submitFormButtonFormBuilderPassword]").click();

    cy.contains("Password must contain at least one uppercase letter.").should(
      "be.visible",
    );
    cy.wait(4000);
  });

  it("should show an error if the password does not contain a lowercase letter", () => {
    cy.wait(4000);
    cy.get('[data-test-id="password"]').type("UPPERCASE1!").blur();
    cy.get("[data-test-id=submitFormButtonFormBuilderPassword]").click();

    // Check that the error message for lowercase letter appears
    cy.contains("Password must contain at least one lowercase letter.").should(
      "be.visible",
    );
    cy.wait(4000);
  });

  it("should show an error if the password does not contain a number", () => {
    cy.wait(4000);
    cy.get('[data-test-id="password"]').type("NoNumber!");
    cy.get("[data-test-id=submitFormButtonFormBuilderPassword]").click();

    cy.contains("Password must contain at least one number.").should(
      "be.visible",
    );

    cy.wait(4000);
  });

  it("should show an error if the password does not contain a special character", () => {
    cy.wait(2000);
    cy.get('[data-test-id="password"]').type("NoSpecial1");
    cy.get("[data-test-id=submitFormButtonFormBuilderPassword]").click();

    cy.contains("Password must contain at least one special character.").should(
      "be.visible",
    );

    cy.wait(2000);
  });

  it("should accept a valid password and not show any error", () => {
    cy.wait(2000);
    cy.get('[data-test-id="password"]').type("ValidPass1!");
    cy.get("[data-test-id=submitFormButtonFormBuilderPassword]").click();

    // Check that no error message appears for a valid password
    cy.get(".error-message").should("not.exist");

    cy.wait(4000);
  });

  it("should submit the form when the password is valid", () => {
    cy.wait(2000);
    cy.get('[data-test-id="password"]').type("ValidPass1!").blur();

    cy.get("[data-test-id=submitFormButtonFormBuilderPassword]").click();

    cy.wait(4000);
  });
});
