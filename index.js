import { App } from "@tinyhttp/app";
import { logger } from "@tinyhttp/logger";
import { WebClient } from "@slack/web-api";
import { config } from "@tinyhttp/dotenv";

const envObject = config()["parsed"];
log(envObject);
const slackInstance = new WebClient(envObject.SLACK_TOKEN);

new App()
  .use(logger())
  .post("/github", (req, res) => {
    githubReply(req.body);
    res.status(200).send({ status: "ok" });
  })
  .post("/custom", (req, res) => {
    const { message, channel, icon_url, username } = req.body;
    sendSlackMessage({
      message,
      channel,
      icon_url,
      username,
    });
    res.status(200).send({ status: "ok" });
  })
  .listen(envObject.PORT, (e) => console.log(`Slack webhook started ✔️`));

const githubReply = (body) => {
  let finalSlackMsg;
  const {
    ref,
    sender,
    before,
    commits,
    head_commit,
    forced,
    deployment_status,
    compare,
    action,
    pull_request,
  } = body;

  if (deployment_status) {
    // heroku data webhook
    const possible_state = {
      success: { msg: "successfully deployed 🔥" },
      crashed: { msg: "successfully deployed ⚠️" },
    };
    const { state, environment } = deployment_status;
    finalSlackMsg = `*${environment} is ${possible_state[state] || state}*`;
  } else if (action) {
    const { id, title, body, user, head, base } = pull_request;
    finalSlackMsg = `Message: *Pull Request ${title}*\n${
      !body || body === "" ? "" : `Description: ${body}\n`
    }Status: ${action}\nBy: <${user?.html_url}|${user?.login}>\nFlow: ${
      head?.ref
    } -> ${base?.ref}\nPull Request: <${pull_request?.html_url}|${id}>`;
  } else if (commits) {
    // github data webhook
    let subCommits = [];
    if (commits?.length > 1) {
      // multi-commit push
      subCommits = commits.map(
        (c) => `• ${c?.message} by *${c?.author?.username}*\n`
      );
    }

    const { message } = head_commit;
    const { login, html_url } = sender;
    finalSlackMsg = `*Message: ${message}*\n\n${
      subCommits.length !== 0 ? `${subCommits.join("")}\n` : ""
    }By: <${html_url}|${login}>\nIsForced: ${forced}\nCompare: <${compare}|${
      ref?.split("refs/heads/")?.[1]
    }>`;
  }
  sendSlackMessage({
    message: finalSlackMsg,
    username: "GitHub",
    icon_url:
      "https://avatars.slack-edge.com/2020-11-25/1527503386626_319578f21381f9641cd8_512.png",
  });
};

const sendSlackMessage = ({
  message,
  channel = "C01T61W7RR9",
  icon_url = "https://static.wixstatic.com/media/0559de_492a5f8d26634ab08a1b8e8985bf5215~mv2.png/v1/fill/w_68,h_68,al_c,q_85,usm_0.66_1.00_0.01/256",
  username = "WasabiBot",
}) => {
  slackInstance.chat.postMessage({
    text: message,
    channel,
    icon_url,
    username,
  });
};
