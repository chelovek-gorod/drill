export const assetType = {
    images : 'images',
    atlases: 'atlases',
    sounds : 'sounds',
    music : 'music',
    fonts : 'fonts',
}

export const path = {
    images : './images/',
    atlases: './atlases/',
    sounds : './sounds/',
    music : './music/',
    fonts : './fonts/',
}
export const fonts = {
    Title: 'RubikMonoOne-Regular.ttf',
    Pen: 'kom-post.ttf',
    Bold: 'Outfit-Bold.ttf',
    Light: 'Outfit-Light.ttf',
    Regular: 'Outfit-Regular.ttf',
}

export const images = {
    logo: 'logo.png',

    button: 'button.png',
    button_hover: 'button_hover.png',

    bg_top: 'bg0.png',
    bg1: 'bg1.png',
    bg2: 'bg2.png',
}
export const atlases = {
    bot: 'bot.json',
    ground: 'ground.json',
    smoke: 'smoke.json',
}
export const sounds = {
    se_hover: 'se_hover.mp3',
    se_click: 'se_click.mp3',
    se_drill: 'se_drill.mp3',
    se_drill_start: 'se_drill_start.mp3',
    se_drill_loop: 'se_drill_loop.mp3',
    se_drill_end: 'se_drill_end.mp3',
    se_bot_landing: 'se_bot_landing.mp3',
}
export const music = {
    bgm_0: 'bgm_0.mp3',
    bgm_1: 'bgm_1.mp3',
    bgm_2: 'bgm_2.mp3',
    bgm_3: 'bgm_3.mp3',
    bgm_4: 'bgm_4.mp3',
}

export const assets = {fonts, images, atlases, sounds, music}
for (let assetType in assets) {
    for (let key in assets[assetType]) {
        assets[assetType][key] = path[assetType] + assets[assetType][key]
    }
}

// check duplicated keys
const allKeys = new Map()
const duplicates = new Set()

for (const [assetTypeName, assetCollection] of Object.entries(assets)) {
    for (const key of Object.keys(assetCollection)) {
        if (allKeys.has(key)) duplicates.add(key)
        allKeys.set(key, assetTypeName)
    }
}

if (duplicates.size > 0) {
    const duplicateDetails = Array.from(duplicates).map(key => {
        const types = []
        for (const [typeName, assetCollection] of Object.entries(assets)) {
            if (Object.prototype.hasOwnProperty.call(assetCollection, key)) {
                types.push(typeName)
            }
        }
        return `"${key}" (${types.join(', ')})`
    }).join(', ')
    
    throw new Error(`Duplicate asset keys detected: ${duplicateDetails}`)
}