import { Container, Sprite, TilingSprite } from "pixi.js";
import { tickerAdd, tickerRemove } from "../../../app/application";
import { images } from "../../../app/assets";
import { EventHub, events } from "../../../app/events";

const SIZE = 2048

export default class Back extends Container {
    constructor(bgIndex) {
        super()

        this.bg = new TilingSprite(images['bg' + bgIndex])
        this.addChild(this.bg)

        this.scrollSize = 0
        this.scrollSpeed = 1.2

        this.top = new Sprite( images.bg_top )
        this.top.offset = 0
        this.addChild(this.top)

        EventHub.on( events.scrollBg, this.scroll, this )
    }

    screenResize(screenData) {
        this.bg.x = -screenData.centerX
        this.bg.y = - screenData.centerY
        this.bg.width = screenData.width
        this.bg.height = screenData.height

        const scale = screenData.width / SIZE
        this.bg.tileScale.set(scale)

        if (this.top) {
            this.top.scale.set(scale)
            this.top.position.set(this.bg.x, this.bg.y - this.top.offset)
        }
    }

    scroll(data) {
        this.scrollSize = data.size
        this.scrollSpeed = data.speed
        tickerAdd(this)
    }

    tick(delta) {
        const scrollStep = Math.min(this.scrollSize, this.scrollSpeed * delta)
        this.scrollSize -= scrollStep
        this.bg.tilePosition.y -= scrollStep
        if (this.top) {
            this.top.offset += scrollStep
            this.top.y -= this.top.offset

            if (this.top.offset > SIZE * 0.5) {
                this.top.destroy()
                this.top = null
            }
        }

        if (this.scrollSize <= 0) tickerRemove(this)
    }

    kill() {
        EventHub.off( events.scrollBg, this.scroll, this )
    }
}