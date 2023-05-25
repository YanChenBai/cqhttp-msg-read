const { resolve } = require('path')
const load = require('../load')

// 导入所有event
let events = load(resolve(__dirname, './'))

// 消息时间
function messageEvent(bufferData) {
    let msg = JSON.parse(bufferData.toString())
    if(events[msg.post_type]) {
        if(events[msg.post_type]) {
            try {
                let event = events[msg.post_type]
                let type_name = msg[event.type_name]
                event[type_name](msg)
            } catch (error) {
                console.log(error);
            }
        }
    }
}

module.exports = messageEvent