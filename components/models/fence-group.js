
import {Matrix} from "./matrix";
import {Fence} from "./fence";


class FenceGroup {
    spu
    skuList = []
    fences = []

    constructor(spu) {
        this.spu = spu
        this.skuList = spu.sku_list
    }
    initFences() {
        const matrix = this._createMatrix(this.skuList)
        /*matrix skuList的specs 提取出来
        *   0: Array(3)
                0: {key_id: 1, key: "颜色", value_id: 45, value: "金属灰"}
                1: {key_id: 3, key: "图案", value_id: 9, value: "七龙珠"}
                2: {key_id: 4, key: "尺码", value_id: 14, value: "小号 S"}
            1: Array(3)
                0: {key_id: 1, key: "颜色", value_id: 42, value: "青芒色"}
                1: {key_id: 3, key: "图案", value_id: 10, value: "灌篮高手"}
                2: {key_id: 4, key: "尺码", value_id: 15, value: "中号 M"}
            2: Array(3)
                0: {key_id: 1, key: "颜色", value_id: 42, value: "青芒色"}
                1: {key_id: 3, key: "图案", value_id: 11, value: "圣斗士"}
                2: {key_id: 4, key: "尺码", value_id: 16, value: "大号  L"}
            3: Array(3)
                0: {key_id: 1, key: "颜色", value_id: 44, value: "橘黄色"}
                1: {key_id: 3, key: "图案", value_id: 9, value: "七龙珠"}
                2: {key_id: 4, key: "尺码", value_id: 14, value: "小号 S"}
        * */
        const fences = []

        const AT = matrix.transpose()

        /*AT 矩阵转置
        *   0: Array(4)
                0: {key_id: 1, key: "颜色", value_id: 45, value: "金属灰"}
                1: {key_id: 1, key: "颜色", value_id: 42, value: "青芒色"}
                2: {key_id: 1, key: "颜色", value_id: 42, value: "青芒色"}
                3: {key_id: 1, key: "颜色", value_id: 44, value: "橘黄色"}
            1: Array(4)
                0: {key_id: 3, key: "图案", value_id: 9, value: "七龙珠"}
                1: {key_id: 3, key: "图案", value_id: 10, value: "灌篮高手"}
                2: {key_id: 3, key: "图案", value_id: 11, value: "圣斗士"}
                3: {key_id: 3, key: "图案", value_id: 9, value: "七龙珠"}
            2: Array(4)
                0: {key_id: 4, key: "尺码", value_id: 14, value: "小号 S"}
                1: {key_id: 4, key: "尺码", value_id: 15, value: "中号 M"}
                2: {key_id: 4, key: "尺码", value_id: 16, value: "大号  L"}
                3: {key_id: 4, key: "尺码", value_id: 14, value: "小号 S"}
        * */
        AT.forEach(r => {
            //Fence 例如 : 颜色 : 金属灰 青芒色 橘黄色
            const fence = new Fence(r)
            fence.init()
            if (this._hasSketchFence() && this._isSketchFence(fence.id)) {
                fence.setFenceSketch(this.skuList)
            }
            fences.push(fence)
        })
        this.fences = fences
    }
    getDefaultSku() {
        const defaultSkuId = this.spu.default_sku_id
        if (!defaultSkuId) {
            return
        }
        return this.skuList.find(s => s.id === defaultSkuId)
    }

    getSku(skuCode) {
        const fullSkuCode = this.spu.id + '$' + skuCode
        const sku = this.spu.sku_list.find(s => s.code === fullSkuCode)
        return sku ? sku : null
    }

    setCellStatusById(cellId, status) {
        this.eachCell((cell) => {
            if (cell.id === cellId) {
                cell.status = status
            }
        })
    }

    setCelStatusByXY(x, y, status) {
        this.fences[x].cells[y].status = status
    }



    _hasSketchFence() {
        return this.spu.sketch_spec_id ? true : false
    }

    _isSketchFence(fenceId) {
        return this.spu.sketch_spec_id === fenceId ? true : false
    }


    //遍历cell
    eachCell(cb) {
        for (let i = 0; i < this.fences.length; i++) {
            for (let j = 0; j < this.fences[i].cells.length; j++) {
                const cell = this.fences[i].cells[j]
                cb(cell, i, j)
            }
        }
    }

    _createMatrix(skuList) {
        const m = []
        skuList.forEach(sku => {
            m.push(sku.specs)
        })
        return new Matrix(m)
    }

    initFences1() {
        const matrix = this._createMatrix(this.skuList)
        const fences = []
        let currentJ = -1;
        matrix.each((element, i, j) => {
            if (currentJ !== j) {
                // 开启一个新列，需要创建一个新的Fence
                currentJ = j
                fences[currentJ] = this._createFence(element)
                // createFence
            }
            fences[currentJ].pushValueTitle(element.value)
        })
    }


    _createFence(element) {
        const fence = new Fence()
        return fence
    }

    // 1. 数学函数库 JS 体积 mathjs 1MB
    // 2. 不用 借助矩阵思维
}

export {
    FenceGroup
}