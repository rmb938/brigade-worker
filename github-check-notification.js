const { Job } = require("./brigadier");

exports.CheckNotification = class Notification {
  constructor(name, e, p) {
    this.proj = p;
    this.payload = e.payload;
    this.name = name;
    this.externalID = e.buildID;
    this.detailsURL = `https://kashti.brigade.kube0.kubernetes.rmb938.com/builds/${e.buildID}`;
    this.title = "running check";
    this.text = "";
    this.summary = "";

    // count allows us to send the notification multiple times, with a distinct pod name
    // each time.
    this.count = 0;

    // One of: "success", "failure", "neutral", "cancelled", or "timed_out".
    this.conclusion = "neutral";
  }

  // Send a new notification, and return a Promise<result>.
  run() {
    this.count++;
    var j = new Job(`${this.name}-${this.count}`, "deis/brigade-github-check-run:latest");
    j.imageForcePull = true;
    j.env = {
      CHECK_CONCLUSION: this.conclusion,
      CHECK_NAME: this.name,
      CHECK_TITLE: this.title,
      CHECK_PAYLOAD: this.payload,
      CHECK_SUMMARY: this.summary,
      CHECK_TEXT: this.text,
      CHECK_DETAILS_URL: this.detailsURL,
      CHECK_EXTERNAL_ID: this.externalID
    };
    return j.run();
  }
}

// Helper to wrap a job execution between two notifications.
exports.CheckNotificationWrap = async function (job, note) {
  try {
    let res = await job.run();
    const logs = await job.logs();

    note.conclusion = "success";
    note.summary = `Task "${job.name}" passed`;
    note.text = note.text = "```" + res.toString() + "```\nComplete";
    return await note.run();
  } catch (e) {
    const logs = await job.logs();
    note.conclusion = "failure";
    note.summary = `Task "${job.name}" failed for ${e.buildID}`;
    note.text = "```" + logs + "```\nFailed with error: " + e.toString();
    try {
      return await note.run();
    } catch (e2) {
      console.error("failed to send notification: " + e2.toString());
      console.error("original error: " + e.toString());
      return e2;
    }
  }
}
