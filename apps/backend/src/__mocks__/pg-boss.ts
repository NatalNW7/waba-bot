/**
 * Mock manual do pg-boss para ambientes Jest (CJS).
 * O pg-boss v12+ é ESM-only; este mock evita o erro de import.
 */
class PgBoss {
  constructor() {}
  async start() {}
  async stop() {}
  send() {
    return 'mock-job-id';
  }
  work() {
    return 'mock-worker-id';
  }
}

module.exports = PgBoss;
module.exports.default = PgBoss;
