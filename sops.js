const { events, Job, Group } = require("brigadier");
const fs = require('fs');

class SopsJob extends Job {
  constructor(encryptedPath = "encrypted", decryptedPath = "decrypted") {
    super("sops", "mozilla/sops:latest");

    this.storage = {
      enabled = true,
      path = decryptedPath
    }

    this.env = {
      GCP_SERVICE_ACCOUNT_KEY: {
        secretKeyRef: {
          name: "sops",
          key: "gcp"
        }
      }
    }

    vcsEncryptedPath = `/vcs/${encryptedPath}`
    vcsDecryptedPath = `/vcs/${decryptedPath}`

    srcEncryptedPath = `/src/${encryptedPath}`
    srcDecryptedPath = `/src/${decryptedPath}`

    this.tasks = [
      `set -x`,
      `ls -la ${srcEncryptedPath}`
    ];

    fs.readdirSync(encryptedPath).forEach(file => {
      this.tasks.push(`sops -d ${srcDecryptedPath}/${file} > ${srcDecryptedPath}/${file}`)
    })

    this.tasks.push(`ls -la ${srcDecryptedPath}`)
  }
}
