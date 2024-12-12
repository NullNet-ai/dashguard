// Describe: This file contains the test cases for the contacts grid.
// BeforeEach: Should login to the portal.

describe("Contacts Grid", () => {
  beforeEach(() => {
    //LOGIN
    cy.fixture("user").then((data) => {
      cy.login(data.username, data.password);
    });
  });

  it("When they access the Contact Menu then, they should be able to see a grid with all contact records with the following information", () => {
    cy.visitMainMenuGrid("Contacts");

    //verify if <table> component with no data-test-id is visible with a thead and tbody
    cy.get("table").should("exist");
    cy.get("table").find("thead").should("exist");
    cy.get("table").find("tbody").should("exist");

    //Verify if the column headers are visible and correct
    cy.get("table").find("thead").find("th").should("have.length", 14);
    cy.get("table")
      .find("thead")
      .find("th")
      .eq(1)
      .should("have.text", "Status");
    cy.get("table").find("thead").find("th").eq(2).should("have.text", "Code");
    cy.get("table")
      .find("thead")
      .find("th")
      .eq(3)
      .should("have.text", "Category");
    cy.get("table")
      .find("thead")
      .find("th")
      .eq(4)
      .should("have.text", "First Name");
    cy.get("table")
      .find("thead")
      .find("th")
      .eq(5)
      .should("have.text", "Middle Name");
    cy.get("table")
      .find("thead")
      .find("th")
      .eq(6)
      .should("have.text", "Last Name");
    cy.get("table")
      .find("thead")
      .find("th")
      .eq(7)
      .should("have.text", "Primary Phone No.");
    cy.get("table")
      .find("thead")
      .find("th")
      .eq(8)
      .should("have.text", "Primary Email");
    cy.get("table")
      .find("thead")
      .find("th")
      .eq(9)
      .should("have.text", "Updated Date");
    cy.get("table")
      .find("thead")
      .find("th")
      .eq(10)
      .should("have.text", "Updated By");
    cy.get("table")
      .find("thead")
      .find("th")
      .eq(11)
      .should("have.text", "Created Date");
    cy.get("table")
      .find("thead")
      .find("th")
      .eq(12)
      .should("have.text", "Created By");
    cy.get("table")
      .find("thead")
      .find("th")
      .eq(13)
      .should("have.text", "Actions");

    cy.get("table")
      .find("tbody")
      .find("tr")
      .should("have.length.greaterThan", 0);

    // Verify that the Actions column contains an ellipsis icon that is clickable and shows a dropdown with options: Edit, Archive
    cy.get("table")
      .find("tbody > tr")
      .last()
      .find("td:last-child button")
      .should("exist");

    // cy.get("[data-test-id=grid]").should("exist");
    // cy.get("[data-test-id=grid]").find("[data-test-id=gridRow]").should("have.length.greaterThan", 0);
    // cy.get("[data-test-id=grid]").find("[data-test-id=gridRow]").first().find("[data-test-id=gridRowColumn]").should("have.length.greaterThan", 0);

    // //test to check if the following columns exist: State, ID, Category, First Name, Middle Name, Last Name, Primary Phone Number, Primary Email, Updated Date, Updated By, Created Date, Created By, Actions

    // cy.get("[data-test-id=grid]").find("[data-test-id=gridRow]").first().find("[data-test-id=gridRowColumn]").last().find("[data-test-id=gridRowColumnActions]").should("exist");
    // cy.get("[data-test-id=grid]").find("[data-test-id=gridRow]").first().find("[data-test-id=gridRowColumn]").last().find("[data-test-id=gridRowColumnActions]").find("[data-test-id=gridRowColumnActionsEditButton]").should("exist");
    // cy.get("[data-test-id=grid]").find("[data-test-id=gridRow]").first().find("[data-test-id=gridRowColumn]").last().find("[data-test-id=gridRowColumnActions]").find("[data-test-id=gridRowColumnActionsArchiveButton]").should("exist");
  });
});
