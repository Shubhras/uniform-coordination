module.exports = {
  apps: [
    {
      name: "admin-table-coordination",
      script: "npm",
      args: "run start",
      // cwd: "/root/uniform-coordination/admin-table-coordination",
      cwd: "/home/digi-4/project/Uniform Coordination Web Application/uniform-coordination/admin-table-coordination",
      watch: false,
      env: {
        NODE_ENV: "production",
        PORT: 7003
      }
    }
  ]
}