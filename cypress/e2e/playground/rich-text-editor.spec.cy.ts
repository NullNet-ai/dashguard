describe("Rich Text Editor Functionality", () => {
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

    it("should allow user to type and format text in bold", () => {
        const editor = cy.get("[data-test-id=richtextRichTextEditor]");
        editor.clear();
        editor.type("This is a test");
        editor.type("{selectall}");
        editor.type("{ctrl+b}");
        editor.then(($editor) => {
            const html = $editor.html();
            expect(html).to.contain("<strong>This is a test</strong>");
        });
    });

    it("should allow user to type and format text in italic", () => {
        const editor = cy.get("[data-test-id=richtextRichTextEditor]");
        editor.clear();
        editor.type("This is a test");
        editor.type("{selectall}");
        editor.type("{ctrl+i}");
        editor.then(($editor) => {
            const html = $editor.html();
            expect(html).to.contain("<em>This is a test</em>");
        });
    });

    it("should allow user to type and format text with underline", () => {
        const editor = cy.get("[data-test-id=richtextRichTextEditor]");
        editor.clear();
        editor.type("This is a test");
        editor.type("{selectall}");
        editor.type("{ctrl+u}");
        editor.then(($editor) => {
            const html = $editor.html();
            expect(html).to.contain("<u>This is a test</u>");
        });
    });

    it("should allow user to type and format text with strikethrough", () => {
        const editor = cy.get("[data-test-id=richtextRichTextEditor]");
        editor.clear();
        editor.type("This is a test");
        editor.type("{selectall}");
        editor.type("{ctrl+shift+s}");
        editor.then(($editor) => {
            const html = $editor.html();
            expect(html).to.contain("<s>This is a test</s>");
        });
    });

    it("should allow user to create a numbered list", () => {
        const editor = cy.get("[data-test-id=richtextRichTextEditor]");
        editor.clear();
        editor.type("This is a test");
        editor.type("{selectall}");
        editor.type("{ctrl+shift+7}");
        editor.then(($editor) => {
            const html = $editor.html();
            expect(html).to.contain(`<ol class="list-node"><li><p class="text-node">This is a test</p></li></ol>`);
        });
    });

    it("should allow user to create a bullet list", () => {
        const editor = cy.get("[data-test-id=richtextRichTextEditor]");
        editor.clear();
        editor.type("This is a test");
        editor.type("{selectall}");
        editor.type("{ctrl+shift+8}");
        editor.then(($editor) => {
            const html = $editor.html();
            expect(html).to.contain(`<ul class="list-node"><li><p class="text-node">This is a test</p></li></ul>`);
        });
    });
});
