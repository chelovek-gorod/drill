import { Container, Graphics, Sprite } from "pixi.js";
import { tickerAdd, tickerRemove } from "../../app/application";
import { images, atlases } from "../../app/assets";
import { showPopup } from "../../app/events";
import { FIELD_OFFSET_Y, FIELD_OFFSET_X, LEVEL_PET, PLACE_PETS } from "../scenes/level/constants";
import { availablePetLevel } from "../state";
import { POPUP_TYPE } from "./constants";

const BG = {
    width: 1400,
    height: 1280,
    offset: 24,
}

const PET_MIN_SCALE = 0.6
const PET_MAX_SCALE = 0.7
const PET_SCALE_STEP = 0.0006

const psx = 120 // pet start x
const pdx = 128 // pet offset x
const psy = 1220 // pets start y
const pdy = 244 // pets offset y
const POINTS = [
    {x: psx + pdx * 0, y: psy - pdy * 0},
    {x: psx + pdx * 1, y: psy - pdy * 0},
    {x: psx + pdx * 2, y: psy - pdy * 0},
    {x: psx + pdx * 3, y: psy - pdy * 0},
    {x: psx + pdx * 4, y: psy - pdy * 0},
    {x: psx + pdx * 5, y: psy - pdy * 0},
    {x: psx + pdx * 6, y: psy - pdy * 0},
    {x: psx + pdx * 7, y: psy - pdy * 0},
    {x: psx + pdx * 8, y: psy - pdy * 0},
    {x: psx + pdx * 9, y: psy - pdy * 0},

    {x: psx + pdx * 0, y: psy - pdy * 1},
    {x: psx + pdx * 1, y: psy - pdy * 1},
    {x: psx + pdx * 2, y: psy - pdy * 1},
    {x: psx + pdx * 3, y: psy - pdy * 1},
    {x: psx + pdx * 4, y: psy - pdy * 1},
    {x: psx + pdx * 5, y: psy - pdy * 1},
    {x: psx + pdx * 6, y: psy - pdy * 1},
    {x: psx + pdx * 7, y: psy - pdy * 1},
    {x: psx + pdx * 8, y: psy - pdy * 1},
    {x: psx + pdx * 9, y: psy - pdy * 1},

    {x: psx + pdx * 0, y: psy - pdy * 2},
    {x: psx + pdx * 1, y: psy - pdy * 2},
    {x: psx + pdx * 2, y: psy - pdy * 2},
    {x: psx + pdx * 3, y: psy - pdy * 2},
    {x: psx + pdx * 4, y: psy - pdy * 2},
    {x: psx + pdx * 5, y: psy - pdy * 2},
    {x: psx + pdx * 6, y: psy - pdy * 2},
    {x: psx + pdx * 7, y: psy - pdy * 2},
    {x: psx + pdx * 8, y: psy - pdy * 2},
    {x: psx + pdx * 9, y: psy - pdy * 2},

    {x: psx + pdx * 0, y: psy - pdy * 3},
    {x: psx + pdx * 1, y: psy - pdy * 3},
    {x: psx + pdx * 2, y: psy - pdy * 3},
    {x: psx + pdx * 3, y: psy - pdy * 3},
    {x: psx + pdx * 4, y: psy - pdy * 3},
    {x: psx + pdx * 5, y: psy - pdy * 3},
    {x: psx + pdx * 6, y: psy - pdy * 3},
    {x: psx + pdx * 7, y: psy - pdy * 3},
    {x: psx + pdx * 8, y: psy - pdy * 3},
    {x: psx + pdx * 9, y: psy - pdy * 3},

    {x: psx + pdx * 0, y: psy - pdy * 4},
    {x: psx + pdx * 1, y: psy - pdy * 4},
    {x: psx + pdx * 2, y: psy - pdy * 4},
    {x: psx + pdx * 3, y: psy - pdy * 4},
    {x: psx + pdx * 4, y: psy - pdy * 4},
    {x: psx + pdx * 5, y: psy - pdy * 4},
    {x: psx + pdx * 6, y: psy - pdy * 4},
    {x: psx + pdx * 7, y: psy - pdy * 4},
    {x: psx + pdx * 8, y: psy - pdy * 4},
    {x: psx + pdx * 9, y: psy - pdy * 4},
]

