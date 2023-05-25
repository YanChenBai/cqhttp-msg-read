import { Message, GroupConfig } from "./types";
import { group } from "./config";

// 过滤emoji
function emojifilter(str: string) {
  let regex =
    /(?:[\u2700-\u27bf]|(?:\ud83c[\udde6-\uddff]){2}|[\ud800-\udbff][\udc00-\udfff]|[\u0023-\u0039]\ufe0f?\u20e3|\u3299|\u3297|\u303d|\u3030|\u24c2|\ud83c[\udd70-\udd71]|\ud83c[\udd7e-\udd7f]|\ud83c\udd8e|\ud83c[\udd91-\udd9a]|\ud83c[\udde6-\uddff]|\ud83c[\ude01-\ude02]|\ud83c\ude1a|\ud83c\ude2f|\ud83c[\ude32-\ude3a]|\ud83c[\ude50-\ude51]|\u203c|\u2049|[\u25aa-\u25ab]|\u25b6|\u25c0|[\u25fb-\u25fe]|\u00a9|\u00ae|\u2122|\u2139|\ud83c\udc04|[\u2600-\u26FF]|\u2b05|\u2b06|\u2b07|\u2b1b|\u2b1c|\u2b50|\u2b55|\u231a|\u231b|\u2328|\u23cf|[\u23e9-\u23f3]|[\u23f8-\u23fa]|\ud83c\udccf|\u2934|\u2935|[\u2190-\u21ff])/g;
  return str.replace(regex, "").trim();
}

// 去掉CQ码内容
function cQParse(str: string): string {
  let startIndex: number | null = null;
  const strArr: string[] = str.split("");
  for (let i = 0; i < strArr.length; i++) {
    if (strArr.slice(i, i + 3).join("") === "[CQ") {
      startIndex = i;
    }
    if (strArr[i] === "]" && startIndex !== null) {
      let tmp = [...strArr];
      tmp.splice(startIndex, i - startIndex + 1);
      return cQParse(tmp.join("").trim());
    }
  }
  return str.trim();
}

// 生成朗读的消息
function constructionMsg(config: GroupConfig, data: Message): string {
  let msg: string = "";
  data.message = emojifilter(cQParse(data.message));
  if (data.message === "") return "";
  if (data.message.length > 30)
    data.message = data.message.substring(0, 21) + ",发这么长干嘛,省略...";
  if (!config.read_name) {
    msg = data.message;
  } else {
    const findAlias = config.alias.find(
      (item) => item.user_id === data.user_id
    );
    if (findAlias === undefined) {
      let name = emojifilter(data.sender.card);
      name = name === "" ? emojifilter(data.sender.nickname) : name;
      msg = `${name}说${data.message}`;
    } else {
      msg = `${findAlias.name}说${data.message}`;
    }
  }
  return msg;
}

// 群消息响应
function groupMessage(data: Message, speak: Function) {
  const findGroup = group.find((item) => item.group_id === data.group_id);
  if (findGroup === undefined) return;

  if (findGroup.user_ids === false) {
    speak(constructionMsg(findGroup, data));
  } else {
    if (findGroup.user_ids.indexOf(data.user_id) === -1) return;
    speak(constructionMsg(findGroup, data));
  }
}

// 响应判断类型
export function eventMessage(event: MessageEvent<any>, speak: Function) {
  const data: Message = JSON.parse(event.data);
  if (data.post_type === "message") {
    console.log(data.message);
    switch (data.message_type) {
      case "private":
        break;
      case "group":
        groupMessage(data, speak);
        break;
    }
  }
}
