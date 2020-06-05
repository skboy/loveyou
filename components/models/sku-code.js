
import {combination} from "../../utils/util";

class SkuCode {

    code
    spuId
    totalSegments = []

    constructor(code) {
        this.code = code
        this._splitToSegments()
    }

    //可选规格路径
    _splitToSegments() {
        // 2$1-44#3-9#4-14

        const spuAndSpec = this.code.split('$')
        this.spuId = spuAndSpec[0]

        const specCodeArray = spuAndSpec[1].split('#')
        const length = specCodeArray.length
        for (let i = 1; i <= length; i++) {
            const segments = combination(specCodeArray, i)
            const newSegments = segments.map(segs=>{
                return segs.join('#')
            })
            this.totalSegments = this.totalSegments.concat(newSegments)
        }
        /** totalSegments
             0: "1-45"
             1: "3-9"
             2: "4-14"
             3: "1-45#3-9"
             4: "1-45#4-14"
             5: "3-9#4-14"
             6: "1-45#3-9#4-14"
         */
        // 尽量少写显式的for循环
        // for for
        // 类、函数

    }
}

export {
    SkuCode
}