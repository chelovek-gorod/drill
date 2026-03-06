const MOCK_LANGUAGE = 'ru'
const MOCK_STORAGE_KEY = 'test-04'

/**
 * Моковый SDK для тестирования
 * @class
 * @param {function} readyCallback - вызывается сразу
 * @param {function} getStateForSaveCallback - возвращает данные для сохранения
 * @param {function} setSavedStateCallback - принимает загруженные данные
 * @param {Array} leaderboardNames - не используется
 */
export default class LocalMockSDK {
    constructor(
            readyCallback = null,
            getStateForSaveCallback = null,
            setSavedStateCallback = null,
            leaderboardNames = []
        ) {

        this._getStateForSaveCallback = getStateForSaveCallback
        this._setSavedStateCallback = setSavedStateCallback

        // Сохранение при закрытии окна
        if (getStateForSaveCallback) {
            window.addEventListener('beforeunload', () => {
                const data = getStateForSaveCallback()
                localStorage.setItem(MOCK_STORAGE_KEY, JSON.stringify(data))
            })
            
            // Потеря фокуса (для iOS)
            document.addEventListener('visibilitychange', () => {
                if (document.visibilityState === 'hidden') {
                    const data = getStateForSaveCallback()
                    localStorage.setItem(MOCK_STORAGE_KEY, JSON.stringify(data))
                }
            })
        }

        // Вызываем readyCallback сразу
        if (readyCallback) setTimeout( () => readyCallback(), 0 )
    }

    // ===== ПУБЛИЧНЫЕ МЕТОДЫ =====

    gameReady() {
        // Пустышка
    }

    getLanguageCode() {
        return MOCK_LANGUAGE
    }

    getSavedData() {
        if (!this._setSavedStateCallback) return
        
        const savedData = localStorage.getItem(MOCK_STORAGE_KEY)
        this._setSavedStateCallback(savedData ? JSON.parse(savedData) : {})
    }

    save() {
        if (!this._getStateForSaveCallback) return
        
        const data = this._getStateForSaveCallback()
        localStorage.setItem(MOCK_STORAGE_KEY, JSON.stringify(data))
    }

    showFullScreenAd(callback = null) {
        alert('showFullScreenAd')
        if (callback) callback()
    }

    showRewardAd(callback = null) {
        const reward = confirm('showRewardAd')
        if (callback) callback(!!reward)
    }
}