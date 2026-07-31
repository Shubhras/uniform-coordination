module.exports = {
  apps: [
    {
      name: "admin-kireiz-coordination",
      script: "npm",
      args: "run start",
      cwd: "/var/www/html/uniform-coordination/admin-kireiz-coordination",
      //cwd: "/home/digi-4/project/Uniform Coordination Web Application/uniform-coordination/admin-kireiz-coordination",
      watch: false,
      env: {
        NODE_ENV: "production",
        PORT: 7002
      }
    }
  ]
}