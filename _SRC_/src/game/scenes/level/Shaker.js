import { Container } from "pixi.js";
import { tickerAdd, tickerRemove } from "../../../app/application";
import { EventHub, events } from "../../../app/events";

const MAX_OFFSET = 20
const DECAY = 0.012 // угасание

export default class Shaker extends Container {
    constructor() {
        super()

        this.powerX = 0
        this.powerY = 0

        this.fullAmplitudeContainer = new Container()
        this.halfAmplitudeContainer = new Container()
        this.addChild(this.halfAmplitudeContainer, this.fullAmplitudeContainer)

        EventHub.on( events.shakeScreen, this.addPower, this )
    }

    addPower(shakingPower) { // {x, y} 
        if (this.powerX < 1.5 && this.powerY < 1.5) tickerAdd(this)

        this.powerX = Math.min(shakingPower.x, MAX_OFFSET)
        this.powerY = Math.min(shakingPower.y, MAX_OFFSET)
    }

    screenResize(screenData) {
        const safeScreenData = {
            width: screenData.width + MAX_OFFSET,
            height: screenData.height + MAX_OFFSET,
            centerX: (screenData.width + MAX_OFFSET) * 0.5,
            centerY: (screenData.height + MAX_OFFSET) * 0.5,
            isLandscape: screenData.isLandscape
        }

        this.halfAmplitudeContainer.children.forEach( c => c.screenResize(safeScreenData) )
        this.fullAmplitudeContainer.children.forEach( c => c.screenResize(safeScreenData) )
    }

    tick(delta) {
        if (this.powerX < 1.5 && this.powerY < 1.5) {
            this.halfAmplitudeContainer.x = 0
            this.halfAmplitudeContainer.y = 0

            this.fullAmplitudeContainer.x = 0
            this.fullAmplitudeContainer.y = 0

            this.powerX = 0
            this.powerY = 0

            tickerRemove(this)
            return
        }

        this.fullAmplitudeContainer.x = (Math.random() - 0.5) * this.powerX
        this.fullAmplitudeContainer.y = (Math.random() - 0.5) * this.powerY

        this.halfAmplitudeContainer.x = this.fullAmplitudeContainer.x * 0.5
        this.halfAmplitudeContainer.y = this.fullAmplitudeContainer.y * 0.5

        const decay = DECAY * delta
        this.powerX = Math.max(0, this.powerX - decay)
        this.powerY = Math.max(0, this.powerY - decay)
    }

    kill() {
        EventHub.off( events.shakeScreen, this.addPower, this )
    }
}