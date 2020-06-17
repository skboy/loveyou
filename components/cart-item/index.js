// components/cart-item/index.js
import {parseSpecValue} from "../../utils/sku";
import {Cart} from "../../models/cart";

Component({
    /**
     * 组件的属性列表
     */
    properties: {
        cartItem: Object

    },

    /**
     * 组件的初始数据
     */
    data: {
        soldOut: Boolean,
        discount: Boolean,
        specStr: String,
        online: Boolean,
        stock: Cart.SKU_MAX_COUNT,
        skuCount: 1
    },

    observers: {
        cartItem: function (cartItem) {
            if (!cartItem) {
                return
            }
            const specStr = parseSpecValue(cartItem.sku.specs)
            const discount = cartItem.sku.discount_price ? true : false
            const soldOut = Cart.isSoldOut(cartItem)
            const online = Cart.isOnline(cartItem)
            this.setData({
                specStr,
                discount,
                soldOut,
                online,
                stock: cartItem.sku.stock,
                skuCount: cartItem.count
            })


        }
    },
    /**
     * 组件的方法列表
     */
    methods: {
         onSelectCount(event) {
           let newCount = event.detail.count
           console.log(newCount)
           let cart;
           cart.replaceItemCount(this.properties.cartItem.skuId, newCount)
           this.triggerEvent("countfloat")
         }
    }
})
