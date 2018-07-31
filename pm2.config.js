module.exports = {
  apps: [{
    name: 'nean-stack',
    script: './server/src/bin/www',
    instances: 1,
    max_memory_restart: '200M',
    wait_ready: true,
    error_file: 'err.log',
    out_file: 'out.log',
    merge_logs: true,
    log_date_format: 'YYYY-MM-DD HH:mm',
    log_file: 'combined.log',
  }]
};
