import {format} from "../miniprogram_npm/lin-ui/common/async-validator/util";
import {Sku} from "./sku";

class Cart {
    static SKU_MIN_COUNT = 1
    static SKU_MAX_COUNT = 999
    // sku 种类 拓展 可以从服务器获取
    static CART_ITEM_MAX_COUNT = 77
    static STORAGE_KEY = 'cart'

    _cartData = null;

    constructor() {
        if (typeof Cart.instance == 'object') {
            return Cart.instance
        }
        Cart.instance = this
        return this
    }

    getAllCartItemFromLocal() {
        return this._getCartData()
    }
    //同步服务器数据
    async getAllSkuFromServer() {
        const cartData = this._getCartData()
        if (cartData.items.length === 0) {
            return null
        }
        const skuIds = this.getSkuIds()
        const serverData = await Sku.getSkusByIds(skuIds)
        this._refreshByServerData(serverData)
        this._refreshStorage()
        return this._getCartData()
    }

    getSkuCountBySkuId(skuId) {
        const cartData = this._getCartData()
        const item = cartData.items.find(item => item.skuId === skuId)
        if (!item) {
            console.error('在订单里寻找CartItem时不应当出现找不到的情况')
        }
        return item.count
    }

    getSkuIds(){
        const cartData=this._getCartData()
        if(cartData.items.length===0){
            return []
        }
        return cartData.items.map(item=> item.skuId)
    }
    //获取已经勾选的cartItem
    getCheckedItem(){
        const cartItems =this._getCartData().items
        const checkedCartItems=[]
        cartItems.forEach(item=>{
            if (item.checked){
                checkedCartItems.push(item)
            }
        })
        return checkedCartItems

    }
    //获取已经勾选的skuId
    getCheckedSkuIds() {
        const cartData = this._getCartData()
        if (cartData.items.length === 0) {
            return []
        }
        const skuIds = []
        cartData.items.forEach(item => {
            if (item.checked) {
                skuIds.push(item.sku.id)
            }
        })
        return skuIds
    }
    //移出购物车
    removeCheckedItems() {
        const cartData = this._getCartData()
        for (let i = 0; i < cartData.items.length; i++) {
            if (cartData.items[i].checked) {
                cartData.items.splice(i, 1)
            }
        }
        this._refreshStorage()
    }

    //改变购物车勾选状态
    checkItem(skuId) {
        const oldItem = this.findEqualItem(skuId)
        oldItem.checked = !oldItem.checked
        this._refreshStorage()
    }
    //判断是否全选
    isAllCheck() {
        let allChecked = true
        const cartItems = this._getCartData().items
        for (let item of cartItems) {
            if (!item.checked) {
                allChecked = false
                break
            }
        }
        return allChecked
    }

    checkAll(checked){
        const cartData=this._getCartData()
        cartData.items.forEach(item=>{
            item.checked=checked
        })
        this._refreshStorage()
    }
    //胖多是否售罄
    static isSoldOut(item) {
        return item.sku.stock === 0

    }

    //检查购物车数量加上新加的数量是否超过库存
    isBeyondStock(cartItem){
        const oldItem = this.findEqualItem(cartItem.skuId)
        if(!oldItem){
            return true
        }
        let totalCount=oldItem.count+cartItem.count
        if (totalCount>cartItem.sku.stock){
            return false
        }else{
            return true
        }

    }
    //判断是否下架
    static isOnline(item) {
        return item.sku.online

    }

    isEmpty() {
        const cartData = this._getCartData()
        return cartData.items.length === 0;
    }

    //获取购物车数量
    getCartItemCount() {
        return this._getCartData().items.length
    }

    //添加进购物车
    addItem(newItem) {

        //检查是否超出购物车sku种类最大值
        if (this.beyondMaxCartItemCount()) {
            throw new Error('超过购物车最大数量')
        }
        //push进去
        this._pushItem(newItem)
        //刷新缓存
        this._refreshStorage()
    }

