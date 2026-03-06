import { Particle, ParticleContainer } from "pixi.js";
import { getAppScreen, tickerAdd, tickerRemove } from "../../../app/application";
import { atlases, images } from "../../../app/assets";
import { EventHub, events } from "../../../app/events";
import { createEnum, getRandom } from "../../../utils/functions";

const _2PI = Math.PI * 2

const TYPE = createEnum(['part_brick', 'part_stone'])

const STONE = {
    scaleMin: 0.25,
    scaleMax: 1,
    speedMin: 0.06,
    speedMax: 0.3,
    rotationSpeed: 0.0006,
    alphaSpeedMin: 0.003,
    alphaSpeedMax: 0.0006,
    offsetStone: 24,
    offsetBrick: 48,
}

function createStone(isStone = true) {
    const stone = new Particle({
        texture: atlases.ground.textures[isStone ? TYPE.part_stone : TYPE.part_brick],
        x: 0,
        y: 0,
        anchorX: 0.5,
        anchorY: 0.5,
        scaleX: 1,
        scaleY: 1,
        rotation: 0,
        alpha: 1,
    })
    stone.data = {}

    return stone
}

export default class StonesParticles {
    constructor() {
        this.container = new ParticleContainer({
            dynamicProperties: {
                position: true,
                rotation: true,
                scale: true,
                alpha: true,
                color: false,
            }
        })
        // this.container.blendMode = 'normal'

        this.pull = []
        this.stones = []

        for(let i = 300; i > 0; i--) this.pull.push( createStone() )

        EventHub.on( events.addStones, this.addStones, this )
    }

    addStones(isStone = true) {
        const screenData = getAppScreen()
        let x = -screenData.centerX
        let y = 32
        while (y < 200) {
            while (x < screenData.centerX) {
                this.setUpStone(x, y, isStone ? STONE.offsetStone : STONE.offsetBrick)
                x += isStone ? STONE.offsetStone * 1.5 : STONE.offsetBrick * 1.5
            }
            y += isStone ? STONE.offsetStone * 1.5 : STONE.offsetBrick * 1.5
            x = -screenData.centerX
        }
        tickerAdd(this)
        // console.log('Stones created:', this.stones.length, 'Pull size:', this.pull.length)
    }

    setUpStone(x, y, offset) {
        const stone = this.pull.length ? this.pull.pop() : createStone()
        stone.x = x + offset * Math.random()
        stone.y = y + offset * Math.random()
        const scale = getRandom(STONE.scaleMin, STONE.scaleMax)
        stone.scaleX = scale
        stone.scaleY = scale
        stone.rotation = _2PI * Math.random()
        stone.alpha = 1

        stone.data.alphaStep = getRandom(STONE.alphaSpeedMin, STONE.alphaSpeedMax)
        stone.data.speed = getRandom(STONE.speedMin, STONE.speedMax)

        this.container.addParticle(stone)
        this.stones.push(stone)
    }

    tick(delta) {
        const stones = this.stones
        const rotationSpeed = STONE.rotationSpeed
        for (let i = stones.length - 1; i >= 0; i--) {
            const stone = stones[i]
            const stoneData = stone.data

            stone.y += delta * stoneData.speed
            stone.alpha = Math.max(0, stone.alpha - delta * stoneData.alphaStep)
            stone.rotation += delta * rotationSpeed

            if (stone.alpha === 0) {
                this.container.removeParticle(stone)
                
                this.pull.push(stone)

                stones[i] = stones[stones.length - 1]
                stones.pop()
            }
        }

        if (stones.length === 0) tickerRemove(this)
    }

    kill() {
        EventHub.off( events.addStones, this.addStones, this )
        tickerRemove(this)

        if (this.container) {
            this.container.destroy({ children: true })
            this.container = null
        }

        this.stones.length = 0
        this.pull.length = 0
    }
}