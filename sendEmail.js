const nodemailer = require("nodemailer");
const archiver = require("archiver");
const fs = require("fs");
const path = require("path");
const logo =
  "https://www.dotsquares.com/css/assets_home_page/images/ds-logo-blue.svg";
// Capture command-line arguments
const projectName = process.argv[2];
const sprintName = process.argv[3];

// Replace these with your NiceSender SMTP server details and credentials
const transporter = nodemailer.createTransport({
  host: "smtp.msndr.net", // Replace with your NiceSender SMTP host
  port: 587, // Replace with the port if different
  secure: false, // Use true for port 465, false for other ports
  auth: {
    user: "tarun.arora.ds@gmail.com", // Replace with your NiceSender email
    pass: "3a0e893cc1af77d7bc8618cc333c392a", // Replace with your NiceSender password
  },
});

// Path to the folder you want to compress and send
const folderPath = path.join(__dirname, "cypress/reports");
const outputZipPath = path.join(__dirname, "report.zip");

// Create a zip archive of the folder
function createZipArchive(folderPath, outputZipPath, callback) {
  const output = fs.createWriteStream(outputZipPath);
  const archive = archiver("zip", {
    zlib: { level: 9 }, // Compression level
  });

  output.on("close", function () {
    console.log(archive.pointer() + " total bytes");
    console.log(
      "Archiver has been finalized and the output file descriptor has closed."
    );
    callback();
  });

  archive.on("error", function (err) {
    throw err;
  });

  archive.pipe(output);
  archive.directory(folderPath, false);
  archive.finalize();
}

// Send the email with the zip file attachment
function sendEmailWithAttachment() {
  const mailOptions = {
    from: "tarun.arora.ds@gmail.com", // Replace with your NiceSender email
    to: "hitesh.jangid@dotsquares.com", // Replace with the recipient's email
    subject: `Automated project audit report for ${projectName} (${sprintName})`,
    text: "Please find the attached project audit report.",
    html: `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Email</title>
    <style>
        body {
            font-family: 'Arial', sans-serif;
            background-color: #f4f4f4;
            color: #333;
            line-height: 1.6;
            margin: 0;
            padding: 20px;
        }
        .email-container {
            background-color: #ffffff;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            max-width: 600px;
            margin: 0 auto;
            text-align: left;
            animation: fadeIn 0.5s ease-out; /* Fade-in animation */
        }
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        .header {
            border-bottom: 2px solid #ffb74d; /* Orange */
            padding-bottom: 10px;
            margin-bottom: 20px;
            text-align: center; /* Center align the header content */
        }
        .header h1 {
            font-size: 28px;
            color: #1565c0; /* Blue */
            margin: 10px 0; /* Adjusted margin */
        }
        .header h1 strong {
            font-weight: bold;
            color: #e65100; /* Orange */
        }
        .header img {
            display: block; /* Ensure the logo is a block element */
            margin: 0 auto 10px; /* Center align the logo and add margin */
            max-width: 100px; /* Adjust size as needed */
            height: auto;
        }
        .content {
            margin-bottom: 20px;
        }
        .content p {
            margin: 0 0 10px;
            font-size: 16px;
            line-height: 1.6;
        }
        .content ul {
            list-style-type: none;
            padding-left: 0;
            margin-top: 10px;
        }
        .content li {
            margin-bottom: 8px;
            padding-left: 20px;
            position: relative;
        }
        .content li::before {
            content: '\\2022'; /* Bullet symbol */
            position: absolute;
            left: 0;
            color: #1565c0; /* Blue */
        }
        .content strong {
            font-weight: bold;
            color: #333; /* Dark gray */
        }
        .footer {
            border-top: 2px solid #ffb74d; /* Orange */
            padding-top: 10px;
            margin-top: 20px;
            font-size: 14px;
            color: #777;
            text-align: center;
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <img src="${logo}" alt="Company Logo">
            <h1>Audit Report for <strong style="color: #e65100;">${projectName}</strong></h1>
        </div>
        <div class="content">
            <p>Hello Team,</p>
            <p>We are pleased to share the audit report findings with you. Below is a summary of the key checkpoints audited:</p>
            <ul>
                <li><strong>Kanban Board:</strong> Confirm completion of all tasks across columns.</li>
                <li><strong>User Stories:</strong> Validate timely completion of all stories within the sprint.</li>
                <li><strong>UAT Scenarios:</strong> Ensure all UAT scenarios are documented in the UAT scenario tab.</li>
                <li><strong>Sprint Review MOM Evidence:</strong> Verify the presence of Sprint review MOM in the Message list.</li>
                <li><strong>Sprint Planning Evidence:</strong> Ensure Sprint planning evidence is uploaded in the Other documents tab under files.</li>
                <li><strong>Project Wiki:</strong> Verify comprehensive credentials and information in the Wiki tab.</li>
                <li><strong>Sprint Retrospective MOM:</strong> Validate Sprint retrospective evidence in the Retro tab.</li>
                <li><strong>UAT Evidence:</strong> Review UAT jobs and comments from respective teams.</li>
                <li><strong>Code Review Actions:</strong> Check Code review jobs and comments from respective teams.</li>
                <li><strong>Project Test Plan:</strong> Ensure the Test plan is accessible in the Test plan tab under files.</li>
                <li><strong>Project Proposal Document:</strong> Confirm the Proposal document in the Test plan tab under files.</li>
                <li><strong>Pre Sales Project Man Hours:</strong> Verify approved hours in the Settings.</li>
                <li><strong>QA Closure Report:</strong> Include the QA closure report in the message list.</li>
            </ul>
            <p>Please find the detailed audit report attached for your review.</p>
        </div>
        <div class="footer">
            <p>Best regards,</p>
            <p>Cypress Automation Service</p>
        </div>
    </div>
</body>
</html>
    `,
    attachments: [
      {
        filename: "report.zip",
        path: outputZipPath,
      },
    ],
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return console.log(error);
    }
    console.log("Message sent successfully: " + info.response);
  });
}

// Create the zip archive and send the email
createZipArchive(folderPath, outputZipPath, sendEmailWithAttachment);
