// components/address/index.js
import {AuthAddress} from "../../core/enum";
import {Address} from "../../models/address";

Component({
    /**
     * 组件的属性列表
     */
    properties: {},

    /**
     * 组件的初始数据
     */
    data: {
        address: Object,
        hasChosen: false,
        showDialog: false

    },
    lifetimes: {
        attached() {
            const address = Address.getLocal()
            if (address) {
                this.setData({
                    address,
                    hasChosen: true
                })
                this.triggerEvent('address', {
                    address
                })
            }
        }
    },
    /**
     * 组件的方法列表
     */
    methods: {
        async onChooseAddress() {
            //查询用户授权情况
            const authStatus = await this.hasAuthorizedAddress()
            if (authStatus === AuthAddress.DENY) {
                this.setData({
                    showDialog: true
                })
                return
            }
            this.getUserAddress()
        },

        //打开小程序设置
        onDialogConfirm(event) {
            wx.openSetting()
        },
      //获取用户地址
        async getUserAddress() {
            let res;
            try {
                res = await wx.chooseAddress({})
            } catch (e) {
                console.error(e)
            }
            if (res) {
                this.setData({
                    address: res,
                    hasChosen: true
                })
                Address.setLocal(res)
                this.triggerEvent('address', {
                    address: res
                })
            }
        },
      //查询用户授权情况
        async hasAuthorizedAddress() {
            const setting = await wx.getSetting({})
            const addressSetting = setting.authSetting['scope.address']
            if (addressSetting === undefined) {
                return AuthAddress.NOT_AUTH
            }
            if (addressSetting === false) {
                return AuthAddress.DENY
            }
            if (addressSetting === true) {
                return AuthAddress.AUTHORIZED
            }
        }
    }
})
