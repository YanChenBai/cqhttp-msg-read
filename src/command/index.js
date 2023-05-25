const { resolve } = require('path')
const load = require('../load')

// 导入所有event
let commands = load(resolve(__dirname, './'))

function command_analysis(data) {
    // 判断是否是指令
    if(data.message[0] === "#") {
        let command_name = data.message.substring(1)
        if(commands[command_name]) {
            
        }
    }
}

module.exports = command_analysis