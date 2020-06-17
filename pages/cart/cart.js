// pages/cart/cart.js
import {Cart} from "../../models/cart";

Page({

    /**
     * 页面的初始数据
     */
    data: {
        cartItems: [],
        isEmpty: false
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {

        const cart = new Cart()
        const cartItems = cart.getAllCartItemFromLocal().items;
        if (cart.isEmpty()) {
            this.empty()
            return
        }
        this.setData({
            cartItems
        })
        this.noEmpty()

    },
    empty() {
        this.setData({
            isEmpty: true
        })
        //隐藏红点
        wx.hideTabBarRedDot({
            index: 2//红点的位置012
        })
    },
    noEmpty() {
        this.setData({
            isEmpty: false
        })

        wx.showTabBarRedDot({
            index: 2//红点的位置012
        })
    }

})