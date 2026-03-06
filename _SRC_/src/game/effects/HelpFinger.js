import { AnimatedSprite } from "pixi.js";
import { tickerAdd, tickerRemove } from "../../app/application";
import { atlases } from "../../app/assets";
import { EventHub, events } from "../../app/events";
import { createEnum, getDistance, moveToTarget } from "../../utils/functions";

const FINGER_STATE = createEnum(['DOWN', 'DELAY', 'TO_TARGET', 'UP', 'TO_START', 'HIDDEN'])

const MOVE_TO_TARGET = 900 // ms
const BACK_TO_START = 600 // ms
const MOVE_DELAY = 300 // ms

export default class HelpFinger extends AnimatedSprite {
    constructor(x = null, y = null) {
        super( atlases.ui.animations.finger_in )
        this.anchor.set(0.25, 0.25)
        this.startPoint = {x: 0, y: 0}
        this.targetPoint = null
        this.speedTarget = 0
        this.speedStart = 0
        this.delay = MOVE_DELAY

        this.eventMode = 'none'

        this.state = FINGER_STATE.HIDDEN
        this.visible = false

        this.loop = false

        EventHub.on( events.helpShow, this.show, this )
        EventHub.on( events.helpHide, this.hide, this )

        if (x && y) setTimeout( () => this.help(x, y), 0 )
    }

    help(x, y, merge_x = null, merge_y = null) {
        this.startPoint = {x: x, y: y}
        this.targetPoint = merge_x && merge_y ? {x: merge_x, y: merge_y} : null
        this.scale.set(this.targetPoint ? 1 : 0.5)
        this.position.set(x, y)
        if (this.targetPoint) {
            const dist = getDistance(this.startPoint, this.targetPoint)
            this.speedTarget = dist / MOVE_TO_TARGET
            this.speedStart = dist / BACK_TO_START
        } else {
            this.speedTarget = 0
            this.speedStart = 0
        }
        this.visible = true
        this.run() 
    }

    run() {
        tickerRemove(this)
        this.state = FINGER_STATE.DOWN
        this.textures = atlases.ui.animations.finger_in
        this.gotoAndPlay(0)
        this.onComplete = () => this.onTap()
    }

    hide() {
        tickerRemove(this)
        this.stop()
        this.state = FINGER_STATE.HIDDEN
        this.visible = false
    }

    show() {
        const x = this.startPoint.x
        const y = this.startPoint.y
        const merge_x = this.targetPoint ? this.targetPoint.x : null
        const merge_y = this.targetPoint ? this.targetPoint.y : null
        this.help(x, y, merge_x, merge_y)
    }

    onTap() {
        this.delay = MOVE_DELAY
        this.state = FINGER_STATE.DELAY
        tickerAdd(this)
    }

    onTapEnd() {
        tickerRemove(this)
        this.state = FINGER_STATE.UP
        this.textures = atlases.ui.animations.finger_out
        this.gotoAndPlay(0)
        this.onComplete = () => this.restart()
    }

    restart() {
        if (this.targetPoint) {
            this.state = FINGER_STATE.TO_START
            tickerAdd(this)
        } else {
            this.run()
        }
    }

    tick(time) {
        switch(this.state) {
            case FINGER_STATE.DELAY:
                this.delay -= time.deltaMS
                if (this.delay <= 0) {
                    if (this.targetPoint) this.state = FINGER_STATE.TO_TARGET
                    else this.onTapEnd()
                }
                return

            case FINGER_STATE.TO_TARGET:
                if ( moveToTarget(this, this.targetPoint, this.speedTarget * time.deltaMS) ) {
                    this.onTapEnd()
                }
                return

            case FINGER_STATE.TO_START:
                if ( moveToTarget(this, this.startPoint, this.speedStart * time.deltaMS) ) {
                    this.run()
                }
                return
        }
    }

    kill() {
        EventHub.off( events.helpShow, this.show, this )
        EventHub.off( events.helpHide, this.hide, this )
    }
}