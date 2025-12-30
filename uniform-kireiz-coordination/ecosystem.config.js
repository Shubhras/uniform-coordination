module.exports = {
  apps: [
    {
      name: "uniform-kireiz-coordination",
      script: "npm",
      args: "run start",
      cwd: "/Uniform Coordination Web Application/uniform-coordination/uniform-kireiz-coordination",
      watch: true,
      env: {
        NODE_ENV: "production",
        PORT: 7000
      }
    }
  ]
}

