import {OrderException} from "../core/order-exception";
import {accAdd} from "../utils/number";
import {Http} from "../utils/http";
import {OrderStatus} from "../core/enum";
import {Paging} from "../utils/paging";

class Order{

    orderItems
    localItemCount
    constructor(orderItems,  localItemCount) {
        this.orderItems=orderItems
        this.localItemCount=  localItemCount
    }
    checkOrderIsOk(){
        this.orderItems.forEach(item=>{
            item.isOk()
        })
        this._orderIsOk()
    }
    _orderIsOk() {
        //校验是否空订单
        this._emptyOrder()
        //校验和服务器商品数量是否一致
        this._containNotOnSaleItem()
    }
    //校验是否空订单
    _emptyOrder() {
        if (this.orderItems.length === 0) {
            throw new OrderException('订单中没有任何商品', OrderExceptionType.EMPTY)
        }
    }
    //校验和服务器商品数量是否一致
    _containNotOnSaleItem() {
        if (this.orderItems.length !== this.localItemCount) {
            throw new OrderException('服务器返回订单商品数量与实际不相符，可能是有商品已下架', OrderExceptionType.NOT_ON_SALE)
        }
    }
    getTotalPrice() {
        return this.orderItems.reduce((pre, item) => {
            const price = accAdd(pre, item.finalPrice)
            return price
        }, 0)
    }

    getTotalPriceByCategoryIdList(categoryIdList) {
        if (categoryIdList.length === 0) {
            return 0
        }
        // 衣服、鞋子、书籍
        //prev 表示上一次调用回调时的返回值，或者初始值 init;
        // cur 表示当前正在处理的数组元素；
        const price = categoryIdList.reduce((pre, cur) => {
            const eachPrice = this.getTotalPriceEachCategory(cur)
            return accAdd(pre, eachPrice)
        }, 0);
        return price
    }
    getTotalPriceEachCategory(categoryId) {
        const price = this.orderItems.reduce((pre, orderItem) => {
            const itemCategoryId = this._isItemInCategories(orderItem, categoryId)
            if (itemCategoryId) {
                return accAdd(pre, orderItem.finalPrice)
            }
            return pre
        }, 0)
        return price
    }
    _isItemInCategories(orderItem, categoryId) {
        if (orderItem.categoryId === categoryId) {
            return true
        }
        if (orderItem.rootCategoryId === categoryId) {
            return true
        }
        return false
    }
    getOrderSkuInfoList() {
        return this.orderItems.map(item => {
            return {
                id: item.skuId,
                count: item.count
            }
        })
    }
    static async postOrderToServer(orderPost) {
        return await Http.request({
            url: 'order',
            method: 'POST',
            data: orderPost,
            throwError: true
        })
    }
    static async getUnpaidCount() {
        const orderPage = await Http.request({
            url: `order/status/unpaid`,
            data:{
                start:0,
                count:1
            }
        })
        return orderPage.total
    }
    static async getPaidCount() {
        const orderPage = await Http.request({
            url: `order/by/status/${OrderStatus.PAID}`,
            data:{
                start:0,
                count:1
            }
        })
        return orderPage.total
    }
    static async getDeliveredCount() {
        const orderPage = await Http.request({
            url: `order/by/status/${OrderStatus.DELIVERED}`,
            data: {
                start:0,
                count:1
            }
        })
        return orderPage.total
    }
    static async getDetail(oid) {
        return Http.request({
            url: `order/detail/${oid}`
        })
    }
    static getPagingByStatus(status) {
        return new Paging({
            url:`order/by/status/${status}`
        })
        // return Http.request({
        // })
    }

    static getPagingUnpaid() {
        return new Paging({
            url:`order/status/unpaid`
        })
    }

}
export {
    Order
}