    //刷新缓存
    _refreshStorage() {
        wx.setStorageSync(Cart.STORAGE_KEY, this._cartData)
    }

    //把item push进去
    _pushItem(newItem) {
        //从缓存中获取items
        const cartData = this._getCartData()
        //查询缓存里是否存在这个item
        const oldItem = this.findEqualItem(newItem.skuId)
        if (!oldItem) {
            //unshift插入到数组第一个 push是插入到末尾
            cartData.items.unshift(newItem)
        } else {
            //item数量累加
            this.combineItems(oldItem, newItem)
        }
    }

    //把item移除购物车
    removeItem(skuId) {
        //查询这个skuId对应item数组的下标
        const oldItemIndex = this._findEqualItemIndex(skuId)
        //从缓存中获取items
        const cartData = this._getCartData()
        //splice删除数组中的元素
        cartData.items.splice(oldItemIndex, 1)
        //刷新缓存
        this._refreshStorage()
    }
    //更新服务器数据
    _refreshByServerData(serverData){
        const cartData = this._getCartData()
        cartData.items.forEach(item => {
            this._setLatestCartItem(item, serverData)
        })
    }
    _setLatestCartItem(item, serverData) {
        //判断下架用的
        let removed = true
        for (let sku of serverData) {
            if (sku.id === item.skuId) {
                removed = false
                item.sku = sku
                break
            }
        }
        if (removed) {
            item.sku.online = false
        }
    }
    //更新item的数量
    replaceItemCount(skuId, newCount) {
        const oldItem = this.findEqualItem(skuId)
        if (!oldItem) {
            console.error('异常情况，更新CartItem中的数量不应当找不到相应数据')
            return
        }
        if (newCount < 1) {
            console.error('异常情况，CartItem的Count不可能小于1')
            return
        }
        oldItem.count = newCount
        if (oldItem.count >= Cart.SKU_MAX_COUNT) {
            oldItem.count = Cart.SKU_MAX_COUNT
        }
        this._refreshStorage()
    }

    //查询缓存里是否存在这个item
    findEqualItem(skuId) {
        let oldItem = null
        //从缓存中获取items
        const items = this._getCartData().items
        for (let i = 0; i < items.length; i++) {
            //判断skuId和items[i]的skuId是否相等
            if (this._isEqualItem(items[i], skuId)) {
                oldItem = items[i]
                break
            }
        }
        return oldItem

    }



    //判断skuId和oldItem的skuId是否相等
    _isEqualItem(oldItem, skuId) {
        return oldItem.skuId === skuId
    }

    //寻找这个skuId在items数组的里 下标
    _findEqualItemIndex(skuId) {
        //从缓存中获取items
        const carData = this._getCartData()
        return carData.items.findIndex(item => {
            return item.skuId == skuId
        })
    }

    //item的count累加
    combineItems(oldItem, newItem) {
        this._plusCount(oldItem, newItem.count)
    }

    _plusCount(item, count) {

        item.count += count
        if (item.count >= Cart.SKU_MAX_COUNT) {
            item.count = Cart.SKU_MAX_COUNT
        }
    }

    //从缓存中获取items
    _getCartData() {

        if (this._cartData !== null) {
            return this._cartData
        }
        let cartData = wx.getStorageSync(Cart.STORAGE_KEY)
        if (!cartData) {
            cartData = this._initCartDataStorage()
        }
        this._cartData = cartData
        return cartData
    }

    //初始化cartData
    _initCartDataStorage() {
        const cartData = {
            items: []
        }
        wx.setStorageSync(Cart.STORAGE_KEY, cartData)
        return cartData
    }

    beyondMaxCartItemCount() {
        const cartData = this._getCartData()
        return cartData.items.length >= Cart.CART_ITEM_MAX_COUNT
    }

}

export {
    Cart
}