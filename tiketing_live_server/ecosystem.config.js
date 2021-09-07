module.exports = {
  apps: [
    {
      name: 'live-server',
      //node_args: ['--experimental-modules'],
      script: './dist/server.js',
      exec_mode: 'cluster',
      instances: 4,
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
};
