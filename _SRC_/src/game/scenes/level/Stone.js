import { Sprite } from "pixi.js";
import { kill, tickerAdd } from "../../../app/application";
import { atlases } from "../../../app/assets";
import { createEnum } from "../../../utils/functions";

// Константы физики
const GRAVITY = 0.003
const FADE_SPEED = 0.003
const ROTATION_DAMPING = 0.6
const DAMPING_PER_MS = Math.pow(ROTATION_DAMPING, 1 / 16.67)

// Константы скорости (пиксели/мс)
const VELOCITY_X_MIN = 0.3
const VELOCITY_X_MAX = 0.6
const VELOCITY_Y_MIN = 0.6
const VELOCITY_Y_MAX = 1.2
const VELOCITY_X_RANGE = VELOCITY_X_MAX - VELOCITY_X_MIN
const VELOCITY_Y_RANGE = VELOCITY_Y_MAX - VELOCITY_Y_MIN

// Константы вращения (радианы/мс)
const ROTATION_SPEED_MIN = 0.003
const ROTATION_SPEED_MAX = 0.012
const ROTATION_SPEED_RANGE = ROTATION_SPEED_MAX - ROTATION_SPEED_MIN

// Математические константы
const TWO_PI = Math.PI * 2

let direction = Math.random() > 0.5 ? 1 : -1

export default class Stone extends Sprite {
    constructor(x, y, type) {
        super( atlases.ground.textures[ 'part_' + type ] )
        
        this.direction = direction
        direction *= -1
        
        this.anchor.set(0.5)
        this.position.set(x, y)
        
        // Предвычисляем случайные значения
        const randX = Math.random() * VELOCITY_X_RANGE + VELOCITY_X_MIN
        const randY = Math.random() * VELOCITY_Y_RANGE + VELOCITY_Y_MIN
        const randRot = Math.random() * ROTATION_SPEED_RANGE + ROTATION_SPEED_MIN
        
        this.velocity = {
            x: this.direction * randX,
            y: -randY
        }
        this.rotationSpeed = this.direction * randRot
        this.rotation = Math.random() * TWO_PI
        
        this.isFalling = false
        this.alpha = 1
        
        // Для проверки 180 градусов
        this.startY = y
        
        tickerAdd(this)
    }
    
    tick(delta) {
        if (this.isFalling) {
            this.updateFalling(delta)
        } else {
            this.updateArc(delta)
        }
    }
    
    updateArc(delta) {
        // Физика
        this.velocity.y += GRAVITY * delta
        this.x += this.velocity.x * delta
        this.y += this.velocity.y * delta
        
        // Вращение
        this.rotation += this.rotationSpeed * delta
        
        // Проверка прохождения половины окружности
        if (!this.isFalling && this.velocity.y > 0 && this.y > this.startY) {
            this.isFalling = true
            this.velocity.x = 0
        }
    }
    
    updateFalling(delta) {
        // Падение
        this.velocity.y += GRAVITY * delta
        this.y += this.velocity.y * delta
        
        // Замедление вращения
        this.rotationSpeed *= Math.pow(DAMPING_PER_MS, delta)
        this.rotation += this.rotationSpeed * delta
        
        // Исчезновение
        this.alpha -= FADE_SPEED * delta
        if (this.alpha <= 0) kill(this)
    }
}