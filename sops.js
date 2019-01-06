const { events, Job, Group } = require("brigadier");

class SopsJob extends Job {
  constructor(encryptedPath, decryptedPath) {
    super("sops", "mozilla/sops:latest");

    this.tasks = [
      `set -o pipefail`,
      `set -x`,
      `ls -la ${encryptedPath}`,
      `for filepath in ${encryptedPath}/*; do`,
      'filename=`basename $filepath`',
      `sops -d ${encryptedPath}/$filename > ${decryptedPath}/$filename`,
      `done`,
      `ls -la ${decryptedPath}`
    ];
  }
}
