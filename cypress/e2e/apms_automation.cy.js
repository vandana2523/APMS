describe("APMS - Project Audit and Insights", () => {
  beforeEach("Login", () => {
    const project_name = Cypress.env("project");
    const sprint_name = Cypress.env("sprint");
 
    cy.visit("https://apms.dotsquares.com/");
    cy.get("#Email").type("hgjkhkhkhk@gmail.com");
    cy.get("#Password").type("hbkjhkhk");
    cy.get("input[type='submit']").click();
    cy.wait(2000);
 
    cy.get("body").then(($body) => {
      cy.log('Sprint name:', project_name);
      if (($body.text() || '').toLowerCase().includes(project_name.toLowerCase())) {
        cy.contains("a", project_name, { matchCase: false }).first().click();
        cy.wait(5000);
 
        // Scroll the page after clicking on the project
        cy.window().then((win) => {
          win.scrollBy(0, 500); // Adjust the value as needed to scroll down
        });
        cy.wait(5000);
        cy.get("body").then(($body) => {
          // Trim the sprint name to remove extra spaces
          const trimmedSprintName = (sprint_name || "").trim();
 
          if ($body.text().toLowerCase().includes(trimmedSprintName.toLowerCase())) {
            cy.contains("a", trimmedSprintName, { matchCase: false })
              .scrollIntoView()
              .should("be.visible")
              .click();
 
            cy.contains("button", "Kanban").click();
          } else {
            throw new Error("Sprint name does not exist or is incorrect.");
          }
        });
      } else {
        throw new Error("Project not found or incorrect.");
      }
    });
  });
 
  it("Should keep the Kanban board updated", () => {
    cy.wait(1500);
    cy.screenshot("Kanban", { padding: 100 });
 
    cy.get('.col-droppable').each(($col, index) => {
      if ($col < 5) {
        cy.wrap($col).should("not.contain", ".col-droppable");
      }
      if (index === 5) {
        cy.wrap($col).should("contain", ".col-droppable");
      }
    });
 
    cy.log("The Kanban board is up to date and does not contain any pending tasks.");
  });
 
  it("Should complete user stories within the sprint timeline", () => {
    let date_expected;
    let last_work_day;
 
    cy.get("div[class='show_top_details'] li:nth-child(2)")
      .invoke("text")
      .then((text) => {
        const dateRegex = /\d{1,2} \w+ \d{4}/g;
        const dates = text.trim().match(dateRegex);
        date_expected = dates ? dates[1] : null;
      });
 
    cy.contains("button", "Timesheet").click();
    cy.get("tbody tr td:nth-child(4)")
      .last()
      .invoke("text")
      .then((text) => {
        last_work_day = text.trim();
      });
 
    cy.then(() => {
      if (!date_expected || !last_work_day) {
        throw new Error("Unable to extract date information.");
      }
 
      const parseDate = (dateStr) => {
        const [day, month, year] = dateStr.split(" ");
        return new Date(`${month} ${day}, ${year}`);
      };
 
      const expected_date = parseDate(date_expected);
      const actual_date = parseDate(last_work_day);
 
      const dayDifference = (expected_date - actual_date) / (1000 * 60 * 60 * 24);
      cy.log(`Difference: ${dayDifference} days`);
 
      if (dayDifference < 0) {
        throw new Error(`Sprint exceeded by ${Math.abs(dayDifference)} days.`);
      }
    });
  });
 
  it("Should ensure Wiki contains project credentials and information", () => {
    let foundContent = false; // flag to track if any nav-item has content
  
    cy.contains("button", "Wiki").click();
    cy.wait(2000);
    cy.get("div[class='col-sm-12 mb-5'] button[aria-label='Bold']").click({ force: true });
    cy.frameLoaded("#Description_ifr");
  
    cy.iframe("#Description_ifr").then(($iframe) => {
      const initialText = $iframe.text().trim();
  
      if (initialText) {
        cy.log("Wiki contains content");
        cy.screenshot("Wiki_content", { padding: 100 });
      } else {
        cy.log("Initial Wiki is empty. Checking other nav items...");
  
        cy.contains("a", "More").click();
        cy.contains("li", "Wiki").click();
  
        cy.get('.nav-item').each(($navItem, index, $list) => {
          cy.wrap($navItem).click();
  
          cy.wait(500); // slight wait to allow content to load
          cy.get('#description_div').invoke('text').then((text) => {
            const trimmedText = text.trim();
            if (trimmedText !== '' && !foundContent) {
              foundContent = true;
              cy.log(`Found content in Wiki at nav-item index ${index}`);
              cy.screenshot(`Wiki_found_index_${index}`, { padding: 100 });
            }
  
            // When it's the last item, evaluate test result
            if (index === $list.length - 1) {
              if (!foundContent) {
                throw new Error('All Wiki tabs are empty.');
              } else {
                cy.log("At least one Wiki tab has content. Test passes.");
              }
            }
          });
        });
      }
    });
  });
  
  it("Should ensure sprint planning documents are present", () => {
    cy.contains("a", "More").click();
    cy.contains("li", "Files").click();
    cy.contains("button", "Other Document").click();
    cy.get('table.table.tblbugs.issuelist', { timeout: 10000 })
      .should('be.visible');
    cy.get("body").then(($body) => {
      if ($body.text().toLowerCase().includes("no records found")) {
        throw new Error("Sprint planning document is missing.");
      } else {
        cy.screenshot("Sprint_Planning", { padding: 100 });
      }
    });
  });
 
  it("Should validate presence of project test plan in APMS", () => {
    cy.contains("a", "More").click();
    cy.contains("li", "Files").click();
    cy.contains("button", "Test Plan").click();
    //cy.wait(25000)
    cy.get('table.table.tblbugs.issuelist', { timeout: 10000 })
      .should('be.visible');
    cy.get("body").then(($body) => {
      if ($body.text().toLowerCase().includes("no records found")) {
        throw new Error("Test plan document is missing.");
      } else {
        cy.screenshot("Test_Plan", { padding: 100 });
      }
    });
  });
});
