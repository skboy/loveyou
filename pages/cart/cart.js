// pages/cart/cart.js
import {Cart} from "../../models/cart";

const cart = new Cart()
Page({

    /**
     * 页面的初始数据
     */
    data: {
        cartItems: [],
        isEmpty: false,
        allChecked: false
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

        const cartItems = cart.getAllCartItemFromLocal().items;
        if (cart.isEmpty()) {
            this.empty()
            return
        }
        this.setData({
            cartItems
        })
        //是否为空
        this.noEmpty()
        //是否全选
        this.isAllCheck()

    },
    isAllCheck() {
        const allChecked = cart.isAllCheck()
        console.log(allChecked)
        this.setData({
            allChecked
        })
    },
    onSingleCheck(event){
        this.isAllCheck()
    },
    onDeleteItem(event){
        this.isAllCheck()

    },
    onCheckAll(event){
        console.log(event)
        const checked =event.detail.checked
        cart.checkAll(checked)
        this.setData({
            cartItems:this.data.cartItems
        })
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