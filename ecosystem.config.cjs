module.exports = {
  apps: [{
    name: "pr-lite",
    script: "server.js",
    env: {
      NODE_ENV: "production",
      PORT: 3001
    },
    instances: 1,
    exec_mode: "fork",
    watch: false,
    max_memory_restart: "300M",
    restart_delay: 3000,
    autorestart: true,
    time: true
  }]
}; 