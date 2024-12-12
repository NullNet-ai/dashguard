describe("Multi-Select", () => {
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

  it("should input the Multi-TextField forms", () => {
    cy.get("[data-test-id=multi_select_with_optionsInput]").should("exist");
    cy.get("[data-test-id=multi_select_with_optionsInput]").type("Sample text");
    cy.get("[data-test-id=multi_select_with_optionsInput]").should(
      "have.value",
      "Sample text",
    );
    cy.get("[data-test-id=multi_select_singleInput]").should("exist");
    cy.get("[data-test-id=multi_select_singleInput]").type("Sample text2");
    cy.get("[data-test-id=multi_select_singleInput]").should(
      "have.value",
      "Sample text2",
    );
  });

  it("should show an error message if no value is entered", () => {
    cy.get("[data-test-id=multi_select_with_optionsInput]")
      .closest("form")
      .within(() => {
        cy.get("[data-test-id=submitFormButton]").click();
      });
    cy.get("p")
      .contains("Required")
      .should("exist");
    cy.get("p").contains("Required").should("exist");
    cy.wait(1000);
  });

  it("should allow searching in the multi-select", () => {
    cy.get("[data-test-id=multi_select_with_optionsInput]").type("Apple");
    cy.get("[data-value=apple]").should("exist");

    cy.get("[data-test-id=multi_select_singleInput]").type("Apple");
    cy.get("[data-value=apple]").should("exist");
  
  });

it("should display options in alphabetical order", () => {
    cy.get("[data-test-id=multi_select_with_optionsInput]").click();
    const expectedOrder = ["apple", "banana", "cherry", "date", "elderberry"];
    cy.get("[data-value]").filter((index, option) => !!Cypress.$(option).attr("data-value")).then(($options) => {
            const actualOrder = $options.map((index, option) => Cypress.$(option).attr("data-value")).get();
            expect(actualOrder).to.deep.equal(expectedOrder);
    });
});

it("should display options not in alphabetical order", () => {
    cy.get("[data-test-id=multi_select_singleInput]").click();
    const expectedOrder = ["apple", "banana", "cherry", "date", "elderberry"];
    cy.get("[data-value]").then(($options) => {
        const actualOrder = $options.map((_, option) => Cypress.$(option).attr("data-value")).get();
        expect(actualOrder).to.not.deep.equal(expectedOrder);
    });
});

it("should only allow single selection in multi-select ", () => {

    cy.get("[data-test-id=multi_select_singleInput]").click();
    cy.get("[data-value=apple]").should("exist");
    cy.get("[data-value=apple]").click();
    cy.get("[data-value=banana]").click();
    cy.get("[data-title]").contains("Only one value can be selected").should("exist");
});

it("should allow multiple selections in multi-select with options", () => {
    const expectedValue = ["apple", "banana", "cherry", "date", "elderberry"];
    cy.get("[data-test-id=multi_select_with_optionsInput]").click();
    expectedValue.forEach((value) => {
            cy.get(`[data-value=${value}]`).click();
    });
});

});
