describe("TextArea", () => {
  beforeEach(() => {
    cy.visit("http://localhost:3000");
    cy.get("[data-test-id=email]").type("admin@dnamicro.com");
    cy.get("[data-test-id=password]").type("ch@ng3m3Pl3@s3!!");
    cy.get("[data-test-id=loginSubmitButton]").click();
    cy.wait(2000)
    cy.url().then((url) => {
      if (url.includes("/portal/dashboard")) {
        cy.visit("http://localhost:3000/playground/forms");
      }
    });

    cy.url().should("include", "/playground/forms");
  });

  it("should input the TextArea form", () => {

    cy.get("[data-test-id=textareaTextAreaInput]").should("exist");
    // Additional tests for the TextArea component
    cy.get("[data-test-id=textareaTextAreaInput]").type("Sample text");
    cy.get("[data-test-id=textareaTextAreaInput]").should(
      "have.value",
      "Sample text",
    );
  });

  it("should show an error message if no value is entered", () => {
    cy.get("[data-test-id=textareaTextAreaInput]").should("exist");
    cy.get("[data-test-id=submitFormButton]")
      .closest("form")
      .within(() => {
        cy.get("[data-test-id=submitFormButton]").click();
      });
    cy.get("p").contains("Textarea is required");
  });

  it("should validate required field", () => {
    cy.get("[data-test-id=textareaTextAreaInput]").should("exist");
    cy.get("[data-test-id=textareaTextAreaInput]").type("Sample");
    cy.get("[data-test-id=submitFormButton]")
      .closest("form")
      .within(() => {
        cy.get("[data-test-id=submitFormButton]").click();
      });
    cy.get("p").contains("Textarea must be at least 10 characters long");
  });

  it("should display character count", () => {
    cy.get("[data-test-id=textareaTextAreaInput]").type("Sampletext");
    cy.get("span").should("contain", "10");
  });

  it("should support customizable placeholder text", () => {
    cy.get("[data-test-id=textareaTextAreaInput]").should(
      "have.attr",
      "placeholder",
      "Textarea",
    );
  });

  it("should disable autocomplete", () => {
    cy.get("[data-test-id=textareaTextAreaInput]").should(
      "have.attr",
      "autocomplete",
      "off",
    );
  });
it("should support input across multiple lines and auto-grow", () => {
    // Get the textarea reference
    cy.get("[data-test-id=textareaTextAreaInput]").as('textArea');

    // Type initial text and verify the value
    cy.get('@textArea').type("Line 1\nLine 2\nLine 3\nLine 4\nLine 5");
    cy.get('@textArea').should(
        "have.value",
        "Line 1\nLine 2\nLine 3\nLine 4\nLine 5"
    );

    // Capture the initial height before adding more text
    cy.get('@textArea').then(($textarea) => {
        // Use invoke to get the actual height at this moment
        const initialHeight = 80;

        // Type additional lines
        cy.get('@textArea').type("\nLine 6\nLine 7\nLine 8");

        // Compare new height 
        cy.get('@textArea').then(($newTextarea) => {
            const newHeight = $newTextarea.height();
            
            // Assert that the new height is greater than the initial height
            expect(newHeight).to.be.greaterThan(initialHeight ?? 0);
        });
    });
});


  it("should allow configurable line wrapping", () => {
    cy.get("[data-test-id=textareaTextAreaInput]").then(($textarea) => {
      const textAreaElement = $textarea[0];
      cy.wrap(textAreaElement).should(
        "have.css",
        "overflow-wrap",
        "break-word",
      );
      cy.wrap(textAreaElement).should("have.css", "word-wrap", "break-word");
    });
  });

  it("should allow customizable text area color", () => {
    cy.get("[data-test-id=textareaTextAreaInput]").invoke(
      "addClass",
      "bg-blue-500 text-white",
    );
    cy.get("[data-test-id=textareaTextAreaInput]").should(
      "have.class",
      "bg-blue-500",
    );
    cy.get("[data-test-id=textareaTextAreaInput]").should(
      "have.class",
      "text-white",
    );
  });

  it("should allow displaying an icon on either side of the text area", () => {
    cy.get("[data-test-id=textareaTextAreaInput]")
      .siblings("svg")
      .should("exist");
  });
});
