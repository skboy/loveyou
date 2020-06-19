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
    async onLoad(options) {
        const cartData = await cart.getAllSkuFromServer()
        if(cartData){
            this.setData({
                cartItems: cartData.items
            })
        }
        //新鲜度
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

    //item数量事件
    onCountFloat(event){
        this.refreshCartData()
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
        this.setData({
            allChecked
        })
    },
    //单选
    onSingleCheck(event){
        this.isAllCheck()
        //计算购物车价格
        this.refreshCartData()
    },
    //单个删除
    onDeleteItem(event){
        this.isAllCheck()
        //计算购物车价格
        this.refreshCartData()
    },
    //全选的勾选
    onCheckAll(event){
        console.log(event)
        const checked =event.detail.checked
        cart.checkAll(checked)
        this.setData({
            cartItems:this.data.cartItems
        })
        //计算购物车价格
        this.refreshCartData()
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