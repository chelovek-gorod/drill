import { Container, Sprite } from "pixi.js";
import { tickerAdd } from "../../../app/application";
import { atlases, sounds } from "../../../app/assets";
import { EventHub, events, layerSetDamage, shakeScreen } from "../../../app/events";
import { soundLoopPlay, soundLoopStop, soundPlay } from "../../../app/sound";
import { createEnum, moveToTarget } from "../../../utils/functions";
import Smoke from "../../effects/Smoke";
import { TYPE } from "./layer";
import Stone from "./Stone";

const STATE = createEnum(['DRILL', 'GUN', 'FLY', 'IDLE', 'LANDING'])

const DRILLING_TIME = 600

export default class Bot extends Container {
    constructor(stonesType, power = 0.06) {
        super()

        this.power = power

        this.state = STATE.IDLE

        this.stonesType = stonesType

        this.body = new Sprite(atlases.bot.textures.body)
        this.body.anchor.set(0.5)

        this.lamp = new Sprite(atlases.bot.textures.lamp)
        this.lamp.anchor.set(0.5)
        this.lamp.scale.set(0.4)
        this.lamp.position.set(10, -15)
        this.lamp.alpha = 0.4
        this.lampTime = 0
        this.lampSpeed = 0.006
        this.lampAmp = 0.3
        this.lampMid = 1 - this.lampAmp

        this.left = new Container()
        this.left_normal = new Sprite(atlases.bot.textures.left)
        this.left_normal.anchor.set(0.65, 0.22)
        this.left_red = new Sprite(atlases.bot.textures.left_red)
        this.left_red.anchor.set(0.65, 0.22)
        this.left_red.alpha = 0
        this.left.addChild(this.left_normal, this.left_red)
        this.left.position.set(-70, -55)
        this.left.startX = this.left.x
        this.left.startY = this.left.y

        this.right = new Container()
        this.right_normal = new Sprite(atlases.bot.textures.right)
        this.right_normal.anchor.set(0.23, 0.23)
        this.right_red = new Sprite(atlases.bot.textures.right_red)
        this.right_red.anchor.set(0.23, 0.23)
        this.right_red.alpha = 0
        this.right.addChild(this.right_normal, this.right_red)
        this.right.position.set(50, -65)
        this.right.startX =  this.right.x
        this.right.startY =  this.right.y

        this.head = new Container()
        this.head_head = new Sprite(atlases.bot.textures.head)
        this.head_head.anchor.set(0.5)
        this.head_eye = new Sprite(atlases.bot.textures.eye)
        this.head_eye.startPoint = {x: this.head_eye.x, y: this.head_eye.y}
        this.head_eye.targetPoint = null
        this.head_eye.moveOffset = 12
        this.head_eye.moveSpeed = 0.03
        this.head_eye.moveTimeout = 0
        this.head_eye.anchor.set(0.5)
        this.head.addChild(this.head_head, this.head_eye)
        this.head.position.set(-5, -75)
        this.head.startY = this.head.y

        this.idleTime = 0
        this.idleSpeedY = 0.003
        this.idleOffsetGunsY = 6
        this.idleOffsetHeadY = 4

        this.drillOffset = 0
        this.drillOffsetMax = 9
        this.drillSpeed = 0.3
        this.drillTimeout = DRILLING_TIME
        this.isDrillIn = true
        this.drillSmokeIsLeft = true
        this.hotSpeed = 0.0012
        this.iceSpeed = 0.0003
        this.isHot = false

        this.landShock = 0
        this.landShockSpeed = 0.06
        this.landShockRecover = 0.03

        this.addChild(this.right, this.body, this.head, this.lamp, this.left)

        this.position.set(0, 50)

        EventHub.on( events.landingOnLayer, this.hitGround, this )

        tickerAdd(this)
    }

    screenResize(screenData) {
        // used nin shacker children !!!
    }

    lookAt(x, y) {
        this.head_eye.targetPoint = {
            x: Math.max(-this.head_eye.moveOffset, Math.min(this.head_eye.moveOffset, x)),
            y: Math.max(-this.head_eye.moveOffset, Math.min(this.head_eye.moveOffset, y))
        }
    }

    setGunsOnStart() {
        this.left.position.set(this.left.startX, this.left.startY)
        this.right.position.set(this.right.startX, this.right.startY)
        this.left.rotation = 0
        this.right.rotation = 0
    }

    startDrill() {
        if (this.state === STATE.DRILL) return

        //soundPlay(sounds.se_drill)

        soundLoopPlay(sounds.se_drill_start, sounds.se_drill_loop, sounds.se_drill_end, 'drill')

        this.setGunsOnStart()

        this.drillTimeout = Infinity
        this.isDrillIn = true
        this.drillOffset = 0
        this.isHot = true

        this.head_eye.position.set(10, 10)
        this.head_eye.scale.set(0.6)

        this.state = STATE.DRILL
    }

    stopDrilling() {
        if (this.state !== STATE.DRILL) return

        this.setGunsOnStart()
        this.state = STATE.IDLE
        this.drillTimeout = 0

        soundLoopStop('drill')
    }

    hitGround() {
        this.landShock = 1
        soundPlay(sounds.se_bot_landing)
    }

