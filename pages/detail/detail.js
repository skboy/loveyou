import {Spu} from "../../models/spu";
import {ShoppingWay} from "../../core/enum";
import {SaleExplain} from "../../models/sale-explain";
import {getSystemSize, getWindowHeightRpx} from "../../utils/system";
import {px2rpx} from "../../miniprogram_npm/lin-ui/utils/util";
import {Cart} from "../../models/cart";
import {CartItem} from "../../models/cart-item";

Page({

    data: {
        showRealm:false,
        cartItemCount:0,
        explain:Object,
        h:Number
    },

    onLoad: async function (options) {
        const pid = options.pid
        const spu = await Spu.getDetail(pid)
       // const explain=await SaleExplain.getFixed()
        const windowHeight =await getWindowHeightRpx()
        const h= windowHeight - 100
        this.setData({
            spu,
        //    explain,
            h:h
        })
        this.updateCartItemCount()

    },

    onAddToCart(event) {
        this.setData({
            showRealm:true,
            orderWay:ShoppingWay.CART
        })
    },

    onBuy(event) {
        this.setData({
            showRealm:true,
            orderWay:ShoppingWay.BUY
        })
    },

    onGotoHome(event) {
        wx.switchTab({
            url:'/pages/home/home'
        })
    },

    onGotoCart(event) {
        wx.switchTab({
            url:'/pages/cart/cart'
        })
    },

    onSpecChange(event) {
        this.setData({
            specs:event.detail
        })
    },

    onShopping(event){
        const chosenSku= event.detail.sku
        const skuCount = event.detail.skuCount
        if(event.detail.orderWay===ShoppingWay.CART){
            const cart = new Cart()
            const cartItem =new CartItem(chosenSku,skuCount)
            const isAdd= cart.isBeyondStock(cartItem)
            if(!isAdd){
                const oldItem=cart.findEqualItem(chosenSku.id)
                wx.showToast({
                    icon: "none",
                    duration: 3000,
                    title: `购物车已存在${oldItem.count}件商品,库存不足`
                })
                return
            }
            //这里没判断购物车里这个sku的数量
            cart.addItem(cartItem)
            this.updateCartItemCount()
        }
    },
    updateCartItemCount(){
        const cart =new Cart();
        this.setData({
            cartItemCount:cart.getCartItemCount(),
            showRealm:false
        })
    },
    onReady: function () {

    },


    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {

    }
})