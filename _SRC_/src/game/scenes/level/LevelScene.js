import { Container, Graphics } from 'pixi.js'
import { music } from '../../../app/assets'
import { EventHub, events } from '../../../app/events'
import { setMusicList } from '../../../app/sound'
import { getLanguage } from '../../localization'
import Bot from './Bot'
import Layer, { TYPE } from './layer'
import Shaker from './Shaker'
import Button from '../../UI/Button'
import StonesParticles from './StonesParticles'
import Back from './Back'
import SparksParticles from './SparksParticles'

export default class LevelScene extends Container {
    constructor() {
        super()

        const bgType = 1
        this.layerType = TYPE.stone
        this.layerCount = 1
        this.layerHp = 5

        this.botPowerBtnRate = 1

        this.currentLanguage = getLanguage()
        EventHub.on( events.updateLanguage, this.updateLanguage, this )

        this.shaker = new Shaker()
        this.addChild(this.shaker)

        this.bg = new Back(bgType) // 1 or 2
        this.shaker.halfAmplitudeContainer.addChild(this.bg)

        this.layer = new Layer()
        setTimeout( () => this.addNextLayer(), 2400 )
        this.shaker.fullAmplitudeContainer.addChild(this.layer)

        this.bot = new Bot(1)
        this.shaker.fullAmplitudeContainer.addChild(this.bot)

        this.stones = new StonesParticles()
        this.addChild(this.stones.container)

        this.sparks = new SparksParticles()
        this.addChild(this.sparks.container)

        this.tapArea = new Graphics()
        this.tapArea.alpha = 0.001
        this.tapArea.eventMode = 'static'
        this.tapArea.on('pointerdown', this.startTap, this)
        this.tapArea.on('pointerup', this.endTap, this)
        this.tapArea.on('pointerupoutside', this.endTap, this)
        this.addChild(this.tapArea)

        this.isOnTap = false

        this.btn1 = new Button(null, this.botPowerBtnRate, this.clickBtn1.bind(this))
        this.addChild(this.btn1)

        EventHub.on( events.layerCleared, this.addNextLayer, this )
        EventHub.on( events.botLandingDone, this.checkTapArea, this )
        
        setMusicList([ music.bgm_0, music.bgm_1, music.bgm_2, music.bgm_3, music.bgm_4 ])
    }

    screenResize(screenData) {
        // set scene container in center of screen
        this.position.set( screenData.centerX, screenData.centerY )

        this.tapArea.clear()
        this.tapArea.rect(
            -screenData.centerX, -screenData.centerY,
            screenData.width, screenData.height
        )
        this.tapArea.fill(0x000000)

        this.shaker.screenResize(screenData)
        this.btn1.position.set(-screenData.centerX + 150, -screenData.centerY + 50)
    }

    addNextLayer() {
        this.layerHp++
        if (this.layerHp > 20) {
            this.layerHp = 5
            this.layerCount++
        }

        this.layer.setUp(this.layerType, this.layerCount, this.layerHp)
    }

    clickBtn1() {
        if (this.bot.state === 'IDLE') this.bot.startAttack(this.bot.scale.x > 0 ? -1 : 1)
        else this.bot.stopAttack()
    }
    startTap() {
        this.isOnTap = true
        this.bot.startDrill()
    }
    endTap() {
        this.isOnTap = false
        this.bot.stopDrilling()
    }
    checkTapArea() {
        if (this.isOnTap) this.bot.startDrill()
    }

    updateLanguage(lang) {
        this.currentLanguage = lang
    }

    kill() {
        EventHub.off( events.updateLanguage, this.updateLanguage, this )
        EventHub.off( events.layerCleared, this.addNextLayer, this )
        EventHub.off( events.botLandingDone, this.checkTapArea, this )
        this.tapArea.off('pointerdown', this.startTap, this)
        this.tapArea.off('pointerup', this.endTap, this)
        this.tapArea.off('pointerupoutside', this.endTap, this)
    }
}