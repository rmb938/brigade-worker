const { Job } = require("./brigadier");

exports.SopsJob = function (encryptedPath, decryptedPath) {
  j = new Job("sops", "mozilla/sops:latest")
  j.shell = "/bin/bash"

  j.tasks = [
    // waiting for https://github.com/Azure/brigade/pull/759 to be released
    // 'set -o pipefail',
    'set -x',
    `ls -la ${encryptedPath}`,
    `for filepath in ${encryptedPath}/*; do`,
    'filename=`basename $filepath`',
    `sops -d ${encryptedPath}/$filename > ${decryptedPath}/$filename`,
    'done',
    `ls -la ${decryptedPath}`
  ];

  return j
}
