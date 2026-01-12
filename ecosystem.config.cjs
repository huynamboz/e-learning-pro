module.exports = {
  apps: [
    {
      name: 'italianolive-app',
      script: '.output/server/index.mjs',
      cwd: './',
      instances: 'max', // Sử dụng tất cả CPU cores
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'development',
        PORT: 3000,
        HOST: '0.0.0.0',
        NITRO_PORT: 3000,
        NITRO_HOST: '0.0.0.0',
        API_BASE_URL: 'https://api.hoctiengycungphantam.com/api/v1',
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000,
        HOST: '0.0.0.0',
        NITRO_PORT: 3000,
        NITRO_HOST: '0.0.0.0',
        API_BASE_URL: 'https://api.hoctiengycungphantam.com/api/v1',
      },
      // PM2 specific options
      watch: false, // Tắt watch trong production
      ignore_watch: ['node_modules', 'logs', '.nuxt', '.output'],
      max_memory_restart: '1G',
      error_file: './logs/err.log',
      out_file: './logs/out.log',
      log_file: './logs/combined.log',
      time: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      // Auto restart options
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
      restart_delay: 4000,
      // Advanced options
      kill_timeout: 5000,
      listen_timeout: 3000,
      // Health monitoring
      health_check_grace_period: 3000,
      // Environment variables
      env_file: '.env',
    },
  ],

  // Deployment configuration
  deploy: {
    production: {
      'user': 'deploy',
      'host': ['italianolive.com'],
      'ref': 'origin/main',
      'repo': 'git@github.com:your-username/italianolive.git',
      'path': '/var/www/italianolive',
      'pre-deploy-local': '',
      'post-deploy': 'npm install && npm run build && pm2 reload ecosystem.config.cjs --env production',
      'pre-setup': '',
    },
    staging: {
      'user': 'deploy',
      'host': ['staging.italianolive.com'],
      'ref': 'origin/develop',
      'repo': 'git@github.com:your-username/italianolive.git',
      'path': '/var/www/italianolive-staging',
      'pre-deploy-local': '',
      'post-deploy': 'npm install && npm run build && pm2 reload ecosystem.config.cjs --env staging',
      'pre-setup': '',
    },
  },
}
