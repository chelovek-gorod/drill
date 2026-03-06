import { tickerAdd, tickerRemove } from "../app/application"

export default function setSmoothShow(target) {
    if ('tick' in target) return console.warn(`${target} already haw property "tick"`)
    if (!('alphaStep' in target)) return console.warn(`${target} doesn't haw property "alphaStep"`)

    if ('delay' in target && 'maxAlpha' in target) target.tick = smoothShowToMaxAlphaWithDelay
    else if ('maxAlpha' in target) target.tick = smoothShowToMaxAlpha
    else if ('delay' in target) target.tick = smoothShowWithDelay
    else target.tick = smoothShow

    tickerAdd(target)
}

function removeSmoothShow(target) {
    tickerRemove(target)
    delete target.tick
}

function smoothShow(delta) {
    if (this.alpha < 1) return this.alpha += this.alphaStep * delta
    
    this.alpha = 1
    removeSmoothShow(this)
}

function smoothShowToMaxAlpha(delta) {
    if (this.alpha < this.maxAlpha) return this.alpha += this.alphaStep * delta
    
    this.alpha = this.maxAlpha
    removeSmoothShow(this)
}

function smoothShowWithDelay(delta) {
    if (this.delay > 0) return this.delay -= delta

    if (this.alpha < 1) return this.alpha += this.alphaStep * delta
    
    this.alpha = 1
    removeSmoothShow(this)
}

function smoothShowToMaxAlphaWithDelay(delta) {
    if (this.delay > 0) return this.delay -= delta

    if (this.alpha < this.maxAlpha) return this.alpha += this.alphaStep * delta
    
    this.alpha = this.maxAlpha
    removeSmoothShow(this)
}