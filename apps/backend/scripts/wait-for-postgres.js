const { exec } = require('node:child_process');

function checkPostgres() {
  exec('docker exec postgres pg_isready --host localhost', handleReturn);

  function handleReturn(error, stdout) {
    if (stdout.search('accepting connections') === -1) {
      process.stdout.write('.');
      checkPostgres();
      return;
    }

    console.log('\n🟢 Postegres está pronto e aceitando conexões!\n');
  }
}

process.stdout.write('🔴 Aguardando Postegres aceitar conexões');
checkPostgres();
