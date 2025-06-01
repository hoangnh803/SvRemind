module.exports = {
  apps: [{
    name: "lienlac.sinhvien.online API",
    script: "node ./main.js",
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: "1G",
  }]
}