    test() {
        if (this.state !== STATE.IDLE) return false

        this.power *= 2
        this.scale.x *= -1

        this.setGunsOnStart()
        this.left.rotation = -Math.PI * 0.25
        this.right.rotation = -Math.PI * 0.15
        this.state = STATE.GUN
        this.lamp.tint = 0xFF0000
        setTimeout( () => {
            this.setGunsOnStart()
            this.state = STATE.IDLE
            this.lamp.tint = null
        }, 2000)

        return true
    }

    idle(delta) {
        this.idleTime += delta * this.idleSpeedY
        const deltaSin = Math.sin(this.idleTime)

        this.left.y = this.left.startY + Math.sin(this.idleTime - 0.3) * this.idleOffsetGunsY
        this.right.y = this.right.startY + Math.sin(this.idleTime + 0.3) * this.idleOffsetGunsY
        this.head.y = this.head.startY + deltaSin * this.idleOffsetHeadY

        this.head_eye.scale.set(0.92 + Math.sin(this.idleTime * 1.2) * 0.02)

        if (this.head_eye.targetPoint) {
            const path = this.head_eye.moveSpeed * delta
            if ( moveToTarget(this.head_eye, this.head_eye.targetPoint, path) ) {
                this.head_eye.targetPoint = null
                this.head_eye.moveTimeout = Math.random() * 1000
            }
        } else {
            this.head_eye.moveTimeout -= delta
            if (this.head_eye.moveTimeout < 0) {
                const angle = Math.random() * (2 * Math.PI)
                const tx = this.head_eye.startPoint.x + this.head_eye.moveOffset * Math.cos(angle)
                const ty = this.head_eye.startPoint.y + this.head_eye.moveOffset * Math.sin(angle)
                this.head_eye.targetPoint = {x: tx, y: ty}
            }
        }
    }

    drilling(delta) {
        let offset = delta * this.drillSpeed
        if (this.isDrillIn) {
            this.left.x = Math.min(this.left.startX + this.drillOffsetMax, this.left.x + offset)
            this.left.y = Math.min(this.left.startY + this.drillOffsetMax, this.left.y + offset)

            this.right.x = Math.min(this.right.startX + this.drillOffsetMax, this.right.x + offset)
            this.right.y = Math.min(this.right.startY + this.drillOffsetMax, this.right.y + offset)

            if (this.left.x === this.left.startX + this.drillOffsetMax) this.isDrillIn = false
        } else {
            this.left.x = Math.max(this.left.startX, this.left.x - offset)
            this.left.y = Math.max(this.left.startY, this.left.y - offset)

            this.right.x = Math.max(this.right.startX, this.right.x - offset)
            this.right.y = Math.max(this.right.startY, this.right.y - offset)

            if (this.left.x === this.left.startX) this.isDrillIn = true
        }

        this.drillSmokeIsLeft = !this.drillSmokeIsLeft
        const offsetX = -50 + Math.random() * 100
        const offsetY = -50 + Math.random() * 100
        const xx = (this.drillSmokeIsLeft ? this.left.x : this.right.x) + 25 + offsetX
        const yy = (this.drillSmokeIsLeft ? this.left.y : this.right.y) + 50 + offsetY
        if (this.drillSmokeIsLeft) this.addChild( new Smoke(xx, yy) )
        else this.addChild( new Smoke(xx, yy) )
        if(Math.random() > 0.7) this.addChild( new Stone(xx, yy, TYPE.stones === this.stonesType) )

        if (this.left_red.alpha < 1) {
            const alpha = Math.min(1, this.left_red.alpha + this.hotSpeed * delta)
            this.left_red.alpha = alpha
            this.right_red.alpha = alpha
        }

        layerSetDamage(this.power)
        shakeScreen({x: 5, y: 5})

        this.drillTimeout -= delta
        if (this.drillTimeout <= 0) this.stopDrilling()
    }

    landing(delta) {
        this.landShock -= delta * this.landShockRecover

        if (this.landShock <= 0) {
            this.body.scale.set(1)
            this.landShock = 0
            this.state = STATE.IDLE
            return
        }
        
        // Сжатие по Y, расширение по X
        this.body.scale.y = 1 + this.landShock * 0.2
        this.body.scale.x = 1 - this.landShock * 0.1
        
        // Голова прыгает
        this.head.y = this.head.startY - this.landShock * 10
    }

    tick(delta) {
        // lamp
        this.lampTime += delta * this.lampSpeed
        const lampValue = this.lampMid + Math.sin(this.lampTime) * this.lampAmp
        this.lamp.scale.set(lampValue)
        this.lamp.alpha = lampValue

        if (this.state === STATE.IDLE) this.idle(delta)
        else if (this.state === STATE.DRILL) this.drilling(delta)
        else if (this.state === STATE.LANDING) this.landing(delta)

        if (this.state !== STATE.DRILL && this.isHot) {
            const alpha = Math.max(0, this.left_red.alpha - this.iceSpeed * delta)
            this.left_red.alpha = alpha
            this.right_red.alpha = alpha
            if (alpha === 0) this.isHot = false
        }
    }

    kill() {
        EventHub.off( events.landingOnLayer, this.hitGround, this )
    }
}