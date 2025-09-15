module.exports = {
  apps: [
    {
      name: 'elearning-dev',
      script: 'npm',
      args: 'run dev',
      cwd: './',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'development',
        PORT: 3000,
        HOST: '0.0.0.0',
        API_BASE_URL: 'https://elearning.genfash.online/api/v1',
      },
      // Development specific options
      watch: true,
      ignore_watch: [
        'node_modules',
        'logs',
        '.nuxt',
        '.output',
        'dist',
        '*.log',
      ],
      watch_options: {
        followSymlinks: false,
        usePolling: true,
        interval: 1000,
      },
      // Logging
      error_file: './logs/dev-err.log',
      out_file: './logs/dev-out.log',
      log_file: './logs/dev-combined.log',
      time: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      // Auto restart
      autorestart: true,
      max_restarts: 5,
      min_uptime: '5s',
      restart_delay: 2000,
      // Kill timeout
      kill_timeout: 5000,
      // Environment file
      env_file: '.env',
    },
  ],
}
