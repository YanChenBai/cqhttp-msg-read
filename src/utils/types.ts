export type LangType = "zh-HK" | "zh-TW" | "ja-JP" | "zh-CN" | "en-US";
export type PostType = "message" | "request" | "notice" | "meta_event";
export type MessageType = "private" | "group";

export type PostMessageSubType =
// 好友
| "friend"
// 群聊
| "normal"
// 匿名
| "anonymous"
// 群中自身发送
| "group_self"
// 群临时会话
| "group"
// 系统提示
| "notice";

export interface PostMessageMessageSender {
  user_id: number; // 发送者 QQ 号
  nickname: string; // 昵称
  sex: "male" | "female" | "unknown"; // 性别
  age: number; // 年龄
  group_id?: number;
  card: string;
}

// 消息
export interface Message {
  post_type: PostType;
  message_type: MessageType;
  sub_type: PostMessageSubType;
  message_id: number;
  user_id: number;
  message: string;
  raw_message: string;
  font: number;
  sender: PostMessageMessageSender;
  group_id: number;
  time: number;
  self_id: number;
}

// 配置文件 - 用户别名
export interface IDAlias {
  user_id: number; // 用户id
  name: string;
}

// 需要朗读的群聊
export interface GroupConfig {
  group_id: number;
  user_ids: number[] | false;
  read_name: boolean;
  alias: IDAlias[];
}

export interface GetMessageRes {
  data: {
    group: boolean;
    group_id: number;
    message: string;
    message_id: number;
    message_id_v2: string;
    message_seq: number;
    message_type: MessageType;
    real_id: number;
    sender: {
      nickname: string;
      user_id: number;
    };
    time: string;
  };
  message: string;
  retcode: number;
  status: string;
}