import { Container, Sprite } from "pixi.js";
import { tickerAdd } from "../../../app/application";
import { atlases, sounds } from "../../../app/assets";
import { addSparks, EventHub, events, layerSetDamage, shakeScreen, botLandingDone } from "../../../app/events";
import { soundLoopPlay, soundLoopStop, soundPlay } from "../../../app/sound";
import { createEnum, getRandom, moveToTarget } from "../../../utils/functions";
import Smoke from "../../effects/Smoke";
import Stone from "./Stone";

const STATE = createEnum(['DRILL', 'GUN', 'FLY', 'IDLE', 'LANDING'])

const DRILLING_TIME = 600

export default class Bot extends Container {
    constructor(power = 0.06) {
        super()

        this.power = power

        this.state = STATE.IDLE

        this.stonesType = null

        this.body = new Sprite(atlases.bot.textures.body)
        this.body.anchor.set(0.5)
        this.bodyStartY = this.body.y

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

        this.effectsList = ['smoke', 'sparks', 'stone']
        this.effectsIndex = 0
        this.drillOffset = 0
        this.drillOffsetMax = 9
        this.drillSpeed = 0.3
        this.drillTimeout = DRILLING_TIME
        this.isDrillIn = true
        this.isDrillEffectLeft = true
        this.hotSpeed = 0.0012
        this.iceSpeed = 0.0003
        this.isHot = false

        this.flyEyeMaxScale = 1.12
        this.flyEyeGrowSpeed = 0.0006
        this.flyEyePoint = {x: 3, y: 7}
        this.flyHandTargetRotationLeft = -Math.PI * 0.25
        this.flyHandTargetRotationRight = -Math.PI * 0.15
        this.flyHandTransitionSpeed = 0.0012
        this.flyHandWobbleAmplitude = 0.03
        this.flyHandWobbleSpeed = 0.006
        this.flyBodyShiftAmount = 9
        this.flyBodyShiftSpeed = 0.006

        this.landShock = 0
        this.landShockSpeed = 0.006

        this.gunTime = 0
        this.gunSpeed = 0.12
        this.gunPower = 18 // for back offset, not attack power
        this.gunKick = 3
        this.gunHitWindow = 0.92
        this.gunHitDone = false

        this.flyTime = 0

        this.addChild(this.right, this.body, this.head, this.lamp, this.left)

        this.position.set(0, 50)

        EventHub.on( events.landingOnLayer, this.startLanding, this )
        EventHub.on( events.layerCleared, this.startFly, this )

        this.startFly()
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

    resetToDefault() {
        // Тело
        this.body.scale.set(1)
        this.body.y = this.bodyStartY
        this.body.x = 0
        this.body.rotation = 0

        // Руки
        this.setGunsOnStart()

        // Голова
        this.head.y = this.head.startY

        // Глаз
        this.head_eye.x = this.head_eye.startPoint.x
        this.head_eye.y = this.head_eye.startPoint.y
        this.head_eye.scale.set(0.92)
        this.head_eye.targetPoint = null

        // Лампа
        this.lamp.tint = null

        // Красные части (остывание)
        this.left_red.alpha = 0
        this.right_red.alpha = 0
        this.isHot = false

        // Общий поворот
        this.rotation = 0

        // Счётчики состояний
        this.flyTime = 0
        this.gunTime = 0
        this.gunHitDone = false
        this.landShock = 0
        // idleTime не сбрасываем, чтобы сохранить плавность при возврате в IDLE
    }

    startDrill() {
        if (this.state !== STATE.IDLE) return

        //soundPlay(sounds.se_drill)

        soundLoopPlay(sounds.se_drill_start, sounds.se_drill_loop, sounds.se_drill_end, 'drill')

        this.resetToDefault()

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

        this.resetToDefault()
        this.state = STATE.IDLE
        this.drillTimeout = 0

        soundLoopStop('drill')
    }

    startLanding(stonesType) {
        this.stonesType = stonesType

        this.resetToDefault()

        this.landShock = 1
        this.state = STATE.LANDING
        soundPlay(sounds.se_bot_landing)
        this.addChild(new Smoke(-40, 60))
        this.addChild(new Smoke(40, 60))
    }

    startAttack(direction) {
        if (this.state !== STATE.IDLE) return
        // direction должен быть 1 (вправо) или -1 (влево)
        if (direction !== 1 && direction !== -1) return

        this.resetToDefault()
        this.scale.x = direction

        this.head_eye.position.set(12, 5)
        this.head_eye.scale.set(0.5)

        this.left.rotation = this.flyHandTargetRotationLeft
        this.right.rotation = this.flyHandTargetRotationRight

        this.gunTime = 0
        this.gunHitDone = false

        this.lamp.tint = 0xFF0000

        this.state = STATE.GUN
    }

    stopAttack() {
        if (this.state !== STATE.GUN) return

        this.resetToDefault()
        this.state = STATE.IDLE
    }

    startFly() {
        if (this.state === STATE.FLY) return
    
        this.stopDrilling() // останавливаем бурение, если оно было

        this.resetToDefault()
    
        this.head_eye.position.set(this.flyEyePoint.x, this.flyEyePoint.y)
        this.flyTime = 0
        this.state = STATE.FLY
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
    
            if (this.left.x === this.left.startX + this.drillOffsetMax) {
                this.isDrillIn = false
                this.setLayerDamage()
            }
        } else {
            this.left.x = Math.max(this.left.startX, this.left.x - offset)
            this.left.y = Math.max(this.left.startY, this.left.y - offset)
    
            this.right.x = Math.max(this.right.startX, this.right.x - offset)
            this.right.y = Math.max(this.right.startY, this.right.y - offset)
    
            if (this.left.x === this.left.startX) this.isDrillIn = true
        }
    
        if (this.left_red.alpha < 1) {
            const alpha = Math.min(1, this.left_red.alpha + this.hotSpeed * delta)
            this.left_red.alpha = alpha
            this.right_red.alpha = alpha
        }
    
        this.drillTimeout -= delta
        if (this.drillTimeout <= 0) this.stopDrilling()
    }

