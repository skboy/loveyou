
import {SkuCode} from "./sku-code";
import {CellStatus} from "../../core/enum";
import {SkuPending} from "./sku-pending";
import {Cell} from "./cell";
import {Joiner} from "../../utils/joiner";

class Judger {

    fenceGroup
    pathDict = []
    skuPending

    //沟通类
    //本职类

    constructor(fenceGroup) {
        this.fenceGroup = fenceGroup
        //初始化字典
        this._initPathDict()
        this._initSkuPending()
    }

    isSkuIntact() {
        return this.skuPending.isIntact()
    }

    getCurrentValues() {
        return this.skuPending.getCurrentSpecValues()
    }

    getMissingKeys() {
        const missingKeysIndex = this.skuPending.getMissingSpecKeysIndex()
        return missingKeysIndex.map(i => {
            return this.fenceGroup.fences[i].title
        })
    }

    _initSkuPending() {
        const specsLength = this.fenceGroup.fences.length
        this.skuPending = new SkuPending(specsLength)
        const defaultSku = this.fenceGroup.getDefaultSku()
        if (!defaultSku) {
            return
        }
        this.skuPending.init(defaultSku)
        this._initSelectedCell()
        this.judge(null, null, null, true)
    }

    _initSelectedCell() {
        this.skuPending.pending.forEach(cell => {
            this.fenceGroup.setCellStatusById(cell.id, CellStatus.SELECTED)
        })
    }

    //初始化可选路径字典
    _initPathDict() {
        this.fenceGroup.spu.sku_list.forEach(s => {
            const skuCode = new SkuCode(s.code)
            this.pathDict = this.pathDict.concat(skuCode.totalSegments)
        })
        /** this.pathDict
           ["1-45", "3-9", "4-14", "1-45#3-9", "1-45#4-14", "3-9#4-14",
            "1-45#3-9#4-14", "1-42", "3-10", "4-15", "1-42#3-10",
            "1-42#4-15", "3-10#4-15", "1-42#3-10#4-15", "1-42", "3-11",
            "4-16", "1-42#3-11", "1-42#4-16", "3-11#4-16", "1-42#3-11#4-16",
            "1-44", "3-9", "4-14", "1-44#3-9", "1-44#4-14", "3-9#4-14", "1-44#3-9#4-14"
         ]
         */
    }

    //改变cell是状态
    judge(cell, x, y, isInit = false) {
        if (!isInit) {
            this._changeCurrentCellStatus(cell, x, y)
        }

        this.fenceGroup.eachCell((cell, x, y) => {
            //查找潜在路径
            const path = this._findPotentialPath(cell, x, y)
            console.log(path)
            if (!path) {
                return
            }
            const isIn = this._isInDict(path)
            if (isIn) {
                this.fenceGroup.setCelStatusByXY(x, y, CellStatus.WAITING)
            } else {
                this.fenceGroup.setCelStatusByXY(x, y, CellStatus.FORBIDDEN)
            }
        })
    }

    getDeterminateSku() {
        const code = this.skuPending.getSkuCode()
        const sku = this.fenceGroup.getSku(code)
        return sku
    }


    _isInDict(path) {
        return this.pathDict.includes(path)
    }

    //查找潜在路径
    _findPotentialPath(cell, x, y) {
        const joiner = new Joiner('#')

        for (let i = 0; i < this.fenceGroup.fences.length; i++) {
            const selected = this.skuPending.findSelectedCellByX(i)
            /**
             * 1.选中一个时
             * 比如选中青芒色
             * 一开始 颜色 这一行
             * 金属灰 没被选中 1-45
             * 青芒色 被选中 返回 undefined
             * 金属灰 没被选中 1-44
             * 到第二行 第三行全部拼接上去
             *
             */
            if (x === i) {
                // 当前行
                // cell id 1-42
                if (this.skuPending.isSelected(cell, x)) {
                    return
                }
                const cellCode = this._getCellCode(cell.spec)
                joiner.join(cellCode)
            } else {
                // 其他行
                if (selected) { //
                    //selected cell path
                    // 3-56
                    const selectedCellCode = this._getCellCode(selected.spec)
                    joiner.join(selectedCellCode)
                }
            }
        }
        return joiner.getStr()
    }


    _getCellCode(spec) {
        return spec.key_id + '-' + spec.value_id
    }

    //改变选中cell的状态
    _changeCurrentCellStatus(cell, x, y) {
        if (cell.status === CellStatus.WAITING) {
            //更新fenceGroup下面cell的状态 直接更新cell是没用的
            this.fenceGroup.setCelStatusByXY(x, y, CellStatus.SELECTED)
            this.skuPending.insertCell(cell, x)
        }
        if (cell.status === CellStatus.SELECTED) {
            this.fenceGroup.setCelStatusByXY(x, y, CellStatus.WAITING)
            this.skuPending.removeCell(x)
        }
    }

}

export {
    Judger
}