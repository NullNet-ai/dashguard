describe("TextField", () => {
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

  it("Has Phone Number Validation based on Google", () => {
    const phoneInputSelector = "[data-test-id=phone-input1]";
    const invalidPhoneMessage = "Invalid phone number";

    cy.get(phoneInputSelector).should("exist");
    cy.get(phoneInputSelector).clear().type("1234567890");
    cy.contains("p", invalidPhoneMessage).should("exist");

    cy.get(phoneInputSelector).clear().type("14185438090");
    cy.contains("p", invalidPhoneMessage).should("not.exist");
  });

  it("Can Select Country Code based on Dropdown", () => {
    cy.get(".react-international-phone-country-selector-button").click();
    cy.get("#react-international-phone__us-option").click({ force: true });
    cy.get("[data-test-id=phone-input1]").should("have.value", "+1 ");
    cy.get("#react-international-phone__gb-option").click({force: true});
    cy.get("[data-test-id=phone-input1]").should("have.value", "+44 ");
  });

  it("Only accepts Numerical Values", () => {
    cy.get("[data-test-id=phone-input1]").type("abc123");
    cy.wait(2000);
    cy.get("[data-test-id=phone-input1]").should("have.value", "+1 (123) ");
  });

  it("You can add more than one phone number.", () => {
      cy.wait(2000);
      cy.get("[data-test-id=phone-input_AddPhoneButton]").click();
    cy.get("[data-test-id=phone-input2]").should("exist");
  });

  it("At least one phone number must be primary which is set by the check box.", () => {
    cy.get("[data-test-id=phone-input_is_primary_badge_1]").should("exist");
  });

  it("You can remove Phone number via the Trash Icon", () => {
    cy.get("[data-test-id=phone-input_AddPhoneButton]").click();
    cy.get("[data-test-id=phone-input_AddPhoneButton]").click();
    cy.get("[data-test-id=phone-input_remove_button_2]").click();
    cy.get("[data-test-id=phone-input2]").should("not.exist");
  });

  it("All added phone numbers must be valid", () => {
    cy.wait(2000);
    cy.get("[data-test-id=phone-input_AddPhoneButton]").click();
    cy.get("[data-test-id=phone-input1]").clear().type("15875302271");
    cy.get("[data-test-id=phone-input2]").clear().type("14047241937");
    cy.get("p").contains("Invalid phone number").should("not.exist");
  });

  it("No duplicate Phone Numbers across the entire system or within the same form", () => {
    cy.wait(2000);

    cy.get("[data-test-id=phone-input_AddPhoneButton]").click();
    cy.get("[data-test-id=phone-input1]").clear().type("15875302271");
    cy.get("[data-test-id=phone-input2]").clear().type("15875302271");
    cy.get("[data-test-id=phone-input1]").closest("form").find("[data-test-id=submitFormButton]").click();
    cy.get("p").contains("Duplicate phone number found.").should("exist");
  });
});
