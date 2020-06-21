import {config} from "../config/config";
import {promisic} from "./util";
import {Token} from "../models/token";
import {HttpException} from "../core/http-exception";
import {codes} from "../config/exception-config";


class Http {
    static async request({url, data, method = 'GET',resend=true, throwError = false}) {
        let res
        try {
            res = await promisic(wx.request)({
                url: `${config.apiBaseUrl}${url}`,
                data,
                method,
                header: {
                    'content-type': 'application/jsojn',
                    appkey: config.appkey,
                    'authorization': `Bearer ${wx.getStorageSync('token')}`
                },
            })
        } catch (e) {
            if (throwError) {
                throw new HttpException(-1, codes[-1])
            }
            Http.showError(-1)
            return null

        }

        const code = res.statusCode.toString()
        //状态码是2 开头的 成功
        if (code.startsWith('2')) {
            return res.data
        } else {
            if (code === '401') {
                // 二次重发
                if (resend) {
                    await Http._resend({
                        url,
                        data,
                        method,
                        resend:false
                    })
                }
            } else {
                if (throwError) {
                    throw new HttpException(res.data.code, res.data.message, code)
                }
                if (code === '404') {
                    //处理单个为空
                    if (res.data.code !== undefined) {
                        return null
                    }
                    return res.data
                }
                const error_code = res.data.code;
                Http.showError(error_code, res.data)
            }
        }
        return res.data
    }
    static async _resend(data) {
        const token = new Token()
        await token.getTokenFromServer()
       // data.resend = false
        return await Http.request(data)
    }

    static showError(error_code, serverError) {
        let tip
        console.log(error_code)

        if (!error_code) {
            tip = codes[9999]
        } else {
            if (codes[error_code] === undefined) {
                tip = serverError.message
            } else {
                tip = codes[error_code]
            }
        }

        wx.showToast({
            icon: "none",
            title: tip,
            duration: 2000
        })
    }
}


export {
    Http
}