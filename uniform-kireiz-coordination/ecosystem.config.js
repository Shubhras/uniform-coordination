module.exports = {
  apps: [
    {
      name: "uniform-kireiz-coordination",
      script: "npm",
      args: "run start", // Uses "start" instead of "dev"
      watch: false, // Set to false for production
      env: {
        NODE_ENV: "production",
        PORT: 7000, // Ensure this port matches your script
      },
    },
  ],
};