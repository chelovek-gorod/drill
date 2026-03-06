import { Container, MeshSimple } from "pixi.js";
import { tickerAdd } from "../../../app/application";
import { images } from "../../../app/assets";


export default class Title extends Container {
    constructor() {
        super()

        this.halfW = images.game_title.width * 0.5
        this.halfH = images.game_title.height * 0.5

        this.mash = new MeshSimple({
            texture: images.game_title,
            vertices: new Float32Array([
                -this.halfW, -this.halfH, // 0: TL
                 this.halfW, -this.halfH, // 1: TR
                 this.halfW,  this.halfH, // 2: BR
                -this.halfW,  this.halfH  // 3: BL
            ]),
            uvs: new Float32Array([
                0, 0,
                1, 0,
                1, 1,
                0, 1
            ])
        })

        this.addChild(this.mash)

        this.time = 0
        this.speed = 0.0012 // Немного замедлим для плавности
        this.perspective = 0.06 // Сила искажения (0.1 - 0.3 обычно достаточно)

        tickerAdd(this)
    }

    tick(time) {
        this.time += this.speed * time.deltaMS

        // уменьшаем в 4 раза степень искажения
        const maxRotation = 0.25;
        // Коэффициент поворота от -1 до 1 * maxRotation
        const rotationY = Math.sin(this.time) * maxRotation
        
        // Текущая видимая ширина (сужение по X)
        const currentHalfW = this.halfW * Math.cos(rotationY)
        
        // Вычисляем разницу высоты для эффекта перспективы
        // Когда одна сторона "ближе", она чуть больше, когда "дальше" — меньше.
        const perspectiveOffset = Math.sin(rotationY) * (this.halfH * this.perspective)

        const v = this.mash.vertices

        // Левые точки (0 и 3)
        v[0] = -currentHalfW            // Top Left X
        v[1] = -this.halfH - perspectiveOffset // Top Left Y
        v[6] = -currentHalfW               // Bottom Left X
        v[7] =  this.halfH + perspectiveOffset // Bottom Left Y

        // Правые точки (1 и 2)
        v[2] =  currentHalfW              // Top Right X
        v[3] = -this.halfH + perspectiveOffset // Top Right Y
        v[4] =  currentHalfW             // Bottom Right X
        v[5] =  this.halfH - perspectiveOffset // Bottom Right Y
        
        // В PixiJS 8 изменения в массиве Float32Array внутри меша 
        // обычно подхватываются автоматически, если меш стоит в сцене.
    }
}