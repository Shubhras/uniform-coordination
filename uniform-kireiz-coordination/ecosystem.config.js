module.exports = {
  apps: [
    {
      name: "uniform-kireiz-coordination",
      script: "npm",
      args: "run start",
      // Run from this app's folder wherever the repo is checked out.
      cwd: __dirname,
      watch: false,
      // Crash-loop protection: back off between restarts and give up after repeated
      // fast crashes instead of restarting hundreds of times a minute (a stale process
      // holding the port once kept an app restarting ~800 times/min for two weeks).
      exp_backoff_restart_delay: 1000,
      min_uptime: "30s",
      max_restarts: 10,
      max_memory_restart: "1G",
      env: {
        NODE_ENV: "production",
        PORT: 7000
      }
    }
  ]
}
