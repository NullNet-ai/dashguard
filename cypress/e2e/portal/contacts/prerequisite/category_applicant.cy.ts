import { faker } from "@faker-js/faker";
export const setUpApplicantContactCreationStepThree = () => {
  cy.wait(3000);
  cy.url().should("include", "3?categories=Applicant");
  cy.get("[data-test-id=buttonTriggerDate_of_birth]").click();
  // cy.get('td[data-day="2024-12-03"]').click();
  cy.get("td").contains("button", /^6$/).click();
  cy.get('select[name="address.country"]').select("United States", {
    force: true,
  });
  cy.get("[data-test-id=nationalitiesInput]").type("Afghan{enter}");
  cy.get("[data-test-id=nationalitiesInput]").type("Filipino{enter}");
  cy.get('select[name="address.city"]').select("New York", { force: true });
  cy.get("[data-test-id=PersonalDetailsFormDebugButton]").click();
  cy.wait(2000);
  cy.get("[data-test-id=wizardNextButton]").click();
};

export const setUpApplicantContactCreationStepFour = () => {
  cy.wait(1000);
  cy.url().should("include", "4?categories=Applicant");
  cy.get("[data-test-id=current_title]").type(faker.person.jobTitle());
  cy.get("[data-test-id=years_of_experience]").type("3");
  cy.get("[data-test-id=current_company]").type(faker.company.name());
  cy.get("[data-test-id=current_salary]").type(
    faker.commerce.price({ min: 1000 }),
  );
  cy.get("[data-test-id=salary_currency]").type(faker.finance.currencyCode());
  cy.get("[data-test-id=notice_period]").click();
  cy.wait(2000);
  cy.get("[role='option']").contains("30 Days").click({ force: true });
  cy.wait(2000);
  cy.get("[data-test-id=submitFormButtonContactsProfessionalDetails]").click();
  cy.wait(2000);
  cy.get("[data-test-id=wizardNextButton]").click();
};

export const setUpApplicantContactCreationStepFive = () => {
  cy.wait(5000);

  const education_index = "educations\\.0\\";
  cy.get(`[data-test-id=${education_index}.institution]`).type(
    faker.company.name(),
  );
  cy.get(`[data-test-id="${education_index}.country_id"]`).click({
    force: true,
  });
  cy.wait(1000);
  cy.get('[role="option"]').first().click({ force: true });
  cy.get(`[data-test-id=${education_index}.degree]`).type(
    "Bachelor of Science in Computer Science",
  );
  cy.get(`[data-test-id="${education_index}.degree_level_id"]`).click({
    force: true,
  });
  cy.wait(1000);
  cy.get('[role="option"]').first().click({ force: true });
  cy.get(`[data-test-id=buttonTriggerEducations\\.0\\.completed_on]`).type(
    "2024",
  );
  cy.wait(1000);
  cy.get(`[data-test-id=${education_index}.noteTextAreaInput]`).type(
    faker.lorem.paragraph(2),
  );
  cy.get("[data-test-id=wizardNextButton]").click();
};

export const setUpApplicantContactCreationStepSix = () => {
  cy.wait(3000);
  const skill_index = "skills\\.0\\";
  cy.get(`[data-test-id=${skill_index}.skill]`).type(faker.company.name());
  cy.get(`[data-test-id="${skill_index}.years_of_experience"]`).click({
    force: true,
  });
  cy.wait(1000);
  cy.get('[role="option"]').eq(5).click({ force: true });
  cy.wait(1000);
  cy.get("[data-test-id=submitFormButtoncontact-skill-details]").click();
  cy.wait(2000);

  cy.location("href").then((url) => {
    const modifiedUrl = url.replace("/6?", "/7?");
    cy.visit(modifiedUrl);
  });

  cy.get("[data-test-id=wizardSkipButton]").click();
  cy.wait(1000);
};

export const setUpApplicantContactCreationStepSeven = () => {
  cy.get("[data-test-id=wizardSkipButton]").click();
  cy.wait(3000);
  // const certification_index = "certifications\\.0\\";
  // cy.get(`[data-test-id=${certification_index}.certificate_name]`).type(
  //   faker.company.name(),
  // );
  // cy.get(`[data-test-id="${certification_index}.institution"]`).type(
  //   faker.company.name(),
  // );

  // // cy.get("[data-test-id=buttonTriggerCertifications.0.issued_on_date]").click();
  // // cy.wait(1000);
  // // cy.get("td").contains("button", /^1$/).click();
  // cy.wait(2000);

  // cy.get(
  //   "[data-test-id=buttonTriggerCertifications\\.0\\.expiration_date]",
  // ).click();
  // cy.get("td").contains("button", /^9$/).click();
  // cy.wait(2000);
  // cy.get(
  //   "[data-test-id=submitFormButtoncontact-certification-details]",
  // ).click();
  // cy.wait(2000);
  // cy.get("[data-test-id=wizardNextButton]").click();
  // cy.wait(3000);
};

export const setUpApplicantContactCreationStepEight = () => {
  cy.get("[data-test-id=file-upload-file_ids]").should("be.visible");
  //upload file in the file upload field
  cy.get("[data-test-id=file-upload-file_ids]")
    .document()
    .type("/files/sample.pdf");

  // Upload a PDF file
  // cy.get("[data-test-id=uploadDocument]").attachFile({
  //   filePath: "files/sample.pdf",
  //   encoding: "base64",
  // });
  // cy.wait(2000);

  // // Upload a DOC file
  // cy.get("[data-test-id=uploadDocument]").attachFile({
  //   filePath: "files/sample.doc",
  //   encoding: "base64",
  // });
  // cy.wait(2000);

  // // Upload a JPG file
  // cy.get("[data-test-id=uploadDocument]").attachFile({
  //   filePath: "files/sample.jpg",
  //   encoding: "base64",
  // });
  // cy.wait(2000);

  // // Upload a GIF file
  // cy.get("[data-test-id=uploadDocument]").attachFile({
  //   filePath: "files/sample.gif",
  //   encoding: "base64",
  // });
  // cy.wait(2000);

  // // Upload a file with a size greater than 10 MB
  // cy.get("[data-test-id=uploadDocument]").attachFile({
  //   filePath: "files/sample_large.pdf",
  //   encoding: "base64",
  // });
  // cy.wait(2000);

  // // Upload multiple files
  // cy.get("[data-test-id=uploadDocument]").attachFile({
  //   filePath: "files/sample.pdf",
  //   encoding: "base64",
  //   multiple: true,
  // });
  cy.get("[data-test-id=wizardSkipButton]").click();
  cy.wait(2000);
};

export const setUpApplicantContactCreationStepNine = () => {
  cy.wait(3000);

  const index_0 = "links\\.0\\";
  cy.get(`[data-test-id=${index_0}.title]`).type(faker.company.name());
  cy.get(`[data-test-id=${index_0}.link]`).type(faker.internet.url());

  cy.get("[data-test-id=contact-link-detailsAppendFormButton]").click();
  cy.wait(1000);

  const index_1 = "links\\.1\\";
  cy.get(`[data-test-id=${index_1}.title]`).type(faker.company.name());
  cy.get(`[data-test-id=${index_1}.link]`).type(faker.internet.url());

 
  
  cy.wait(2000);
  cy.get("[data-test-id=wizardNextButton]").click();
};
