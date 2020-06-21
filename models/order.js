import {OrderException} from "../core/order-exception";

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
}
export {
    Order
}