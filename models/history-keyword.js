class HistoryKeyword {
    static MAX_ITEM_COUNT = 10
    static KEY = 'keywords'
    keywords = []

    constructor() {
        if(typeof HistoryKeyword.instance === 'object'){
            return HistoryKeyword.instance
        }
        HistoryKeyword.instance = this
        this.keywords = this._getLocalKeywords()
        return this
    }
    save(keyword) {
        this.keywords = this.keywords.filter(k => {
            return k !== keyword
        })
       /* if (item.length !== 0) {
            return
        }*/
        if (this.keywords.length >= HistoryKeyword.MAX_ITEM_COUNT) {
            this.keywords.pop()
        }
        //unshift插入到数组第一个 push是插入到末尾
        this.keywords.unshift(keyword)
        this._refreshLocal()
    }

    get() {

        return this.keywords
    }

    clear() {
        this.keywords = []
        this._refreshLocal()
    }

    _refreshLocal() {
        wx.setStorageSync(HistoryKeyword.KEY, this.keywords)
    }

    _getLocalKeywords() {
        const keywords = wx.getStorageSync(HistoryKeyword.KEY)
        if (!keywords) {
            wx.setStorageSync(HistoryKeyword.KEY, [])
            return []
        }
        return keywords
    }
}

export {
    HistoryKeyword
}