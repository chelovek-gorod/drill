import { Container, Graphics, Sprite, Text, Texture } from "pixi.js";
import { kill, tickerAdd, tickerRemove } from "../../app/application";
import { atlases, sounds } from "../../app/assets";
import { EventHub, events, helpShow, setMapCameraInteractive, startScene } from "../../app/events";
import { soundPlay } from "../../app/sound";
import { styles } from "../../app/styles";
import { createEnum, removeCursorPointer, setCursorPointer } from "../../utils/functions";
import HelpFinger from "../effects/HelpFinger";
import { SCENE_NAME } from "../scenes/constants";
import { FIELD_OFFSET_Y, FIELD_OFFSET_X } from "../scenes/Level/constants";
import { LEVELS_LIST } from "../scenes/Level/levels";
import { TASK } from "../scenes/world/constants";
import { isNeedHelp, setLevelTask, world } from "../state";
import Button from "../UI/Button";
import Overlay from "./Overlay";

const CARD = {
    width: 280,
    height: 320,

    minScale: 0.9,
    maxScale: 1,
    scaleStep: 0.0006,
    awaitTime: 150,
}

const BUTTON_SIZE = 100

const DATA = {
    width2: CARD.width * 2 + BUTTON_SIZE * 3,
    width3: CARD.width * 3 + BUTTON_SIZE * 3,
    height1: CARD.height + BUTTON_SIZE * 1.5,
    height2: CARD.height * 2 + BUTTON_SIZE * 1.5,
}

const CARD_STATE = createEnum(['AWAIT_OPEN', 'OPEN', 'READY', 'AWAIT_CLOSE', 'CLOSE'])

const CARDS = {
    noWrap : {
        1: [
            {x: 0, y: 0}, // card 1
            {x: CARD.width * 0.5 + BUTTON_SIZE * 0.5, y: -CARD.height * 0.5}, // button
        ],
        2: [
            {x: -CARD.width * 0.5, y: 0}, // card 1
            {x: CARD.width * 0.5, y: 0}, // card 2
            {x: CARD.width + BUTTON_SIZE * 0.5, y: -CARD.height * 0.5}, // button
        ],
        3: [
            {x: -CARD.width, y: 0}, // card 1
            {x: 0, y: 0}, // card 2
            {x: CARD.width, y: 0}, // card 3
            {x: CARD.width * 1.5 + BUTTON_SIZE * 0.5, y: -CARD.height * 0.5}, // button
        ]
    },
    wrap: {
        1: [
            {x: 0, y: 0}, // card 1
            {x: CARD.width * 0.5 + BUTTON_SIZE * 0.5, y: -CARD.height * 0.5}, // button
        ],
        2: [
            {x: -CARD.width * 0.5, y: 0}, // card 1
            {x: CARD.width * 0.5, y: 0}, // card 2
            {x: CARD.width + BUTTON_SIZE * 0.5, y: -CARD.height * 0.5}, // button
        ],
        3: [
            {x: -CARD.width * 0.5, y: -CARD.height * 0.5}, // card 1
            {x: CARD.width * 0.5, y: -CARD.height * 0.5}, // card 2
            {x: 0, y: CARD.height * 0.5}, // card 3
            {x: CARD.width + BUTTON_SIZE * 0.5, y: -CARD.height}, // button
        ]
    }
}

class Card extends Container {
    constructor(index, isDone, levelIndex, task) {
        super()

        this.index = index

        this.state = CARD_STATE.AWAIT_OPEN
        this.awaitTime = CARD.awaitTime * this.index

        this.scale.set( 0, CARD.minScale )

        this.bg = new Sprite( atlases.ui.textures['card_' + this.index] )
        this.bg.anchor.set(0.5)
        this.addChild(this.bg)

        this.levelIndex = levelIndex

        // task = {type: TASK.NEW, value: 2, turns: 0}
        const taskSprite = task.type + (task.turns ? '_' + TASK.TIME : '')
        this.image = new Sprite( atlases.ui.textures[taskSprite.toLowerCase()] )
        this.image.anchor.set(0.5)
        this.addChild(this.image)

        this.isDone = isDone
        this.doneImage = new Sprite( this.isDone ? atlases.ui.textures.done : Texture.EMPTY )
        this.doneImage.anchor.set(0.5)
        this.addChild(this.doneImage)

        const taskCountText = task.type === TASK.NEW
            ? '+' + task.value + (task.turns ? '/' + task.turns : '')
            : task.value + (task.turns ? '/' + task.turns : '')
        this.countText = new Text({text: taskCountText, style: styles.cardCount})
        this.countText.anchor.set(0.5)
        this.countText.position.set(-5, 110)
        this.addChild(this.countText)

        if (!this.isDone) {
            setCursorPointer(this)
            this.on('pointerdown', this.click, this)
            this.on('pointerover', this.onHover, this)
            this.on('pointerout', this.onOut, this)
        } else {
            this.eventMode = 'static'
        }
        this.isOnHover = false

        tickerAdd(this)
    }

    click() {
        if (this.state !== CARD_STATE.READY) return

        setLevelTask( this.levelIndex )
        startScene( SCENE_NAME.Level )
        soundPlay(sounds.se_click)
    }

    onHover() {
        if (this.state !== CARD_STATE.READY || this.isOnHover) return

        this.isOnHover = true
        tickerAdd(this)
        soundPlay(sounds.se_task_hover)
    }

