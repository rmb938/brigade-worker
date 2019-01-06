# brigade-worker
Brigade Worker Image with helper libraries 

## sops

Decrypt (sops)[https://github.com/mozilla/sops]files 

```javascript
const { SopsJob } = require("./sops");

events.on("exec", (e, p) => {
  const decryptedPath = '/mnt/sops/decrypted';

  // /src/encrypted is a directory filled with sops secrets
  const sopsJob = new SopsJob("/src/encrypted", decryptedPath);

  // persist the secrets so we can use them in other jobs
  sopsJob.storage = {
    enabled: true,
    path: decryptedPath
  };

  // Load credentials, in this case a GCP service account
  this.env["GCP_SERVICE_ACCOUNT_KEY"] = {
    secretKeyRef: {
      name: "sops",
      key: "gcp"
    }
  };

  // sops uses the default GCP credentials
  this.env["GOOGLE_APPLICATION_CREDENTIALS"] = '/src/gcp_creds.json';

  // GCP creds need to be base64 so the environment doesn't get weird and the need to be placed into a file
  sopsJob.tasks.unshift("echo ${GCP_SERVICE_ACCOUNT_KEY} | base64 -d > ${GOOGLE_APPLICATION_CREDENTIALS}");

  sopsJob.run();
});
```
