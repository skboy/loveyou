import {FenceGroup} from "../models/fence-group";
import {Judger} from "../models/judger";
import {Spu} from "../../models/spu";
import {Cell} from "../models/cell";
import {Cart} from "../../models/cart";

Component({
    properties: {
        spu: Object,
        orderWay:String
    },

    data: {
        judger:Object,
        previewImg:String,
        currentSkuCount:Cart.SKU_MIN_COUNT
    },
    // sku 概念必须要有 规格

    observers: {
        'spu': function (spu) {
            if (!spu) {
                return
            }
            if(Spu.isNoSpec(spu)){
                this.processNoSpec(spu)
            }
            else{
                this.processHasSpec(spu)
            }
            this.triggerSpecEvent()
        }
    },

    methods: {
        processNoSpec(spu) {
            this.setData({
                noSpec:true,
                // skuIntact:
            })
            this.bindSkuData(spu.sku_list[0])
            this.setStockStatus(spu.sku_list[0].stock, this.data.currentSkuCount)
        },

        processHasSpec(spu) {

            const fenceGroup = new FenceGroup(spu)
            //先提取规格值
            fenceGroup.initFences()
            const judger = new Judger(fenceGroup)
            this.data.judger = judger
            const defaultSku = fenceGroup.getDefaultSku()
            if(defaultSku){
                this.bindSkuData(defaultSku)
                this.setStockStatus(defaultSku.stock, this.data.currentSkuCount)
            }
            else{
                this.bindSpuData()
            }
            this.bindTipData()
            this.bindFenceGroupData(fenceGroup)
        },

        triggerSpecEvent() {
            const noSpec = Spu.isNoSpec(this.properties.spu)
            if(noSpec){
                this.triggerEvent('specchange',{
                    noSpec
                })
            }
            else{
                this.triggerEvent('specchange',{
                    noSpec:Spu.isNoSpec(this.properties.spu),
                    skuIntact:this.data.judger.isSkuIntact(),
                    currentValues:this.data.judger.getCurrentValues(),
                    missingKeys:this.data.judger.getMissingKeys()
                })
            }
        },

        bindSpuData() {
            const spu = this.properties.spu
            this.setData({
                previewImg:spu.img,
                title:spu.title,
                price:spu.price,
                discountPrice:spu.discount_price,
            })
        },

        bindSkuData(sku) {
            this.setData({
                previewImg:sku.img,
                title:sku.title,
                price:sku.price,
                discountPrice:sku.discount_price,
                stock:sku.stock,

            })
        },

        bindTipData() {
            this.setData({
                skuIntact:this.data.judger.isSkuIntact(),
                currentValues:this.data.judger.getCurrentValues(),
                missingKeys:this.data.judger.getMissingKeys()
            })
        },

        bindFenceGroupData(fenceGroup) {
            this.setData({
                fences:fenceGroup.fences,
            })
        },

        setStockStatus(stock, currentCount) {
            this.setData({
                outStock:this.isOutOfStock(stock, currentCount)
            })
        },

        isOutOfStock(stock, currentCount) {
            return stock < currentCount
        },

        onSelectCount(event) {
            const currentCount = event.detail.count
            this.data.currentSkuCount = currentCount

            if (this.data.noSpec){
                this.setStockStatus(this.data.stock, currentCount)
            }else{
                if(this.data.judger.isSkuIntact()){
                    const sku = this.data.judger.getDeterminateSku()
                    this.setStockStatus(sku.stock, currentCount)
                }
            }

        },

        onCellTap(event) {
            const data = event.detail.cell
            const x = event.detail.x
            const y = event.detail.y

            //重新实例化的cell 状态是waiting 所以需要 cell.status = data.status
            const cell = new Cell(data.spec)
            cell.status = data.status

            const judger = this.data.judger
            //改变cell状态
            judger.judge(cell,x,y)
            //判断是否选择完整的sku
            const skuIntact =judger.isSkuIntact()
            if(skuIntact){
                //获取当前完整的sku 信息
                const currentSku = judger.getDeterminateSku()
                this.bindSkuData(currentSku)
                this.setStockStatus(currentSku.stock,this.data.currentSkuCount)
            }
            this.bindTipData()
            //每次点击cell都要重新渲染数据
            this.bindFenceGroupData(judger.fenceGroup)
            this.triggerSpecEvent()
        }
    }
})
