import Queue from "queue";
import { onMounted, ref, Ref } from "vue";
import { LangType } from "./types";

// 获取数据
function getVoices(
  synthData: SpeechSynthesis
): Promise<SpeechSynthesisVoice[]> {
  return new Promise((resolve) => {
    const timer = setInterval(() => {
      let list: SpeechSynthesisVoice[] = synthData.getVoices();
      if (list.length > 0) {
        resolve(list);
        clearInterval(timer);
      }
      setTimeout(() => {
        resolve([]);
        clearInterval(timer);
      }, 5000);
    }, 100);
  });
}

// 判断是否支持此API
export const isSupported = () =>
  "SpeechSynthesisUtterance" in window && "speechSynthesis" in window;

export interface UseSpeechSynthesisType {
  synth: Ref<SpeechSynthesis>;
  voice: Ref<SpeechSynthesisVoice>;
  voices: Ref<SpeechSynthesisVoice[]>;
  queueLen: Ref<number>;
  voiceIndex: Ref<number>;
  currentText: Ref<string>;
  queue: Queue;
  speak: { (text: string): number };
  updateVoices: { (): Promise<void> };
}
export function useSpeechSynthesis(): UseSpeechSynthesisType {
  const queue = new Queue({ results: [], autostart: true });
  const pitch = ref<number>(1),
    rate = ref<number>(1),
    volume = ref<number>(1),
    lang = ref<LangType>("zh-CN"),
    currentText = ref<string>(""),
    queueLen = ref<number>(0);
  const synth = ref<SpeechSynthesis>(undefined as unknown as SpeechSynthesis);
  const voices = ref<SpeechSynthesisVoice[]>([]);
  const voiceIndex = ref<number>(3);
  const voice = ref<SpeechSynthesisVoice>(
    undefined as unknown as SpeechSynthesisVoice
  );
  const updateQueueLen = () => (queueLen.value = queue.length);
  synth.value = window.speechSynthesis;

  // 添加任务
  function speak(text: string): number {
    return queue.push(
      () =>
        new Promise<boolean>((resolve, reject) => {
          queueLen.value = queue.length;
          text = text.trim();
          if (text.length > 0) {
            const message = new SpeechSynthesisUtterance(text);
            message.lang = lang.value;
            message.pitch = pitch.value;
            message.rate = rate.value;
            message.volume = volume.value;
            message.voice = voice.value;
            message.onend = () => resolve(true);
            message.onerror = () => reject(false);
            if (synth.value !== null) {
              synth.value.speak(message);
              currentText.value = text;
            } else {
              reject(false);
            }
          } else {
            resolve(true);
          }
        })
    );
  }

  // 更新语音列表
  async function updateVoices() {
    const res = await getVoices(synth.value);
    voices.value = res.filter((item) => item.lang === lang.value);
    voice.value = voices.value[voiceIndex.value];
  }

  // 队列事件
  queue.addEventListener("success", () => {
    updateQueueLen();
  });
  queue.addEventListener("error", () => {
    updateQueueLen();
  });
  queue.addEventListener("timeout", () => {
    updateQueueLen();
  });
  queue.addEventListener("end", () => {});
  queue.addEventListener("start", () => {});

  onMounted(() =>
    setTimeout(async () => {
      await updateVoices();
    })
  );

  return {
    synth,
    voice,
    voices,
    queue,
    voiceIndex,
    queueLen,
    currentText,
    speak,
    updateVoices,
  };
}
