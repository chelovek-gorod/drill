import { Container, TilingSprite } from "pixi.js";
import { tickerAdd, tickerRemove } from "../../../app/application";
import { atlases } from "../../../app/assets";
import { addStones, scrollBg, layerCleared, landingOnLayer, EventHub, events, shakeScreen } from "../../../app/events";
import { createEnum } from "../../../utils/functions";

const SCROLL_SPEED = 0.3
const HEIGHT = 228
const OFFSET_X = 128
const OFFSET_Y = 64
const HEIGHT_IN = 2400
const ALPHA_IN = 300
const TIME_IN = 1200
const SPEED_IN = HEIGHT_IN / TIME_IN
const ALPHA_SPEED = 1 / (ALPHA_IN * SPEED_IN)

const FRAMES = 6 // dmg0 ... dmg5 

export const TYPE = createEnum(['brick', 'stone', 'soil'])

function getHpList(hp) {
    const step = hp / FRAMES
    const list = []
    for(let i = FRAMES - 1; i > 0; i--) list.push(step * i)
    return list
}

export default class Layer extends Container {
    constructor() {
        super()

        this.type = ''
        this.hp = 0
        this.hpMax = 0
        this.hpList = []
        this.isStart = false
        this.visible = false
        this.layerWidth = 6000

        EventHub.on( events.layerSetDamage, this.setDamage, this )
    }

    setUp(type, count, hp) {
        this.isStart = true
        this.alpha = 0
        
        this.type = type
        this.hp = hp
        this.hpMax = hp
        this.hpList = getHpList(hp)

        for(let i = count - 1; i >= 0; i--) {
            const line = new TilingSprite(atlases.ground.textures[ type + '_dmg0' ])
            line.height = HEIGHT
            line.width = this.layerWidth
            line.y = i * OFFSET_Y
            line.tilePosition.x = i * OFFSET_X
            this.addChild(line)
        }

        this.visible = true
        this.y = HEIGHT_IN
        scrollBg({ size: HEIGHT_IN * 0.5, speed: SPEED_IN * 0.5 })
        tickerAdd(this)
    }

    screenResize(screenData) {
        this.x = -screenData.centerX
        this.layerWidth = screenData.width
        for(let i = 0; i < this.children.length; i++) this.children[i].width = screenData.width
    }

    setDamage( power ) {
        if (this.y > 0 || this.hp <= 0) return

        this.hp -= power
        if (this.hp <= 0) return this.killDamage()

        while (this.hp < this.hpList[0]) this.hpList.shift()
        if (this.hpList.length === 0) return this.killDamage()

        const texture = this.type + '_dmg' + (FRAMES - this.hpList.length)
        this.children[ this.children.length - 1 ].texture = atlases.ground.textures[ texture ]
    }

    killDamage() {
        this.children[ this.children.length - 1 ].destroy()
        addStones(this.type)

        if (this.children.length) {
            this.hp = this.hpMax
            this.hpList = getHpList(this.hp)

            this.position.y += OFFSET_Y
            for(let i = 0; i < this.children.length; i++) {
                this.children[i].position.y -= OFFSET_Y
            }
            scrollBg({size: OFFSET_Y * 0.5, speed: SCROLL_SPEED * 0.5})
            tickerAdd(this)

            return
        }

        this.visible = false
        console.log('layerCleared')
        layerCleared()
    }

    tick(delta) {
        if (this.isStart) {
            this.position.y = Math.max(0, this.position.y - SPEED_IN * delta)
            this.alpha = Math.min(1, this.alpha + ALPHA_SPEED * delta)
            if (this.position.y === 0 ) {
                tickerRemove(this)
                this.isStart = false
                shakeScreen({x: 3, y: 12})
                landingOnLayer(this.type)
            }
            return
        }

        this.position.y = Math.max(0, this.position.y - SCROLL_SPEED * delta)
        if (this.position.y === 0 ) {
            shakeScreen({x: 1, y: 6})
            tickerRemove(this)
        }
    }

    kill() {
        EventHub.off( events.layerSetDamage, this.setDamage, this )
    }
}