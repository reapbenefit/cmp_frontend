module.exports = {
    apps: [
      {
        name: 'cmp-frontend',
        script: 'npm',
        args: 'start',
        cwd: '/home/ubuntu/app/cmp_frontend',
        instances: 'max', // Use all available CPU cores
        exec_mode: 'cluster',
        env: {
          NODE_ENV: 'production',
          PORT: 3000
        },
        env_production: {
          NODE_ENV: 'production',
          PORT: 3000
        },
        // PM2 specific options
        watch: false,
        max_memory_restart: '1G',
        error_file: './logs/err.log',
        out_file: './logs/out.log',
        log_file: './logs/combined.log',
        time: true,
        // Auto restart options
        autorestart: true,
        max_restarts: 10,
        min_uptime: '10s'
      }
    ]
  };