const fs = require('fs');
const path = require('path');

// Create .stackblitzrc configuration
const stackblitzConfig = {
  installDependencies: true,
  startCommand: "npm run dev",
  env: {
    NODE_ENV: "development"
  }
};

fs.writeFileSync(
  path.join(process.cwd(), '.stackblitzrc'),
  JSON.stringify(stackblitzConfig, null, 2)
);

// Create project.json for StackBlitz
const projectConfig = {
  name: "siemka-design-tool",
  description: "Interactive web application for creating custom t-shirt and hoodie designs",
  template: "node",
  tags: ["nextjs", "react", "typescript", "tailwindcss"]
};

fs.writeFileSync(
  path.join(process.cwd(), 'project.json'),
  JSON.stringify(projectConfig, null, 2)
);

console.log('StackBlitz configuration files created successfully!');