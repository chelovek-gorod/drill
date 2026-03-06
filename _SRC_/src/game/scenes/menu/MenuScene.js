import { Container, Sprite } from 'pixi.js'
import { kill } from '../../../app/application'
import { atlases, images, music } from '../../../app/assets'
import { startScene } from '../../../app/events'
import { setMusicList } from '../../../app/sound'
import { SCENE_NAME } from '../../scenes/constants'
import BackgroundImage from '../../BG/BackgroundImage'
import Button from '../../UI/Button'
import FirefliesContainer from '../../effects/Fireflies'
import { TEXT_BUTTON_TYPE } from '../../localText'
import Title from './Title'

export default class Menu extends Container {
    constructor() {
        super()
        this.alpha = 0

        this.isMenuActive = true

        this.bg = new BackgroundImage( images.bg_main )
        this.addChild(this.bg)

        this.logo = new Sprite(images.logo)
        this.logo.scale.set(0.75)
        this.logo.anchor.set(1)
        this.addChild(this.logo)
        
        this.title = new Title()
        this.titleStartWidth = this.title.width
        this.titleStartHeight = this.title.height
        this.addChild(this.title)

        this.startButton = new Button(
            null, TEXT_BUTTON_TYPE.START, () => {
                if (!this.isMenuActive) return

                this.isMenuActive = false
                startScene(SCENE_NAME.World)
            }, true
        )
        this.startButton.scale.set(0.75)
        this.addChild(this.startButton)

        this.fireflies = new FirefliesContainer()
        this.addChild(this.fireflies)

        setMusicList([music.bgm_0])
    }

    screenResize(screenData) {
        // set scene container in center of screen
        this.position.set( screenData.centerX, screenData.centerY )

        this.bg.screenResize(screenData)

        this.logo.position.set(screenData.centerX - 12, screenData.centerY - 12)

        const titleScaleX = Math.min(1, screenData.width / (this.titleStartWidth + 120))
        const titleScaleY = Math.min(1, screenData.centerY / (this.titleStartHeight + 60))
        const pointY = screenData.centerY * 0.3
        this.title.scale.set( Math.min(titleScaleX, titleScaleY) )
        this.title.position.set(0, -pointY)

        this.startButton.position.set(0, screenData.centerY * 0.5)
    }

    kill() {
        kill(this.fireflies)
    }
}