    onOut() {
        if (this.state !== CARD_STATE.READY || !this.isOnHover) return

        this.isOnHover = false
        tickerAdd(this)
    }

    close() {
        this.awaitTime = CARD.awaitTime * this.index
        this.state = CARD_STATE.AWAIT_CLOSE
        tickerAdd(this)
    }

    tick(time) {
        if (this.state === CARD_STATE.AWAIT_OPEN || this.state === CARD_STATE.AWAIT_CLOSE) {
            this.awaitTime -= time.deltaMS
            if (this.awaitTime > 0) return
            else if (this.state === CARD_STATE.AWAIT_OPEN) this.state = CARD_STATE.OPEN
            else this.state = CARD_STATE.CLOSE
        }

        const scaleAdd = CARD.scaleStep * time.deltaMS

        if (this.state === CARD_STATE.OPEN) {
            this.scale.x = Math.min(CARD.minScale, this.scale.x + scaleAdd * 3)
            if (this.scale.x === CARD.minScale) this.state = CARD_STATE.READY
        }

        if (this.state === CARD_STATE.CLOSE) {
            this.scale.x = Math.max(0, this.scale.x - scaleAdd * 3)
            if (this.scale.x === 0) {
                tickerRemove(this)
                this.parent.parent.parent.cardClosed()
            }
        }

        if (this.state !== CARD_STATE.READY) return
        
        if (this.isOnHover) {
            this.scale.set( Math.min(CARD.maxScale, this.scale.x + scaleAdd) )
            if (this.scale.x === CARD.maxScale) tickerRemove(this)
        } else {
            this.scale.set( Math.max(CARD.minScale, this.scale.x - scaleAdd) )
            if (this.scale.x === CARD.minScale) tickerRemove(this)
        }
    }

    kill() {
        tickerRemove(this)
        removeCursorPointer(this)
        this.off('pointerdown', this.click, this)
        this.off('pointerover', this.onHover, this)
        this.off('pointerout', this.onOut, this)
    }
}

export default class LevelCards extends Container {
    constructor() {
        super()

        this.visible = false

        this.isWrap = false

        this.openedCardsCount = 0

        this.overlay = new Overlay( () => this.closeCards() )
        this.addChild(this.overlay)

        this.container = new Container()
        this.addChild(this.container)

        this.cards = new Container()
        this.container.addChild(this.cards)

        this.closeBtn = new Button( atlases.ui.textures.button_icon_close, '', this.closeCards.bind(this) )
        this.closeBtn.scale.set(0.75)
        this.container.addChild(this.closeBtn)

        EventHub.on( events.showLevelCards, this.showLevelCards, this )
    }

    screenResize(screenData) {
        this.overlay.screenResize(screenData)

        const scaleX2 = screenData.width / DATA.width2
        const scaleX3 = screenData.width / DATA.width3
        const scaleY1 = screenData.height / DATA.height1
        const scaleY2 = screenData.height / DATA.height2

        // если в 1 ряд размещать
        const scale1 = Math.min(1, scaleX3, scaleY1)
        // если в 2 ряда размещать
        const scale2 = Math.min(1, scaleX2, scaleY2)

        this.isWrap = scale2 > scale1
        const scale = Math.max(scale2, scale1)
        this.container.scale.set(scale)

        if (this.cards.children.length) this.replaceCards()
    }

    showLevelCards(worldPointIndex) {
        setMapCameraInteractive( false )
        this.overlay.show()

        this.openedCardsCount = 3

        const startTaskIndex = worldPointIndex * 3
        const worldPointData = world[worldPointIndex]

        this.help = null
        this.helpIndex = 0
        for(let i = 0; i < 3; i++) {
            const taskIndex = startTaskIndex + i
            const task = LEVELS_LIST[taskIndex].task
            const isDone = worldPointData[i]
            this.cards.addChild( new Card( i, isDone, taskIndex, task ))

            if (isNeedHelp && !this.help && !isDone) {
                this.helpIndex = i
                this.help = new HelpFinger()
                this.addChild(this.help)
            }
        }

        this.replaceCards()

        this.visible = true
    }

    replaceCards() {
        const cardsCount = this.cards.children.length
        const closeBtnPoint = CARDS[ this.isWrap ? 'wrap' : 'noWrap'][cardsCount][cardsCount]
        this.closeBtn.position.set(closeBtnPoint.x, closeBtnPoint.y)

        this.cards.children.forEach( (card, i) => {
            const cardPoint = CARDS[ this.isWrap ? 'wrap' : 'noWrap'][cardsCount][i]
            card.position.set(cardPoint.x, cardPoint.y)
        })

        if (this.help) {
            const globalPoint = this.cards.children[this.helpIndex].getGlobalPosition()
            const localPoint = this.toLocal( globalPoint )
            this.help.help( localPoint.x, localPoint.y )
        }
    }

    closeCards() {
        kill(this.help)
        this.overlay.hide()
        this.cards.children.forEach( card => card.close() )
    }
    cardClosed() {
        this.openedCardsCount--
        if (this.openedCardsCount > 0) return

        this.cards.children.forEach( card => kill(card) )
        this.visible = false
        setMapCameraInteractive( true )

        if (isNeedHelp) helpShow()
    }
    

    kill() {
        EventHub.off( events.showLevelCards, this.showLevelCards, this )
    }
}