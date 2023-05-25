const command_analysis = require('../command')

module.exports = {
    type_name: "message_type",
    private: (msg) => {
        console.log(msg.message);
        command_analysis(msg);
    },
    group: (msg) => {
        if (msg.group_id === 249374345 && msg.user_id === 540854762) {
            console.log(msg);
        } else if (msg.group_id === 765600908) {
            console.log(msg)
        }
    }
}