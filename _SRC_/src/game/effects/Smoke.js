import { AnimatedSprite } from "pixi.js";
import { kill } from "../../app/application";
import { atlases } from "../../app/assets";

export default class Smoke extends AnimatedSprite {
    constructor(x, y) {
        super(atlases.smoke.animations.go)

        //this.blendMode = 'multiply'

        this.anchor.set(0.5)
        this.position.set(x, y)
        this.rotation = Math.random() * (Math.PI * 2)
        this.scale.set( 1 + Math.random() )
        this.alpha = 0.4 + Math.random() * 0.4

        this.animationSpeed = 0.5
        this.loop = false
        this.onComplete = () => kill(this)
        this.play()
    }
}