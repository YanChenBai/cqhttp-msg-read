import { useSpeechSynthesis, UseSpeechSynthesisReturn } from "@vueuse/core";
import { onMounted, ref, Ref } from "vue";

function getVoices(
  synthData: SpeechSynthesis
): Promise<SpeechSynthesisVoice[]> {
  return new Promise((resolve) => {
    const timer = setInterval(() => {
      const list: SpeechSynthesisVoice[] = synthData.getVoices();
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

export function create(): {
  text: Ref<string>;
  voices: Ref<SpeechSynthesisVoice[]>;
  voice: Ref<SpeechSynthesisVoice>;
  speech: UseSpeechSynthesisReturn;
  synth: Ref<SpeechSynthesis | null>;
} {
  const voices = ref<SpeechSynthesisVoice[]>([]);
  const text = ref("我推的孩子!");
  let synth = ref<SpeechSynthesis | null>(null);
  const voice = ref<SpeechSynthesisVoice>(
    undefined as unknown as SpeechSynthesisVoice
  );

  const speech: UseSpeechSynthesisReturn = useSpeechSynthesis(text, {
    voice,
  });

  onMounted(() => {
    if (speech.isSupported.value) {
      setTimeout(async () => {
        synth.value = window.speechSynthesis;
        const list = await getVoices(synth.value);
        voices.value = list.filter((item) => item.lang === "zh-CN");
        voice.value = voices.value[3];
      });
    }
  });

  return {
    text,
    voices,
    voice,
    speech,
    synth,
  };
}
