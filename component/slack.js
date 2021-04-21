import { WebClient } from "@slack/web-api";
import * as dotenv from "dotenv";
const config = dotenv.config();

const slackInstance = new WebClient(config.SLACK_TOKEN);

console.log(config.SLACK_TOKEN);

function sendSlackMessage({ message, conversationId = "C01T61W7RR9" }) {
  slackInstance.chat.postMessage({
    text: message,
    channel: conversationId,
    icon_url:
      "https://static.wixstatic.com/media/0559de_492a5f8d26634ab08a1b8e8985bf5215~mv2.png/v1/fill/w_68,h_68,al_c,q_85,usm_0.66_1.00_0.01/256",
    username: "WasabiBot",
  });
}

export { sendSlackMessage };
