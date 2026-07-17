module.exports = {
  apps: [
    {
      name: "admin-kireiz-coordination",
      script: "npm",
      args: "run start",
      // cwd: "/root/uniform-coordination/uniform-kireiz-coordination",
      cwd: "/home/digi-4/project/Uniform Coordination Web Application/uniform-coordination/admin-kireiz-coordination",
      watch: false,
      env: {
        NODE_ENV: "production",
        PORT: 7002
      }
    }
  ]
}