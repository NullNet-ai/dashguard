describe("Menu Navigation", () => {
  beforeEach(() => {
    // Replace with your login logic
    cy.fixture("user").then((data) => {
      // Call the login command with the loaded data
      cy.login(data.username, data.password);
    });
  });

  it("should display and allow clicking the Contacts menu item", () => {
    // Navigate to the side panel
    cy.get("nav").should("be.visible");

    // Verify the Contacts menu item is visible and clickable
    cy.get("nav").contains("Contacts").should("be.visible");
    cy.visitMainMenuGrid("Contacts");

    // Verify that clicking the Contacts menu item navigates to the correct URL
    cy.url().should("include", "/contact");
  });
});
