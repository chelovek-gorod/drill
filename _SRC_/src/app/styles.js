import { TextStyle, FillGradient } from "pixi.js"
import { fonts } from "./assets"

const fillSubtitleGradient = new FillGradient({
    type: 'linear',
    colorStops: [
      { offset: 0,    color: '#ffffff' },
      { offset: 0.25, color: '#87fff7' },
      { offset: 0.5,  color: '#40ffcf' },
      { offset: 0.75, color: '#87fff7' },
      { offset: 1,    color: '#ffffff' },
    ],
});

const popupTitleGradient = new FillGradient({
    type: 'linear',
    colorStops: [
      { offset: 0,    color: '#0000aa' },
      { offset: 0.5,  color: '#aa00aa' },
      { offset: 1,    color: '#0000aa' },
    ],
});

export let styles = {
    isReady: false, /* if true -> fonts is already loaded */

    /* Font keys (init all fonts in function bellow) */
    loading: null,
    button: null,
    buttonHover: null,
    shineCounter: null,
    taskCount: null,
    cardCount: null,
    popupTitle: null,
    popupDescription: null,
    popupTurnsText: null,
    settingsReset: null,
}

export function initFontStyles() {
    styles.loading = new TextStyle({
        fontFamily: fonts.Pen,
        fontSize: 48,
        fill: '#ffffff',
    
        dropShadow: true,
        dropShadowColor: '#4000ff',
        dropShadowBlur: 6,
        dropShadowAngle: 0,
        dropShadowDistance: 0,
    })

    styles.button = new TextStyle({
        fontFamily: fonts.Pen,
        fontSize: 36,
        fill: '#ffffff',
    })
    styles.buttonHover = new TextStyle({
        fontFamily: fonts.Pen,
        fontSize: 36,
        fill: '#ffffff',
    
        dropShadow: true,
        dropShadowColor: '#770077',
        dropShadowBlur: 6,
        dropShadowAngle: 0,
        dropShadowDistance: 0,
    })

    styles.shineCounter = new TextStyle({
        fontFamily: fonts.Regular,
        fontSize: 32,
        fill: '#ffffff',
        align: 'center',
    
        dropShadow: true,
        dropShadowColor: '#770077',
        dropShadowBlur: 6,
        dropShadowAngle: 0,
        dropShadowDistance: 0,
    })

    styles.cardCount = new TextStyle({
        fontFamily: fonts.Bold,
        fontSize: 36,
        fill: '#ffffff',
        align: 'center',
    
        dropShadow: true,
        dropShadowColor: '#000000',
        dropShadowBlur: 6,
        dropShadowAngle: 0,
        dropShadowDistance: 0,
    })

    styles.taskCount = new TextStyle({
        fontFamily: fonts.Bold,
        fontSize: 40,
        fill: '#ffffff',
        //align: 'center',
    
        dropShadow: true,
        dropShadowColor: '#000000',
        dropShadowBlur: 9,
        dropShadowAngle: 0,
        dropShadowDistance: 0,
    })

    styles.popupTitle = new TextStyle({
        fontFamily: fonts.Bold,
        fontSize: 72,
        fill: popupTitleGradient,
        align: 'center',
        wordWrap: true,
        wordWrapWidth: 700,
        lineHeight: 72,
    })

    styles.popupDescription = new TextStyle({
        fontFamily: fonts.Light,
        fontSize: 32,
        fill: 0xcc00cc,
        align: 'center',
        wordWrap: true,
        wordWrapWidth: 700,
        lineHeight: 32,
    })

    styles.popupTurnsText = new TextStyle({
        fontFamily: fonts.Light,
        fontSize: 40,
        fill: 0xee0000,
    })

    styles.settingsReset = new TextStyle({
        fontFamily: fonts.Light,
        fontSize: 24,
        fill: 0xee0000,
        align: 'right',
        wordWrap: true,
        wordWrapWidth: 640,
        lineHeight: 24,
    })

    styles.isReady = true

    // EXAMPLES
    /*
    gradientText: new TextStyle({
        fontFamily: fonts.RobotoBlack,
        fontSize: 32,
        fill: '#000000',

        align: 'center',
        
        wordWrap: true,
        wordWrapWidth: 440,
        //breakWords: true,
        lineJoin: 'round',

        stroke: {
            color: 0x000000,
            width: 2
        }

        dropShadow: true,
        dropShadowColor: '#ffffff',
        dropShadowBlur: 6,
        dropShadowAngle: 0,
        dropShadowDistance: 0,

        wordWrap: true,
        wordWrapWidth: 400,
    }),
    */
}