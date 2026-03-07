import { Particle, ParticleContainer } from "pixi.js"
import { tickerAdd, tickerRemove } from "../../../app/application"
import { images } from "../../../app/assets"
import { EventHub, events } from "../../../app/events"
import { getRandom } from "../../../utils/functions"

const _2PI = Math.PI * 2

// соотношение типов искр
const BIG_RATIO = 0.2 // 30% большие искры
const SMALL_RATIO = 0.8 // 70% микро искры

// масштаб
const SCALE_BIG_MIN = 0.5
const SCALE_BIG_MAX = 0.7

const SCALE_SMALL_MIN = 0.1
const SCALE_SMALL_MAX = 0.3

// скорость разлета
const SPEED_BIG_MIN = 0.3
const SPEED_BIG_MAX = 0.8
const SPEED_SMALL_MIN = 0.5
const SPEED_SMALL_MAX = 1.2

// гравитация
const GRAVITY = 0.0012

// скорость вращения
const ROT_SPEED_MIN = -0.012
const ROT_SPEED_MAX = 0.012

// затухание
const ALPHA_DECAY_BIG_MIN = 0.0006
const ALPHA_DECAY_BIG_MAX = 0.0010
const ALPHA_DECAY_SMALL_MIN = 0.0008
const ALPHA_DECAY_SMALL_MAX = 0.0014

// цвет искр
const SPARK_COLORS = [
    0xfff6a3,
    0xffc34d,
    0xff8a00,
    0xff3b00
]

// максимальный пул
const POOL_SIZE = 400

function createSpark() {
    const spark = new Particle({
        texture: images.spark,
        x: 0,
        y: 0,
        anchorX: 0.5,
        anchorY: 0.5,
        scaleX: 1,
        scaleY: 1,
        rotation: 0,
        alpha: 1
    })

    spark.data = {}
    return spark
}

export default class SparksParticles {
    constructor() {
        this.container = new ParticleContainer({
            dynamicProperties: {
                position: true,
                rotation: true,
                scale: true,
                alpha: true,
                color: true
            }
        })

        this.container.blendMode = "add"

        this.pool = []
        this.sparks = []

        for (let i = 0; i < POOL_SIZE; i++) {
            this.pool.push(createSpark())
        }

        EventHub.on( events.addSparks, this.addSparks, this )
    }

    addSparks(data) { // {x, y, count, angle, spread}
        const bigCount = Math.ceil(data.count * BIG_RATIO)
        const smallCount = Math.floor(data.count * SMALL_RATIO)

        for (let i = 0; i < bigCount; i++) {
            this.setupSpark(data.x, data.y, data.angle, data.spread, true)
        }

        for (let i = 0; i < smallCount; i++) {
            this.setupSpark(data.x, data.y, data.angle, data.spread, false)
        }

        tickerAdd(this)
    }

    setupSpark(x, y, baseAngle, spread, isBig) {
        const spark = this.pool.length ? this.pool.pop() : createSpark()

        spark.x = x
        spark.y = y

        const angle = baseAngle + (Math.random() - 0.5) * spread

        const speed = isBig
            ? getRandom(SPEED_BIG_MIN, SPEED_BIG_MAX)
            : getRandom(SPEED_SMALL_MIN, SPEED_SMALL_MAX)

        spark.data.vx = Math.cos(angle) * speed
        spark.data.vy = Math.sin(angle) * speed

        spark.data.gravity = GRAVITY

        spark.data.rotSpeed = getRandom(ROT_SPEED_MIN, ROT_SPEED_MAX)

        spark.data.alphaDecay = isBig
            ? getRandom(ALPHA_DECAY_BIG_MIN, ALPHA_DECAY_BIG_MAX)
            : getRandom(ALPHA_DECAY_SMALL_MIN, ALPHA_DECAY_SMALL_MAX)

        const scale = isBig
            ? getRandom(SCALE_BIG_MIN, SCALE_BIG_MAX)
            : getRandom(SCALE_SMALL_MIN, SCALE_SMALL_MAX)

        spark.scaleX = scale // * (isBig ? 1.2 : 1)
        spark.scaleY = scale // * (isBig ? 0.5 : 1)

        spark.rotation = Math.random() * _2PI
        spark.tint = SPARK_COLORS[(Math.random() * SPARK_COLORS.length) | 0]
        spark.alpha = 1

        this.container.addParticle(spark)
        this.sparks.push(spark)
    }

    tick(delta) {
        const sparks = this.sparks

        for (let i = sparks.length - 1; i >= 0; i--) {
            const spark = sparks[i]
            const data = spark.data

            spark.x += data.vx * delta
            spark.y += data.vy * delta

            data.vy += data.gravity * delta

            spark.rotation += data.rotSpeed * delta
            spark.alpha = Math.max(0, spark.alpha - data.alphaDecay * delta)

            spark.scaleX *= spark.alpha
            spark.scaleY *= spark.alpha

            if (spark.alpha === 0) {
                this.container.removeParticle(spark)

                this.pool.push(spark)

                sparks[i] = sparks[sparks.length - 1]
                sparks.pop()
            }
        }

        if (sparks.length === 0) {
            tickerRemove(this)
        }
    }

    kill() {
        EventHub.off( events.addSparks, this.addSparks, this )
        tickerRemove(this)

        if (this.container) {
            this.container.destroy({ children: true })
            this.container = null
        }

        this.sparks.length = 0
        this.pool.length = 0
    }
}