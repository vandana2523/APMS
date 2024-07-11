const { defineConfig } = require('cypress');
const { exec } = require('child_process');
module.exports = defineConfig({
  reporter: 'cypress-mochawesome-reporter',
  e2e: {
    setupNodeEvents(on, config) {
      on('after:run', (results) => {
        // Get project and sprint names from environment variables
        const projectName = Cypress.env('project');
        const sprintName = Cypress.env('sprint');
    
        // Merge reports and generate HTML
        exec('npx mochawesome-merge cypress/reports/*.json > cypress/reports/merged-report.json && npx marge cypress/reports/merged-report.json -o cypress/reports', (err, stdout, stderr) => {
          if (err) {
            console.error(`exec error: ${err}`);
            return;
          }
    
          // Send email with project and sprint names
          exec(`node send-email.js "${projectName}" "${sprintName}"`, (err, stdout, stderr) => {
            if (err) {
              console.error(`exec error: ${err}`);
              return;
            }
            console.log(`stdout: ${stdout}`);
            console.error(`stderr: ${stderr}`);
          });
        });
      });
      require('cypress-mochawesome-reporter/plugin')(on);
    },
  viewportWidth: 1880,
  viewportHeight: 882,  
  },
  chromeWebSecurity: false
});
