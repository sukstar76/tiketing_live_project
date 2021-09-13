module.exports = {
  apps: [
    {
      name: 'live-server',
      //node_args: ['--experimental-modules'],
      script: './dist/app.js',
      exec_mode: 'cluster',
      instances: 1,
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
};
