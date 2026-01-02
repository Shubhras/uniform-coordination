module.exports = {
  apps: [
    {
      name: "table-kireiz-coordination",
      script: "npm",
      args: "run start",
      cwd: "/root/uniform-coordination/table-kireiz-coordination",
      watch: true,
      env: {
        NODE_ENV: "production",
        PORT: 7001
      }
    }
  ]
}