class Pet extends Sprite {
    constructor(type) {
        super( atlases.units.textures[LEVEL_PET[type]] )
        this.anchor.set(0.5, 0.8)
        this.scale.set(PET_MIN_SCALE)

        this.isOnHover = false

        this.type = type
        this.place = Object.entries(PLACE_PETS).find(
            ([place, pets]) => pets.includes( LEVEL_PET[this.type] )
        )
        
        this.eventMode = 'static'
        this.cursor = 'pointer'

        this.on('pointerdown', this.click, this)
        this.on('pointerover', this.onHover, this)
        this.on('pointerout', this.onOut, this)

        const x = POINTS[type - 1] ? POINTS[type - 1].x : 0
        const y = POINTS[type - 1] ? POINTS[type - 1].y : 0
        this.position.set(x, y)
    }

    click() {
        showPopup({type: POPUP_TYPE.INFO, data: this.type})
    }
    
    onHover() {
        if (this.isOnHover) return

        this.isOnHover = true
        tickerAdd(this)
    }

    onOut() {
        if (!this.isOnHover) return

        this.isOnHover = false
        tickerAdd(this)
    }

    tick(time) {
        const scaleStep = PET_SCALE_STEP * time.deltaMS
        if (this.isOnHover) {
            this.scale.set( Math.min(PET_MAX_SCALE, this.scale.x + scaleStep) )
            if (this.scale.x === PET_MAX_SCALE) tickerRemove(this)
        } else {
            this.scale.set( Math.max(PET_MIN_SCALE, this.scale.x - scaleStep) )
            if (this.scale.x === PET_MIN_SCALE) tickerRemove(this)
        }
    }

    kill() {
        tickerRemove(this)
        this.cursor = 'none'
        this.eventMode = 'none'
        this.off('pointerdown', this.click, this)
        this.off('pointerover', this.onHover, this)
        this.off('pointerout', this.onOut, this)
    }
}

export default class Collection extends Container {
    constructor( closeCallback = null ) {
        super()

        this.closeCallback = closeCallback

        this.overlay = new Graphics()
        this.overlay.eventMode = 'static'
        this.overlay.on('pointerdown', this.click, this)
        this.addChild(this.overlay)

        this.container = new Container()
        this.addChild(this.container)

        this.bg = new Sprite(images.collection_bg)
        this.bg.eventMode = 'static'
        this.container.addChild(this.bg)

        this.pets = new Container()
        this.container.addChild(this.pets)

        for(let i = 1; i <= availablePetLevel; i++) this.addPet(i)
    }

    screenResize(screenData) {
        this.overlay.clear()
        this.overlay.rect(
            -screenData.centerX - FIELD_OFFSET_X,
            -screenData.centerY - FIELD_OFFSET_Y,
            screenData.width + FIELD_OFFSET_X * 2,
            screenData.height + FIELD_OFFSET_Y * 2
        )
        this.overlay.fill({ color: 0x000000, alpha: 0.5 })

        const scaleX = (screenData.width - BG.offset * 2) / BG.width
        const scaleY = (screenData.height - BG.offset * 2) / BG.height
        const scale = Math.min(scaleX, scaleY)
        this.container.scale.set(scale)

        const x = -BG.width * scale * 0.5
        const y = -BG.height * scale * 0.5
        this.container.position.set( x, y)
    }

    addPet(i) {
        this.pets.addChild( new Pet(i) )
    }

    click() {
        if (this.closeCallback) this.closeCallback()
    }

    kill() {
        this.overlay.off('pointerdown', this.click, this)
    }
}