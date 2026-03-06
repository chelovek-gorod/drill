import { Container, Text, Sprite, Graphics } from 'pixi.js'
import { assetType, assets, sounds } from '../../../app/assets'
import { styles } from '../../../app/styles'
import { getAppScreen, tickerAdd, tickerRemove } from '../../../app/application'
import { loadAssets, preloadAsset, preloadFonts } from './Loader'
import BackgroundGradient from '../../BG/BackgroundGradient'
import { removeCursorPointer, setCursorPointer } from '../../../utils/functions'
import { EventHub, startScene, events } from '../../../app/events'
import { SCENE_NAME } from '../SceneManager'
import { getFirstUserAction, soundPlay } from '../../../app/sound'
import { getLanguage } from '../../localization'
import { TEXT_GET_FIRST_CLICK } from '../../localText'

export const ALPHA_STEP = 0.003

export const PROGRESS_TEXT = {
    y: -18,
    anchor: 0.5,
}

export const PROGRESS_BAR = {
    x: -135,
    y: 18,
    width: 270,
    height: 36,
    borderLineWidth: 6,
    progressOffset: 10,
    color: 0x4000ff,
    borderRadius: 18,
    progressRadius: 8,
}

let isFirstLoading = true

export default class LoadScene extends Container {
    constructor() {
        super()

        this.currentLanguage = getLanguage()
        EventHub.on( events.updateLanguage, this.updateLanguage, this )

        this.bg = null
        this.logo = null

        this.progressBar = new Graphics()
        this.drawProgress(0)
        this.addChild(this.progressBar)

        this.progressText = null
        this.doneText = null

        this.isLoadingDone = false

        if (isFirstLoading) preloadFonts(this.setText.bind(this))
        else this.setText()
    }

    setText() {
        if (!this.progressText) {
            this.progressText = new Text({ text:'0%', style: styles.loading })
            this.progressText.anchor.set(PROGRESS_TEXT.anchor)
            this.progressText.position.y = PROGRESS_TEXT.y
            this.addChild(this.progressText)
        }

        this.setBg()
    }

    setBg() {
        this.bg = new BackgroundGradient( [ 0xff0000, 0x000000, 0x000000 ] )
        this.bg.screenResize( getAppScreen() )
        this.addChildAt(this.bg, 0)

        tickerAdd(this)

        this.preloadLogo()
    }

    preloadLogo() {
        if (!this.logo) {
            preloadAsset(assetType.images, 'logo', this.setLogo.bind(this))
        }
    }

    setLogo() {
        this.logo = new Sprite(assets.images.logo)
        this.logo.scale.set(0.75)
        this.logo.anchor.set(1)
        const screenData = getAppScreen()
        this.logo.position.set(screenData.centerX - 12, screenData.centerY - 12)
        this.addChild(this.logo)

        this.startLoading()
    }

    startLoading() {
        const loadingData = {
            [assetType.images]: Object.keys(assets.images),
            [assetType.atlases]: Object.keys(assets.atlases),
            [assetType.sounds]: Object.keys(assets.sounds)
        }
        
        loadAssets(loadingData, this.loadingDone.bind(this), this.update.bind(this))
    }

    loadingDone() {
        this.doneText = new Text({
            text: TEXT_GET_FIRST_CLICK[ this.currentLanguage ],
            style: styles.loading
        })
        this.doneText.alpha = 0
        this.doneText.anchor.set(0.5)
        const screenData = getAppScreen()
        this.resizeDoneText( screenData.width )
        this.addChild(this.doneText)

        this.isLoadingDone = true

        setCursorPointer(this)
        this.on('pointerdown', this.getClick, this)
    }

    updateLanguage(lang) {
        this.currentLanguage = lang
        if (this.doneText) this.doneText.text = TEXT_GET_FIRST_CLICK[ this.currentLanguage ]
        const screenData = getAppScreen()
        this.resizeDoneText( screenData.width )
    }

    resizeDoneText(screenWidth) {
        this.doneText.scale.set(1)
        const scale = Math.min(1, screenWidth / (this.doneText.width + 24))
        this.doneText.scale.set(scale)
    }

    screenResize(screenData) {
        this.position.set(screenData.centerX, screenData.centerY)
        if (this.bg) this.bg.screenResize(screenData)
        if (this.logo) this.logo.position.set(screenData.centerX - 12, screenData.centerY - 12)
        if (this.doneText) this.resizeDoneText(screenData.width)
    }

    update(progress, loadedAssetsCount, assetsCount) {
        const range = Math.round(progress)
        this.drawProgress(range)
        this.progressText.text = range + '%'
    }

    drawProgress(range) {
        this.progressBar.clear()

        this.progressBar.roundRect(
            PROGRESS_BAR.x, PROGRESS_BAR.y,
            PROGRESS_BAR.width, PROGRESS_BAR.height,
            PROGRESS_BAR.borderRadius
        )
        this.progressBar.stroke({width: PROGRESS_BAR.borderLineWidth, color: PROGRESS_BAR.color})

        const width = 2.5 * range
        if (width < PROGRESS_BAR.progressRadius) return
        
        this.progressBar.roundRect(
            PROGRESS_BAR.x + PROGRESS_BAR.progressOffset,
            PROGRESS_BAR.y + PROGRESS_BAR.progressOffset,
            width,
            PROGRESS_BAR.height - PROGRESS_BAR.progressOffset * 2,
            PROGRESS_BAR.progressRadius
        )
        this.progressBar.fill(PROGRESS_BAR.color)
    }

    getClick() {
        if (!this.isLoadingDone) return

        getFirstUserAction()
        soundPlay(sounds.se_click)

        startScene(SCENE_NAME.Level)
    }

    tick(delta) {
        const alphaStep = delta * ALPHA_STEP
        if (this.bg && this.bg.alpha < 1) this.bg.alpha += alphaStep
        if (this.logo && this.logo.alpha < 1) this.logo.alpha += alphaStep
        
        if (this.isLoadingDone) {
            this.progressBar.alpha -= alphaStep
            this.progressText.alpha -= alphaStep
            this.doneText.alpha += alphaStep
            if (this.doneText.alpha >= 1) tickerRemove(this)
        } 
    }

    kill() {
        removeCursorPointer(this)
        this.off('pointerdown', this.getClick, this)
        EventHub.off( events.updateLanguage, this.updateLanguage, this )
    }
}