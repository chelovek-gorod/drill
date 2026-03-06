import { getDeviceType } from "../app/application"
import { createEnum } from "../utils/functions"

const isMobile = getDeviceType() !== 'desktop'

export const TEXT_GET_FIRST_CLICK = {
    en: isMobile ? 'Tap to start' : 'Click to start',
    ru: 'Нажми, чтобы начать', // универсально
    tr: isMobile ? 'Başlamak için dokun' : 'Başlamak için tıkla',
    es: isMobile ? 'Toca para empezar' : 'Haz clic para empezar',
    de: isMobile ? 'Zum Starten tippen' : 'Zum Starten klicken',
    pt: isMobile ? 'Toque para começar' : 'Clique para começar',
    fr: isMobile ? 'Appuyez pour commencer' : 'Cliquez pour commencer',
    pl: isMobile ? 'Dotknij, aby rozpocząć' : 'Kliknij, aby rozpocząć',
    it: isMobile ? 'Tocca per iniziare' : 'Clicca per iniziare',
    nl: isMobile ? 'Tik om te beginnen' : 'Klik om te beginnen',
    cs: isMobile ? 'Klepněte pro start' : 'Klikněte pro start'
}

export const TEXT_BUTTON_TYPE = createEnum(['START', 'OK', 'RETRY', 'VIEW_AD', 'CANCEL'])
export const TEXT_BUTTON = {
    [TEXT_BUTTON_TYPE.START]: {
        en: 'Play',
        ru: 'Играть',
        tr: 'Oyna',
        es: 'Jugar',
        de: 'Spielen',
        pt: 'Jogar',
        fr: 'Jouer',
        pl: 'Graj',
        it: 'Gioca',
        nl: 'Spelen',
        cs: 'Hrát'
    },
    [TEXT_BUTTON_TYPE.OK]: {
        en: 'Ok',
        ru: 'Хорошо',
        tr: 'Tamam',
        es: 'Ok',
        de: 'Ok',
        pt: 'Ok',
        fr: 'Ok',
        pl: 'Ok',
        it: 'Ok',
        nl: 'Ok',
        cs: 'Ok'
    },
    [TEXT_BUTTON_TYPE.RETRY]: {
        en: 'Again',
        ru: 'Заново',
        tr: 'Tekrar',
        es: 'Otra vez',
        de: 'Nochmal',
        pt: 'Repetir',
        fr: 'Encore',
        pl: 'Jeszcze',
        it: 'Ancora',
        nl: 'Opnieuw',
        cs: 'Znovu'
    },
    [TEXT_BUTTON_TYPE.VIEW_AD]: {
        en: 'Watch',
        ru: 'Смотреть',
        tr: 'İzle',
        es: 'Ver',
        de: 'Ansehen',
        pt: 'Assistir',
        fr: 'Regarder',
        pl: 'Oglądaj',
        it: 'Guarda',
        nl: 'Bekijk',
        cs: 'Sledovat'
    },
    [TEXT_BUTTON_TYPE.CANCEL]: {
        en: 'Cancel',
        ru: 'Отмена',
        tr: 'İptal',
        es: 'Cancelar',
        de: 'Abbrechen',
        pt: 'Cancelar',
        fr: 'Annuler',
        pl: 'Anuluj',
        it: 'Annulla',
        nl: 'Annuleren',
        cs: 'Zrušit'
    }
}

export const TEXT_EMPTY = {
    en: '',
    ru: '',
    tr: '',
    es: '',
    de: '',
    pt: '',
    fr: '',
    pl: '',
    it: '',
    nl: '',
    cs: ''
}