<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useSpeechSynthesis, useWebSocket } from '@vueuse/core';
import { eventMessage } from './utils/message';

const voice = ref<SpeechSynthesisVoice>(undefined as unknown as SpeechSynthesisVoice)
const text = ref('Hello, everyone! Good morning!')

const speech = useSpeechSynthesis(text, {
    voice,
})

let synth: SpeechSynthesis

const voices = ref<SpeechSynthesisVoice[]>([])

function getVoices(synthData: SpeechSynthesis): Promise<SpeechSynthesisVoice[]> {
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
            }, 5000)
        }, 100)
    })
}

onMounted(() => {
    if (speech.isSupported.value) {
        setTimeout(async () => {
            synth = window.speechSynthesis
            const list = await getVoices(synth);
            voices.value = list.filter(item => item.lang === 'zh-CN')
            voice.value = voices.value[3]
        })
    }
})

function play(str: string) {
    if (str === "") return;
    text.value = str;
    speech.speak();
}

useWebSocket('ws://127.0.0.1:6700', {
    autoReconnect: {
        retries: 3,
        delay: 1000,
        onFailed: () => console.error('Failed to connect WebSocket after 3 retries'),
    },
    onMessage: (_ws, event) => eventMessage(event, play)
})

</script>

<template>
    <div>
        <div v-if="!speech.isSupported">
            Your browser does not support SpeechSynthesis API,
            <a href="https://caniuse.com/mdn-api_speechsynthesis" target="_blank">more details</a>
        </div>
        <div v-else>
            <label class="font-bold mr-2">Language</label>
            <div>
                <select v-model="voice">
                    <option disabled>
                        Select Language
                    </option>
                    <option v-for="(voice, i) in voices" :key="i" :value="voice">
                        {{ `${voice.name} (${voice.lang})` }}
                    </option>
                </select>
            </div>

            <div class="mt-2">
                <button :disabled="speech.isPlaying.value" @click="play(text)">
                    Test
                </button>
            </div>
        </div>
    </div>
</template>