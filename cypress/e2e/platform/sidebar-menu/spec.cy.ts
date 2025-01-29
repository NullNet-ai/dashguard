describe("template spec", () => {
  beforeEach(() => {
    cy.visit("http://localhost:3000/login");
    cy.get("[data-test-id=email]").type("admin@dnamicro.com");
    cy.get("[data-test-id=password]").type("ch@ng3m3Pl3@s3!!");
    cy.get("[data-test-id=loginSubmitButton]").click();
    cy.url().should("include", "/portal/dashboard");
  });

  it("Should access Contact Menu", () => {
    cy.get("[data-test-id=sidebarMainMenuContacts]").click();
    cy.wait(1000);
    cy.url().should("include", "/portal/contact/grid");
    cy.wait(1000);
  });

  it("Should access Organizations Menu", () => {
    cy.get("[data-test-id=sidebarMainMenuOrganizations]").click();
    cy.wait(1000);
    cy.url().should("include", "/portal/organization/grid");
  });

  it("Should access Bookings Menu", () => {
    cy.get("[data-test-id=sidebarMainMenuBookings]").click();
    cy.wait(1000);
    cy.url().should("include", "/portal/booking/grid");
  });

  it("Should access Positions Menu", () => {
    cy.get("[data-test-id=sidebarGroupMenuSettings]").click();
    cy.wait(1000);
    // After clicking setting menu will collapse
    cy.get("[data-test-id=sidebarMainMenuPositions]").click();
    cy.wait(1000);
    cy.url().should("include", "/portal/position/grid");
  });
});
