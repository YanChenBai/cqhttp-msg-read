<template>
    <div>
        <div v-if="!speech.isSupported">
            您的浏览器不支持语音合成API，
            <a href="https://caniuse.com/mdn-api_speechsynthesis" target="_blank">更多的细节</a>
        </div>
        <n-card v-else style="width: 500px;margin: 200px auto;">
            当前任务数量: {{ queueLen }}
            <n-form-item label="声音角色">
                <n-select v-model:value="(voice as any)" :options="voicesComputed" />
            </n-form-item>
            <n-button :disabled="queueLen>0" @click="play('你有看新番我推的孩子么?')" type="primary" style="width: 100%;">
                Test
            </n-button>
        </n-card>
    </div>
</template>

<script setup lang="ts">
import { eventMessage } from './utils/message';
import { create } from './utils/voice';
import { useWebSocket } from '@vueuse/core';
import { NButton, NSelect, NFormItem, NCard } from 'naive-ui';
import { computed, ref } from 'vue';
import Queue from 'queue';
const queue = new Queue({ results: [], autostart: true })
const { voices, voice, speech, text, synth } = create();
const queueLen = ref<number>(0);

function play(str: string) {
    queue.push(() => new Promise<boolean>((resolve, reject) => {
        queueLen.value = queue.length;
        if (str !== "") {
            text.value = str;
            let msg = new SpeechSynthesisUtterance(text.value);
            msg.voice = voice.value;
            msg.onend = () => resolve(true);
            msg.onerror = () => reject();
            if (synth.value !== null) {
                synth.value.speak(msg)
            }
        } else {
            resolve(true)
        }
    }));
}

const voicesComputed = computed<any[]>(() => voices.value.map(item => ({ label: item.name, value: item })))
useWebSocket('ws://127.0.0.1:6700', {
    autoReconnect: {
        retries: 3,
        delay: 1000,
        onFailed: () => console.error('Failed to connect WebSocket after 3 retries'),
    },
    onMessage: (_ws, event) => eventMessage(event, play)
});

queue.addEventListener('success', e => {
    queueLen.value = queue.length;
    console.log('执行成功!', e.detail.result)
});

queue.addEventListener('error', (e) => {
    queueLen.value = queue.length;
    console.error("执行错误!", e);
});
queue.addEventListener('end', e => console.log('执行完毕!', e))
queue.addEventListener('start', e => console.log('开始执行!', e))
queue.addEventListener('timeout', e => {
    queueLen.value = queue.length;
    console.error("执行超时!", e);
});

</script>