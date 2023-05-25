const fs = require('fs')
const { resolve } = require('path')

// 导入所有文件夹下的js文件
module.exports = function(path) {

    let modules = {}

    fs.readdirSync(path).forEach(item => {

        if(item === "index.js") return;

        // 获取名字
        let name = item.split('.')[0]
        modules[name] = require(resolve(path, item))
    })

    return modules
}