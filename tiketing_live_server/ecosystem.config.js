module.exports = {
  apps: [
    {
      name: 'live-server',
      node_args: ['--max-old-space-size=4096'],
      script: './dist/server.js',
      exec_mode: 'cluster',
      instances: 8,
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
};
