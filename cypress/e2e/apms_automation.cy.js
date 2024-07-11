describe("APMS - Project Audit and Insights", () => {
  beforeEach("Login", () => {
    const project_name = Cypress.env("project");
    const sprint_name = Cypress.env("sprint");

    // Visit the URL
    cy.visit("https://apms.dotsquares.com/");
    // Enter email
    cy.get("#Email").type("vikrams.gurjar@dotsquares.com");
    // Enter password
    cy.get("#Password").type("123456");


    // Click submit button
    cy.get("input[type='submit']").click();
    cy.wait(2000);
    // Wait for the body to load and check if it contains the project name
    cy.get("body").then(($el) => {
      if ($el.text().toLowerCase().includes(project_name.toLowerCase())) {
        cy.get("a")
          .contains(project_name, { matchCase: false })
          .first()
          .click();
        cy.wait(2000);
        cy.get("body").then(($el1) => {
          if ($el1.text().toLowerCase().includes(sprint_name.toLowerCase())) {
            cy.get("a").contains(sprint_name, { matchCase: false }).click();
            cy.contains("button", "Kanban").click();
          } else {
            throw new Error("Sprint name does not exist or is incorrect.");
          }
        });
      } else {
        throw new Error(
          "You are not added to the project or the project name is incorrect."
        );
      }
    });
  });
  it("Should keep the Kanban board updated", () => {
    //Note - The parameter on which we are passing or fail the test is -
    // If Any pending task will remain in all column excluding Done then Test case will fail

    cy.wait(1500)
    // Take a screenshot of the Kanban board
    cy.screenshot("Kanban", { padding: 100 });
    // Ensure each column of the Kanban board does not contain any pending tasks

    cy.get('[class="col-droppable"]')
      .eq(0)
      .should("not.contain", '[class="col-droppable"]');
    cy.get('[class="col-droppable"]')
      .eq(1)
      .should("not.contain", '[class="col-droppable"]');
    cy.get('[class="col-droppable"]')
      .eq(2)
      .should("not.contain", '[class="col-droppable"]');
    cy.get('[class="col-droppable"]')
      .eq(3)
      .should("not.contain", '[class="col-droppable"]');
    cy.log("The Kanban is up to date and does not contain any pending task");

  });
  it("Should complete user stories within the sprint timeline", () => {
    //Note - The parameter on which we are passing or fail the test is -
    // If The members of project will log time after the end date of sprint then Test case will fail.
    let date_expected;
    let last_work_day;
    // Extract expected sprint end date
    cy.get("div[class='show_top_details'] li:nth-child(2)")
      .invoke("text")
      .then((text) => {
        const timebox = text.trim();
        const dateRegex = /\d{1,2} \w+ \d{4}/g;
        const dates = timebox.match(dateRegex);
        date_expected = dates[1];
        cy.log(date_expected);
      });
      // Navigate to Timesheet and get the last working day
    cy.get("button").contains("Timesheet").click();
    cy.get("tbody tr td:nth-child(4)")
      .last()
      .invoke("text")
      .then((last_date) => {
        last_work_day = last_date.trim();
      });
    // Compare expected end date and actual last working day
    cy.then(() => {
      // Parse expected date
      const [day, month, year] = date_expected.split(" ");
      const monthIndex = new Date(Date.parse(`${month} 1, 2024`)).getMonth(); // Get month index (0-11)
      const fullYear = year.length === 2 ? `20${year}` : year; // Handle two-digit and four-digit years
      const expected_date = new Date(fullYear, monthIndex, day);
     // Parse actual last working day
      const [day1, month1, year1] = last_work_day.split(" ");
      const monthIndex1 = new Date(Date.parse(`${month1} 1, 2024`)).getMonth(); // Get month index (0-11)
      const fullYear1 = year1.length === 2 ? `20${year1}` : year1; // Handle two-digit and four-digit years
      const actual_date = new Date(fullYear1, monthIndex1, day1);
      cy.log(expected_date.toISOString());
      cy.log(actual_date.toISOString());
      // Calculate the difference in days
      const timeDifference = expected_date - actual_date;
      const dayDifference = timeDifference / (1000 * 60 * 60 * 24);
      cy.log(dayDifference);
      const positive_value = Math.abs(dayDifference);
      // Check if work extended beyond the sprint end date
      if (dayDifference < 0) {

        const errorMessage = `We worked ${positive_value} days more from Sprint end date .`;
        cy.log(errorMessage);
        throw new Error(errorMessage); // Throw an error to fail the test case
      }
      const msg = `The date of sprint was ${date_expected} and We worked till ${last_work_day}.So sprint is successful`;
      cy.log(msg);
    });
  });
  it("Should include test scenarios in the UAT tab of APMS", () => {
        //Note - The parameter on which we are passing or fail the test is -
    // If UAT scenarios tab will not have scenarios more than 0 then Test case will fail

    cy.get('[id="UATscenarios-tab"]').then(($el) => {
          // Check if UAT scenarios are added
      if ($el.text() != "UAT Scenarios (0)") {
        cy.get('[id="UATscenarios-tab"]').click();
        cy.wait(1500)
        cy.screenshot("Test_scenarios", { padding: 100 });
      } else {
        const msg = "The test scenarios are not added";
        cy.log(msg);
        throw new Error(msg);
      }
    });
  });
  it("Should add Scrum call MOM to APMS", () => {
    //Note - The parameter on which we are passing or fail the test is -
    // If message will not be present into the message list regarding the Scrum MOM then the test case will fail
    // Navigate to Messages and check for Scrum call MOM
    cy.get("a").contains("Message").click();
    cy.get('[class*="message-item"]').then(($el) => {
      if ($el.text().toLowerCase().includes("scrum call")) {
        // Statements to execute if the element contains 'scrum call'
        cy.log("The Project is containing Scrum call MOM");
        cy.get("a")
          .contains(/Scrum call/i)
          .first()
          .should("be.visible")
          .click();

        cy.wait(1500)
          cy.screenshot("Scrum_MoM", { padding: 100 });
      } else {
        // Statements to execute if the element does not contain 'scrum call'
        const msg = "The Project is not containing any Scrum call MOM";
        cy.log(msg);
        throw new Error(msg);
      }
    });
  });
  it("Should have evidence of sprint review to APMS", () => {
    //Note - The parameter on which we are passing or fail the test is -
    // If message will not be present into the message list regarding the Scrum MOM then the test case will fail
    // Navigate to Messages and check for Scrum call MOM
    cy.get("a").contains("Message").click();
    cy.get('[class*="message-item"]').then(($el) => {
      if ($el.text().toLowerCase().includes("sprint review")) {
        // Statements to execute if the element contains 'scrum call'
        cy.log("The Project is containing sprint Review");
        cy.get("a")
          .contains(/Sprint review/i)
          .first()
          .should("be.visible")
          .click();

        cy.wait(1500)
          cy.screenshot("sprint review", { padding: 100 });
      } else {
        // Statements to execute if the element does not contain 'scrum call'
        const msg = "The Project is not containing any Sprint review";
        cy.log(msg);
        throw new Error(msg);
      }
    });
  });
  it("Should add Sprint Planning evidence to APMS", () => {
    //Note - The parameter on which we are passing or fail the test is -
    // If document will not be present into other documents regarding the sprint planning then the test case will fail
    // Check if Sprint planning is present
    cy.get("a").contains("More").click();
    cy.get("li").contains("Files").click();
    cy.get("button").contains("Other Document").click();
    cy.get('body',{timeout:10000}).then(($el) => {
      const text = $el.text().toLowerCase();
      if (text.includes("no records found")) {
        const error = "The sprint planning is not added";
        cy.log(error);
        throw new Error(error);
      }
      else if (text.includes("tbody tr")){
        cy.get("tbody tr").then(($el)=>{
          if($el.text().toLowerCase().includes("sprint planning")){
            cy.log("The sprint planning is present")
          }
          else{
            const error = "The sprint planning is not added";
            cy.log(error);
            throw new Error(error);
          }
        })

      }
       else {
        cy.log("The sprint planning is present");
        cy.wait(1500)
        cy.screenshot("Test_Plan", { padding: 100 });
      }
    });

  });
  it("Should ensure Wiki contains project credentials and information", () => {
    // Click the Wiki button
    cy.get("button").contains("Wiki").click();
    cy.log("Clicked the Wiki button");
    cy.wait(2000); // Adjust the wait time as needed
    cy.log("Waited for iframe content to load");
    cy.get("div[class='col-sm-12 mb-5'] button[aria-label='Bold']").click({force:true})
    // Interact with the iframe
    // Wait for the iframe to load
    cy.frameLoaded("#Description_ifr");
    // Add a wait to ensure the iframe content is fully loaded
    cy.iframe("#Description_ifr").within(($body) => {
      // Increase timeout for finding the body element
      cy.wrap($body).then(($body) => {
        if ($body.text().trim() === "") {
          const error = "Nothing is in WiKi";
          cy.log(error);
          throw new Error(error);
        } else {
          cy.log("The Wiki contains content");
          cy.wait(1500);
          cy.screenshot("Wiki_content", { padding: 100 });
        }
      });
    });
  });

  it("Should add Sprint Retrospective MOM to APMS", () => {
    // Click the Retro button
    cy.get("button").contains("Retro").click();
    cy.wait(1000)
    // Wait for the body to load and check if it contains the required elements
    cy.get("div").then(($el) => {
      cy.log("Body loaded");
      // Check if the .white_box class exists
      const whiteBoxes = $el.find(".white_box");
      cy.log(`Number of .white_box elements found: ${whiteBoxes.length}`);

      if (whiteBoxes.length > 0) {
        cy.get(".white_box")
          .its("length")
          .then((length) => {
            cy.log(`Number of .white_box elements: ${length}`);
            if (length >= 3) {
              cy.log("The Sprint retro is having evidence");
              cy.screenshot("sprint_retro", { padding: 100 });
            } else {
              const msg = "The Sprint retro evidence is not present";
              cy.log(msg);
              throw new Error(msg);
            }
          });
      } else {
        const msg = "The Sprint retro evidence is not present";
        cy.log(msg);
        throw new Error(msg);
      }
    });
  })


    it("Should add UAT evidence by PM/BA to APMS", () => {
      //Note - The parameter on which we are passing or fail the test is -
      //If We wont have job regarding the UAT then the task will fail
      //If we will have Job for the UAT but comment is not added then it will fail
      // Navigate to Jobs and check for UAT evidence
      cy.get("button").contains("Jobs").click();
      cy.wait(2000);

      cy.get('div.story_list').then(($el) => {
        if ($el.text().toLowerCase().includes("uat")) {
          cy.get("div.story_list").contains(/UAT/i).should('be.visible').then(($uatEl) => {
            cy.log("The UAT job is present and visible");

            // Scope to the correct parent and perform actions
            cy.wrap($uatEl).parents("div.story_list").within(() => {
              cy.contains("Completed").should("be.visible");
              cy.get(".message_td").click();
            });

            cy.get("body").then(($el)=>{
              const text = $el.text().toLowerCase();
              if (text.includes("no comments")) {
                const errorMessage = "The UAT comment is not present";
                cy.log(errorMessage);
                throw new Error(errorMessage);
              }
              else{
                cy.get('[class="communication_blocks flex-wrap"]',{timeout:10000}).then(($comments) => {
                  if ($comments.length > 0) {
                    cy.log("The comment is added for UAT");
                    cy.wait(1500)
                    cy.screenshot("UAT_comment", { padding: 100 });
                  } else {
                    const errorMessage = "The comment is not added for UAT";
                    cy.log(errorMessage);
                    throw new Error(errorMessage);
                  }
                });
              }
            })

          });
        } else {
          const errorMessage = "The UAT evidence is not present";
          cy.log(errorMessage);
          throw new Error(errorMessage);
        }
      });
    });

    it("Code review actions in the project documentation and provide evidence in the APMS for future reference", () => {
      // Navigate to Jobs and check for Code review actions
      //Note - The parameter on which we are passing or fail the test is -
      //If We wont have job regarding the Code review then the task will fail
      //If we will have Job for the Code review but comment is not added then it will fail
      cy.get("button").contains("Jobs").click();
      cy.wait(1500)
      cy.screenshot("jobs", { padding: 100 });
      cy.get('div.story_list',{timeout:10000}).then(($el) => {
        const text = $el.text().toLowerCase();
        if (text.includes("code review")) {
          cy.get("div.story_list",{timeout:10000}).contains(/Code review/i).should('be.visible').then(($codeReviewEl) => {
            // Ensure you wait for the element to be fully loaded
            cy.wait(2000);

            // Element is visible, you can perform further actions here if needed
            cy.log("The code review job is present and visible");

            // Scope to the correct parent and perform actions
            cy.wrap($codeReviewEl).parents("div.story_list",{timeout:10000}).within(() => {
              cy.contains("Completed").should("be.visible");
              cy.get(".message_td").click();
            });
            cy.get("body").then(($el)=>{
              const text = $el.text().toLowerCase();
              if (text.includes("no comments")) {
                const errorMessage = "The Code review comment is not present";
                cy.log(errorMessage);
                throw new Error(errorMessage);
              }
              else{
                cy.get('[class="communication_blocks flex-wrap"]',{timeout:10000}).then(($comments) => {
                  if ($comments.length > 0) {
                    cy.log("The comment is added for Code review");
                    cy.wait(1500)
                    cy.screenshot("code_review_comment", { padding: 100 });
                  } else {
                    const errorMessage = "The comment is not added for Code review";
                    cy.log(errorMessage);
                    throw new Error(errorMessage);
                  }
                });
              }
            })

          });
        } else {
          const errorMessage = "The Code review evidence is not present";
          cy.log(errorMessage);
          throw new Error(errorMessage);
        }
      });
    });
    it("Project test plan should be on APMS", () => {
      //Note - The parameter on which we are passing or fail the test is -
      //If we won't have any document regarding the Test plan then test case will fail
       // Check if Test Plan is present in Files
      cy.get("a").contains("More").click();
      cy.get("li").contains("Files").click();
      cy.get("button").contains("Test Plan").click();
      cy.screenshot("jobs", { padding: 100 });
      cy.get('body',{timeout:10000}).then(($el) => {
        const text = $el.text().toLowerCase();
        if (text.includes("no records found")) {
          const error = "The test plan is not added";
          cy.log(error);
          throw new Error(error);
        }
        else if (text.includes("tbody tr")){
          cy.get("tbody tr").then(($el)=>{
            if($el.text().toLowerCase().includes("test plan")){
              cy.log("The test plan is present")
            }
            else{
              const error = "The test plan is not added";
              cy.log(error);
              throw new Error(error);
            }
          })

        }
         else {
          cy.log("The test plan is present");
          cy.wait(1500)
          cy.screenshot("Test_Plan", { padding: 100 });
        }
      });
    });
    it("Project proposal document should be on APMS", () => {
      //Note - The parameter on which we are passing or fail the test is -
      //If we won't have any document regarding the project proposal then test case will fail
      cy.get("a").contains("More").click();
      cy.get("li").contains("Files").click();
      cy.get("button").contains("Project Proposal").click();
      cy.screenshot("jobs", { padding: 100 });
      cy.get('body',{timeout:10000}).then(($el) => {
        const text = $el.text().toLowerCase();
        if (text.includes("no records found")) {
          const error = "The Proposal document is not added";
          cy.log(error);
          throw new Error(error);
        }
        else if (text.includes("tbody tr")){
          cy.get("tbody tr").then(($el)=>{
            if($el.text().toLowerCase().includes("proposal document") || $el.text().toLowerCase().includes("requirement document")){
              cy.log("The proposal document is present")
            }
            else{
              const error = "The proposal document is not added";
              cy.log(error);
              throw new Error(error);
            }
          })

        }
         else {
          cy.log("The test plan is present");
          cy.wait(1500)
          cy.screenshot("Test_Plan", { padding: 100 });
        }
      });
    });


    it("Should log hours in 'Pre Sales Project Man Hours' field", () => {
      //Note - The parameter on which we are passing or fail the test is -
      //If we will have pre sales project man hours zero then the tes case will fail
       // Check if hours are logged in 'Pre Sales Project Man Hours' field
      cy.get("a").contains("More").click();
      cy.get("li").contains("Settings").click();
      cy.get('[id="PreSalesProjectManHours"]')
        .invoke("val")
        .then(($el) => {
          const value = $el;
          if (value > 0) {
            const str = `The pre sales Project man hours are added which are ${value}}`;
            cy.log(str);
            cy.wait(1500)
            cy.screenshot("Pre_sales_hours")
          } else {
            const msg = "The pre sales project man hours are zero";
            cy.log(msg);
            throw new Error(msg);
          }
        });
    });
    it("Should add QA closure report to APMS", () => {
      //Note - The parameter on which we are passing or fail the test is -
      //If we will not have any QA closure report message in message list then the test case will fail
      // Check if QA closure report is present
      cy.get("a").contains("Message").click();
      cy.get('[class*="message-item"]').then(($el) => {
        if ($el.text().toLowerCase().includes("closure")) {
          // Statements to execute if the element contains 'progress'
          cy.log("The Project is containing Closure report");
          cy.get('[class*="message-item"]')
            .contains(/closure/i)
            .eq(0)
            .click();

          cy.wait(1500)
            cy.screenshot("Closure_report", { padding: 100 });
        } else {
          // Statements to execute if the element does not contain 'progress'
          const msg = "The Project is not containing any Closure report";
          cy.log(msg);
          throw new Error(msg);
        }
      });
    });
});
