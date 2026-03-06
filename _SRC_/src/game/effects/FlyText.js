import { Container, Text } from "pixi.js";
import { kill, tickerAdd } from "../../app/application";
import { styles } from "../../app/styles";

export default class FlyText extends Container {
    constructor(text, x, y) {
        super() 
        this.text = new Text({text, style: styles.shineCounter})
        this.text.anchor.set(0.5, 2)
        this.addChild(this.text)

        this.position.set(x,y)

        this.lifeTime = 1000
        this.alphaStep = 0.0006
        this.flySpeed = 0.03

        tickerAdd(this)
    }

    tick(time) {
        this.y -= this.flySpeed * time.deltaMS

        if (this.lifeTime > 0) {
            this.lifeTime -= time.deltaMS
        } else {
            this.alpha -= this.alphaStep * time.deltaMS
            if (this.alpha <= 0) kill(this)
        }
    }
}