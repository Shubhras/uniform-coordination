module.exports = {
  apps: [
    {
      name: "uniform-kireiz-coordination",
      script: "npm",
      args: "run start",
      // cwd: "/root/uniform-coordination/uniform-kireiz-coordination",
      cwd: "/home/digi-4/project/Uniform Coordination Web Application/uniform-coordination/uniform-kireiz-coordination",
      watch: true,
      env: {
        NODE_ENV: "production",
        PORT: 7000
      }
    }
  ]
}

