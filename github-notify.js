const { Job } = require("./brigadier");

exports.Notify = class Notify {
  constructor(name, e, p) {
    this.proj = p;
    this.event = e
    this.name = name;
    this.detailsURL = `https://kashti.brigade.kube0.kubernetes.rmb938.com/builds/${e.buildID}`;
    this.text = "";

    // One of: "pending", "error", "failure", or "success".
    this.state = "pending";
  }

  // Send a new notification, and return a Promise<result>.
  run() {
    var j = new Job(`${this.name}`, "technosophos/github-notify:latest");
    j.imageForcePull = true;
    j.env = {
      GH_REPO: this.proj.repo.name,
      GH_STATE: this.state,
      GH_DESCRIPTION: this.text,
      GH_CONTEXT: this.name,

      GH_TARGET_URL: this.detailsURL,

      // We get the token from the project's secrets section.
      GH_TOKEN: this.proj.secrets.ghToken, // YOU MUST SET THIS IN YOUR PROJECT

      GH_COMMIT: this.event.payload["release"]["target_commitish"],
    };
    return j.run();
  }
}

exports.NotifyWrap = async function (group, note) {
  await note.run();
  try {
    let res = await group.runEach();
    note.state = "success";
    return await note.run();
  } catch (e) {
    note.state = "failure";
    try {
      note.state = "error";
      return await note.run();
    } catch (e2) {
      console.error("failed to send notification: " + e2.toString());
      console.error("original error: " + e.toString());
      return e2;
    }
  }
}
