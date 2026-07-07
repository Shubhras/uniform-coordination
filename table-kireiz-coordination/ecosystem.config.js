module.exports = {
  apps: [
    {
      name: "table-kireiz-coordination",
      script: "npm",
      args: "run start",
      // cwd: "/root/uniform-coordination/table-kireiz-coordination",
      cwd: "/home/digi-4/project/Uniform Coordination Web Application/uniform-coordination/table-kireiz-coordination",
      watch: false,
      env: {
        NODE_ENV: "production",
        PORT: 7001
      }
    }
  ]
}

