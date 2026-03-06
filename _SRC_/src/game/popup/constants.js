import { createEnum } from "../../utils/functions"

export const POPUP_TYPE =  createEnum([
    'TASK',
    'INFO',
    'HELP',
    'RESULT',
    'NEW',
    'SETTINGS',
    'AD',
    'ERROR',
    'ALL_PETS'
])
export const POPUP_HELP_TYPE =  createEnum(['DRAGON_ADD', 'DRAGON_USE'])
export const POPUP_AD_TYPE =  createEnum(['DRAGON', 'SPARKS'])