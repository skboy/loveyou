// pages/cart/cart.js
import {Cart} from "../../models/cart";
import {Caculator} from "../../models/caculator";

const cart = new Cart()
Page({

    /**
     * 页面的初始数据
     */
    data: {
        cartItems: [],
        isEmpty: false,
        allChecked: false,
        totalPrice:0,
        totalSkuCount:0
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
        //计算购物车价格
        this.refreshCartData()

    },
    //计算购物车价格
    refreshCartData(){
        const cartItems=cart.getCheckedItem()
        const calculator =new Caculator(cartItems)
        calculator.calc()
        this.setCalcData(calculator)
    },

    //数据绑定购物车价格
    setCalcData(calculator){
        const totalPrice=calculator.getTotalPrice()
        const totalSkuCount= calculator.getTotalSkuCount()
        this.setData({
            totalPrice,
            totalSkuCount
        })
    },
    //判断是否全选
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