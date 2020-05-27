import {config} from "../config/config";
import {promisic} from "./util";


class Http {
    static async request({
                             url,
                             data,
                             method = 'GET'
                         }) {
        const res = await promisic(wx.request)({
            url: `${config.apiBaseUrl}${url}`,
            data,
            method,
            header: {
                appkey: config.appkey
            }
        })
        return res.data
    }
    // 统一异常处理的方案
}

// wx.request
// promisic(wx.request)({
//     url:'',
//     data:data,
// })
//
// promisic(wx.getStorage)
//
// promisic(wx.showToast)()

//动态类型 非常常见， python
// java C# 委托

export {
    Http
}