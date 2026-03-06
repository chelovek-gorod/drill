import { EventHub, events, gamePause, gameResume } from '../app/events'
import { getSoundData, setStoredSoundData } from '../app/sound'
import LocalMockSDK from '../sdk/LocalMock'
import YaGamesSDK from '../sdk/YaGamesSDK'
import { setLanguage, getLanguage } from './localization'
import { getStateData, setStoredState } from './state'

export let isReadySDK = false

// let SDK = new LocalMockSDK(SDKReadyCallback, SDKgetStateForSave, SDKsetSavedState)
// let SDK = new YaGamesSDK(SDKReadyCallback, SDKgetStateForSave, SDKsetSavedState)

EventHub.on( events.updateMoney, () => updateStoredData() )

export function updateStoredData() {
    if (!isReadySDK) return

    SDK.save()
}

function SDKReadyCallback() {
    const sdkLang = SDK.getLanguageCode()
    if (sdkLang) setLanguage( sdkLang, false)

    SDK.getSavedData()
}

function SDKgetStateForSave() {
    const soundState = getSoundData()
    const gameState = getStateData()

    const currentState = {
        language: getLanguage(),

        // sound
        isSoundOn: soundState.isSoundOn,
        soundVolume: soundState.soundVolume,
        isMusicOn: soundState.isMusicOn,
        musicVolume: soundState.musicVolume,

        // game
        availablePetLevel: gameState.availablePetLevel,
        dragonPointIndex: gameState.dragonPointIndex,
        world: gameState.world,
    }

    return currentState
}

function SDKsetSavedState( savedState ) {
    isReadySDK = true
    
    if ( !savedState || Object.keys( savedState ).length === 0 ) return

    setLanguage( savedState.language, false)
    setStoredSoundData(savedState)
    setStoredState(savedState)
}

export function GameReadySDK() {
    SDK.gameReady()
}
export function showFullScreenAdSDK() {
    gamePause()
    SDK.showFullScreenAd( () => gameResume() )
}
export function showRewardAdSDK( callback ) {
    gamePause()
    SDK.showRewardAd( (isOk) => {
        gameResume()
        /*
        if (isOk) { логика получения награды }
        */
        callback(isOk)
    })
}