import { EventEmitter } from "pixi.js"
import { createEnum } from "../utils/functions"

export const EventHub = new EventEmitter()

export const events = createEnum([
    'screenResize',
    'changeFocus',

    'gamePause',
    'gameResume',

    'startScene',

    'updateLanguage',

    'shakeScreen',
    'scrollBg',
    'addStones',
    'addSparks',
    'landingOnLayer',
    'layerCleared',
    'layerSetDamage',
    'botLandingDone',
])

export function screenResize( data ) {
    EventHub.emit( events.screenResize, data )
}
export function changeFocus( isOnFocus ) {
    EventHub.emit( events.changeFocus, isOnFocus )
}
export function gamePause() {
    EventHub.emit( events.gamePause )
}
export function gameResume() {
    EventHub.emit( events.gameResume )
}

export function startScene( sceneName ) {
    EventHub.emit( events.startScene, sceneName )
}

export function updateLanguage( currentLanguageCode ) {
    EventHub.emit( events.updateLanguage, currentLanguageCode )
}

export function shakeScreen( data ) {
    EventHub.emit( events.shakeScreen, data )
}

export function scrollBg( data ) {
    EventHub.emit( events.scrollBg, data )
}

export function addStones( type ) {
    EventHub.emit( events.addStones, type )
}
export function addSparks(data) {
    EventHub.emit( events.addSparks, data )
}

export function landingOnLayer(type) {
    EventHub.emit( events.landingOnLayer, type )
}

export function layerCleared() {
    EventHub.emit( events.layerCleared )
}

export function layerSetDamage(value) {
    EventHub.emit( events.layerSetDamage, value )
}

export function botLandingDone() {
    EventHub.emit( events.botLandingDone )
}