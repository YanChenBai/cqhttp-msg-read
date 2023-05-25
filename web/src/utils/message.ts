import { Message, Reading } from "./types";
import { group } from "../config";

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
  return str;
}

// 生成朗读的消息
function constructionMsg(config: Reading, data: Message): string {
  let msg: string = "";
  data.message = cQParse(data.message);
  if (data.message === "") return "";
  if (!config.read_name) {
    msg = data.message;
  } else {
    const findAlias = config.alias.find(
      (item) => item.user_id === data.user_id
    );
    if (findAlias === undefined) {
      msg = `${data.sender.nickname}说${data.message}`;
    } else {
      msg = `${findAlias.name}说${data.message}`;
    }
  }
  return msg;
}

// 群消息响应
function groupMessage(data: Message, play: Function) {
  const findGroup = group.find((item) => item.group_id === data.group_id);
  if (findGroup === undefined) return;

  if (findGroup.user_ids === false) {
    play(constructionMsg(findGroup, data));
  } else {
    if (findGroup.user_ids.indexOf(data.user_id) === -1) return;
    play(constructionMsg(findGroup, data));
  }
}

// 响应判断类型
export function eventMessage(event: MessageEvent<any>, play: Function) {
  const data: Message = JSON.parse(event.data);
  if (data.post_type === "message") {
    switch (data.message_type) {
      case "private":
        break;
      case "group":
        groupMessage(data, play);
        break;
    }
  }
}
