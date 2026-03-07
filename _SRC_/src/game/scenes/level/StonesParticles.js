import { Particle, ParticleContainer } from "pixi.js";
import { getAppScreen, tickerAdd, tickerRemove } from "../../../app/application";
import { atlases, images } from "../../../app/assets";
import { EventHub, events } from "../../../app/events";
import { getRandom } from "../../../utils/functions";
import { TYPE } from "./layer";

const _2PI = Math.PI * 2

const STONE = {
    scaleMin: 0.25,
    scaleMax: 1,
    speedMin: 0.06,
    speedMax: 0.3,
    rotationSpeed: 0.0006,
    alphaSpeedMin: 0.003,
    alphaSpeedMax: 0.0006,
    offsetStone: 76,
    offsetBrick: 100,
    offsetSoil: 92,
}

function createStone(type) {
    const stone = new Particle({
        texture: atlases.ground.textures[ 'part_' + type ],
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

        for(let i = 60; i > 0; i--) this.pull.push( createStone(TYPE.brick) )

        EventHub.on( events.addStones, this.addStones, this )
    }

    addStones(type) { console.log('add stones start')
        const screenData = getAppScreen()
        let x = -screenData.centerX
        let y = 32
        let offset = 100
        switch(type) {
            case TYPE.brick : offset = STONE.offsetBrick; break;
            case TYPE.stone : offset = STONE.offsetStone; break;
            case TYPE.soil : offset = STONE.offsetSoil; break;
        }
        while (y < 200) { console.log('add y', y)
            while (x < screenData.centerX) {
                this.setUpStone(x, y, offset, type)
                x += offset * 1.6
            }
            y += offset * 1.2
            x = -screenData.centerX
        }
        tickerAdd(this)
        console.log('Stones created:', this.stones.length, 'Pull size:', this.pull.length)
    }

    setUpStone(x, y, offset, type) {
        const isFromPull = this.pull.length > 0
        const stone = isFromPull ? this.pull.pop() : createStone(type)
        if (isFromPull) stone.texture = atlases.ground.textures[ 'part_' + type ]
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

    tick(delta) { console.log('add stones tick')
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