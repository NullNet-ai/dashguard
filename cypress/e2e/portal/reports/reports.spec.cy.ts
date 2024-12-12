describe('Reports Page with Custom User', () => {
    beforeEach(() => {
        // Load login data from the fixture file
        cy.fixture('user').then((data) => {
            // Call the login command with the loaded data
            cy.login(data.username, data.password);
        });
    });

    // it('should load the reports page', () => {
    //     cy.visitReportsPage(); // Reusable command
    // });

    // it('should open wizard after clicking create button', () => {
    //     cy.visitReportsPage(); // Reusable command
    //     cy.openReportWizard();  // Reusable command
    // });

    
    const visitAndOpenWizard = () => {
        cy.visitReportsPage(); // Reusable command
        cy.openReportWizard(); // Reusable command
    };

    const fillReportForm = (entityName: string, reportName: string) => {
        cy.get("[data-test-id=entity_name]").type(entityName);
        cy.get("[data-test-id=report_name]").type(reportName);
        cy.get("[data-test-id=submitFormButton]").click();
    };

    const fillColumns = (columns: string[]) => {
        columns.forEach(column => {
            cy.get("[data-test-id=columnsInput]").type(`${column}{enter}`);
        });
        cy.get("[data-test-id=wizardNextButton]").click();
    };

    const fillFilters = (field: string, operator: string, value: string) => {
        cy.get("[data-test-id=filters\\.0\\.field]").type(field);
        cy.get("[data-test-id=filters\\.0\\.operator]").click();
        cy.get(`[data-test-id=filters\\.0\\.operator${operator}]`).click();
        cy.get("[data-test-id=filters\\.0\\.values]").type(value);
        cy.get("[data-test-id=wizardNextButton]").click();
    };

    const fillOrderFields = (key: string, direction: string) => {
        cy.get("[data-test-id=order_key]").type(key);
        cy.get("[data-test-id=order_direction]").click();
        cy.get(`[data-test-id=order_direction${direction}]`).click();
        cy.get("[data-test-id=wizardNextButton]").click();
    }

    it('validate wizard creation of data', () => {
        visitAndOpenWizard();

        // Step 1: Fill in the form
        fillReportForm('Test Entity', 'Test Report');
        cy.get("[data-test-id=wizardNextButton]").should('not.be.disabled').click();
        cy.url().should("include", "/2");

        // Step 2: Fill in columns
        fillColumns(["test 1", "test 2"]);
        cy.url().should("include", "/3");

        // Step 3: Fill in filters
        fillFilters("status", "Equal", "Active");
        cy.url().should("include", "/4");

        // Step 4: Fill in order fields
        fillOrderFields("created_at", "ASCENDING");
        cy.url().should("include", "/5");

        // Step 5: Check for "Coming Soon" and click next
        cy.contains('Coming Soon').should('be.visible');
        cy.get("[data-test-id=wizardNextButton]").click();
        cy.url().should("include", "/6");

        // Step 6: Check for "Confirmation"
        cy.contains('Confirmation').should('be.visible');
        cy.get("[data-test-id=wizardSaveContinueButton]").click();
        cy.url().should("include", "/portal/reports/record");
    });
    
});
