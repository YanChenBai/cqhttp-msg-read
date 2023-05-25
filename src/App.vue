<template>
    <div>
        <div v-if="!isSupported()">
            您的浏览器不支持语音合成API，
            <a href="https://caniuse.com/mdn-api_speechsynthesis" target="_blank">更多的细节</a>
        </div>
        <n-card v-else style="width: 500px;margin: 200px auto;">
            <p>当前任务数量: {{ queueLen }}</p>
            <p>现在播放的消息: {{ currentText }}</p>
            <n-form-item label="声音角色">
                <n-select v-model:value="voiceIndex" :options="voicesComputed" />
            </n-form-item>
            <n-button :disabled="queueLen > 0" @click="speak('你有看新番我推的孩子么?')" type="primary" style="width: 100%;">
                Test
            </n-button>
        </n-card>
    </div>
</template>

<script setup lang="ts">

import { computed, onUnmounted } from 'vue';
import {
    isSupported,
    useSpeechSynthesis
} from './utils/voice';
import { useWebSocket } from '@vueuse/core';
import { NButton, NSelect, NFormItem, NCard } from 'naive-ui';
import { eventMessage } from './utils/message';
import { QQServer } from './utils/config';

const voicesComputed = computed<any[]>(() => voices.value.map((item, index) => ({ label: item.name, value: index })));
const { voices, speak, queueLen, currentText, voiceIndex } = useSpeechSynthesis();
const { close } = useWebSocket(QQServer, {
    autoReconnect: {
        retries: 3,
        delay: 1000,
        onFailed: () => console.error('Failed to connect WebSocket after 3 retries'),
    },
    onMessage: (_ws, event) => eventMessage(event, speak)
});

onUnmounted(() => {
    close();
    console.log('结束.....');
})
</script>