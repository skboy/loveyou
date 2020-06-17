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

    static isSoldOut(item) {
        return item.sku.stock === 0

    }
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