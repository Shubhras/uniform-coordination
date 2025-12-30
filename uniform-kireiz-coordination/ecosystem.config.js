module.exports = {
  apps: [
    {
      name: "uniform-kireiz-coordination",
      script: "npm",
      args: "run start",
      // cwd: "/home/digi-4/project/Uniform Coordination Web Application/uniform-coordination/uniform-kireiz-coordination",
      watch: false,
      env: {
        NODE_ENV: "production",
        PORT: 7000
      }
    }
  ]
}