    setLayerDamage() {
        const xBase = this.isDrillEffectLeft ? this.left.x + 5 : this.right.x + 55
        const yBase = this.isDrillEffectLeft ? this.left.y + 160 : this.right.y + 140
    
        switch ( this.effectsList[this.effectsIndex] ) {
            case 'smoke':
                this.addChild(new Smoke(xBase, yBase))
                break
            case 'sparks':
                addSparks({
                    x: xBase,
                    y: yBase,
                    count: getRandom(30, 50),
                    angle: Math.PI * 1.5,
                    spread: Math.PI * 0.75
                })
                break
            case 'stone':
                this.addChild(new Stone(xBase, yBase, this.stonesType))
                break
        }
    
        this.isDrillEffectLeft = !this.isDrillEffectLeft
        this.effectsIndex = (this.effectsIndex + 1) % this.effectsList.length

        layerSetDamage(this.power)
        shakeScreen({x: 5, y: 5})
    }

    fly(delta) {
        this.flyTime += delta

        const currentEyeScale = this.head_eye.scale.x
        const newEyeScale = Math.min(
            this.flyEyeMaxScale, currentEyeScale + this.flyEyeGrowSpeed * delta
        )
        this.head_eye.scale.set(newEyeScale)
    

        if (this.left.rotation > this.flyHandTargetRotationLeft) {
            this.left.rotation = Math.max(
                this.flyHandTargetRotationLeft,
                this.left.rotation - this.flyHandTransitionSpeed * delta
            )
        }

        if (this.left.rotation <= this.flyHandTargetRotationLeft) {
            const wobble = Math.sin(this.flyTime * this.flyHandWobbleSpeed) * this.flyHandWobbleAmplitude
            this.left.rotation = this.flyHandTargetRotationLeft + wobble
        }
    
        if (this.right.rotation > this.flyHandTargetRotationRight) {
            this.right.rotation = Math.max(
                this.flyHandTargetRotationRight,
                this.right.rotation - this.flyHandTransitionSpeed * delta
            )
        }
        if (this.right.rotation <= this.flyHandTargetRotationRight) {
            const wobble = Math.sin(this.flyTime * this.flyHandWobbleSpeed + 1.0) * this.flyHandWobbleAmplitude
            this.right.rotation = this.flyHandTargetRotationRight + wobble
        }
    
        if (this.body.y < this.bodyStartY + this.flyBodyShiftAmount) {
            this.body.y = Math.min(
                this.bodyStartY + this.flyBodyShiftAmount,
                this.body.y + this.flyBodyShiftSpeed * delta
            )
        }
    }

    landing(delta) {
        this.landShock -= delta * this.landShockSpeed

        if (this.landShock <= 0) {
            this.body.scale.set(1)
            this.body.y = this.bodyStartY
            this.head.y = this.head.startY
            this.left.y = this.left.startY
            this.right.y = this.right.startY
            this.landShock = 0
            this.state = STATE.IDLE
            botLandingDone()
            return
        }
        
        // Сжатие по Y, расширение по X
        this.body.scale.y = 1 + this.landShock * 0.2
        this.body.scale.x = 1 - this.landShock * 0.1
        
        // Голова прыгает
        this.head.y = this.head.startY - this.landShock * 10
    }

    attacking(delta) {
        this.gunTime += delta * this.gunSpeed
        const wave = Math.sin(this.gunTime)
    
        // делаем удар резче
        const punch = Math.max(0, wave)
        const offset = punch * this.gunPower
    
        // движение буров вперед
        this.left.x = this.left.startX + offset
        this.left.y = this.left.startY + offset * 0.6
    
        this.right.x = this.right.startX + offset
        this.right.y = this.right.startY + offset * 0.6
        // лёгкий recoil корпуса
        this.body.x = punch * -this.gunKick
    
        // момент удара
        if (punch > this.gunHitWindow) {
            if (!this.gunHitDone) {
                this.gunHitDone = true
                shakeScreen({x:6,y:3})
                //soundPlay(sounds.se_drill_hit)
                EventHub.emit(events.botMeleeHit)
            }
    
        } else {
            this.gunHitDone = false
        }
    }

    tick(delta) {
        // lamp
        this.lampTime += delta * this.lampSpeed
        const lampValue = this.lampMid + Math.sin(this.lampTime) * this.lampAmp
        this.lamp.scale.set(lampValue)
        this.lamp.alpha = lampValue

        if (this.state === STATE.GUN) this.attacking(delta)
        else if (this.state === STATE.DRILL) this.drilling(delta)
        else if (this.state === STATE.FLY) this.fly(delta)
        else if (this.state === STATE.LANDING) this.landing(delta)
        else this.idle(delta)

        if (this.state !== STATE.DRILL && this.isHot) {
            const alpha = Math.max(0, this.left_red.alpha - this.iceSpeed * delta)
            this.left_red.alpha = alpha
            this.right_red.alpha = alpha
            if (alpha === 0) this.isHot = false
        }
    }

    kill() {
        EventHub.off( events.landingOnLayer, this.startLanding, this )
        EventHub.off( events.layerCleared, this.startFly, this )
    }
}