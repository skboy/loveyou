// pages/order/order.js
import {Cart} from "../../models/cart";
import {OrderItem} from "../../models/order-item";
import {CouponOperate, ShoppingWay} from "../../core/enum";
import {Order} from "../../models/order";
import {Sku} from "../../models/sku";
import {Coupon} from "../../models/coupon";
import {CouponBO} from "../../models/coupon-bo";

const cart = new Cart()
Page({

    /**
     * 页面的初始数据
     */
    data: {
      finalTotalPrice: 0,
      totalPrice: 0,
      discountMoney: 0,
      submitBtnDisable: false,

      address: null,

      currentCouponId: null,
      order: null,
      isOk: true,

      orderFail: false,
      orderFailMsg: '',

      shoppingWay: ShoppingWay.BUY
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: async function (options) {
      let orderItems;
      let localItemCount
      const shoppingWay = options.way
      this.data.shoppingWay = shoppingWay
      if (shoppingWay === ShoppingWay.BUY) {
        const skuId = options.sku_id
        const count = options.count
        localItemCount = 1
      } else {
        const skuIds = cart.getCheckedSkuIds()
        // 同步最新的SKU数据
        orderItems = await this.getCartOrderItems(skuIds)
        localItemCount = skuIds.length
      }
      const order = new Order(orderItems, localItemCount)
      this.data.order = order
      try {
        order.checkOrderIsOk()
      } catch (e) {
        console.error(e)
        this.setData({
          isOk: false
        })
        return
      }
        const coupons = await Coupon.getMySelfWithCategory()
        const couponBOList = this.packageCouponBOList(coupons, order)
        this.setData({
            orderItems,
            couponBOList,
            totalPrice: order.getTotalPrice(),
            finalTotalPrice: order.getTotalPrice()
        })
    },
    // 同步最新的SKU数据
    async getCartOrderItems(skuIds) {
      // 同步最新的SKU数据
      const skus = await Sku.getSkusByIds(skuIds)
      const orderItems = this.packageOrderItems(skus)
      return orderItems
    },
    onChooseCoupon(event) {
        const couponObj = event.detail.coupon
        const couponOperate = event.detail.operate

        if (couponOperate === CouponOperate.PICK) {
            this.data.currentCouponId = couponObj.id
            const priceObj = CouponBO.getFinalPrice(this.data.order.getTotalPrice(), couponObj)
            this.setData({
                finalTotalPrice: priceObj.finalPrice,
                discountMoney: priceObj.discountMoney
            })
        } else {
            this.data.currentCouponId = null
            this.setData({
                finalTotalPrice: this.data.order.getTotalPrice(),
                discountMoney: 0
            })
        }

    },
    //打包orderItem
    packageOrderItems(skus) {
      return skus.map(sku => {
        const count = cart.getSkuCountBySkuId(sku.id)
        return new OrderItem(sku, count)
      })

    },

    packageCouponBOList(coupons, order) {
        return coupons.map(coupon => {
            const couponBO = new CouponBO(coupon)
            couponBO.meetCondition(order)
            return couponBO
        })
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function () {

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {

    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function () {

    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function () {

    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function () {

    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {

    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {

    }
})