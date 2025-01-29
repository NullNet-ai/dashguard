it(`When they are redirected to the Wizard Step 1, then, they should be able to enter Phone Number, Email, First Name, Middle Name, Last Name, Goes By.`, () => {
  const random_number = Math.floor(Math.random() * 900) + 10000;
  const phone_number = `88888${random_number}`;
  const first_name = faker?.person?.firstName();

  cy.get("[data-test-id=emails1]").type(faker?.internet.email());
  cy.get("[data-test-id=phones1]").type(phone_number);
  cy.get("[data-test-id=first_name]").type(first_name);
  cy.get("[data-test-id=middle_name]").type(faker?.person?.middleName());
  cy.get("[data-test-id=last_name]").type(faker?.person?.lastName());
  cy.get("[data-test-id=goes_by]").type(first_name);
  cy.get("[data-test-id=submitFormButton]").click();
  cy.wait(1000);

  // Assertions
  cy.get("[data-test-id=emails1]").should("have.value", faker?.internet.email());
  cy.get("[data-test-id=phones1]").should("have.value", phone_number);
  cy.get("[data-test-id=first_name]").should("have.value", first_name);
  cy.get("[data-test-id=middle_name]").should("have.value", faker?.person?.middleName());
  cy.get("[data-test-id=last_name]").should("have.value", faker?.person?.lastName());
  cy.get("[data-test-id=goes_by]").should("have.value", first_name);
});