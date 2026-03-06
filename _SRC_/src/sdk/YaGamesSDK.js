const SAVE_DELAY_DATA = 4000 // частота сохранения строковых
const SAVE_DELAY_LB_DATA = 2000 // частота сохранения значений в лидерборд
const GET_DELAY_LB_DATA = 16000 // частота запросов данных из лидерборд
const INIT_DELAY = 100 // кастомная задержка повтора инициализации

/**
 * Универсальный Yandex SDK для интеграции с Яндекс Играми
 * @class
 * @param {function} readyCallback 
 * @param {function} getStateForSaveCallback
 * @param {function} setSavedStateCallback
 * @param leaderboardNames: []
 */
export default class YaGamesSDK {
    constructor(
            readyCallback = null,
            getStateForSaveCallback = null,
            setSavedStateCallback = null,
            leaderboardNames = []
        ) {

        this._readyCallback = readyCallback
        this._getStateForSaveCallback = getStateForSaveCallback
        this._setSavedStateCallback = setSavedStateCallback
        this._leaderboardNames = leaderboardNames
        this._isSaveUsed = this._getStateForSaveCallback && this._setSavedStateCallback

        this._isReady = false // this.SDK, this.player, ?this.leaderboard

        this._SDK = null        
        // this.SDK.environment.i18n.lang - код языка
        // this.SDK.features.LoadingAPI?.ready() - игра готова к взаимодействию с игроком
        // this.SDK.features.GameplayAPI?.start() - Сообщаем о старте геймплея
        // this.SDK.features.GameplayAPI?.stop() - Сообщаем об остановке геймплея

        this._player = null
        // this.player.isAuthorized() -> прямой вызов без промиса, вернет true / false
        /* this.SDK.auth.openAuthDialog().then(() => {
                    this.initPlayer() // нужна повторная инициализация
                }).catch(() => {
                    // Игрок не авторизован.
                });
        */
        // !!! Для работы с SDK.leaderboards важно что бы игрок был авторизирован
        // SDK.leaderboards.getDescription('leaderboard2021').then(res => console.log(res))
        /*
            res = {
                appID: string,
                dеfault: boolean, // Если true, то лидерборд является основным.
                description: {
                    invert_sort_order: boolean, // true — места отсортированы по возрастанию.
                    score_format: {
                        options: {
                            decimal_offset: integer // Размер десятичной части счета.
                            // при decimal_offset: 2 число 1234 будет отображаться как 12.34.
                        },
                        type: string // Тип результата: numeric (число), time (миллисекунды).
                    }
                },
                name: string, // Имя лидерборда.
                title: {
                    // Локализованные названия.
                    en: string,
                    ru: string
                }
            }
        */
        // SDK.leaderboards.setScore( leaderboardName: string, score: number, ?extraData: string )
        // SDK.leaderboards.getPlayerEntry('leaderboard2021').then(res => console.log(res))
        /* .catch(err => {
            if (err.code === 'LEADERBOARD_PLAYER_NOT_PRESENT') {
            // Срабатывает, если у игрока нет записи в лидерборде.
            }
        }); */
        /*
            res = {
                score: integer, //  Если тип — time, то значения передавать в миллисекундах.
                extraData: string,
                rank: integer, // 
                player: {
                    // Возвращает URL аватара пользователя. Возможные size: small, medium и large.
                    getAvatarSrc: (size: string) => string,

                    // Возвращает srcset аватара пользователя для дисплеев Retina.
                    // Возможные значения size: small, medium и large.
                    getAvatarSrcSet: (size: string) => string,

                    lang: string,
                    publicName: string,
                    scopePermissions: {
                        avatar: string,
                        public_name: string
                    },
                    uniqueID: string,
                },
                formattedScore: string
            }
        */
        // SDK.leaderboards.getEntries(leaderboardName: string, includeData: object).then(res => res)
        /* includeData = { includeUser: boolean, quantityAround: integer, quantityTop: integer }
            includeUser -> true — включать в ответ пользователя, false (по умолчанию) — не включать.
            quantityAround -> Число записей ниже и выше пользователя по LB, которое нужно вернуть.
            Минимальное значение — 1, максимальное — 10. По умолчанию возвращается 5.
            quantityTop -> Число записей из топа LB. Мин — 1, макс — 20. По умолчанию - 5.

            res = {
                leaderboard: {
                    ...
                },
                ranges: [
                    {
                        start: integer,
                        size: integer
                    }
                ],
                userRank: integer,
                entries: [
                    {
                        score: integer,
                        extraData: string,
                        rank: integer,
                        player: {
                            getAvatarSrc: (size: string) => string,
                            getAvatarSrcSet: (size: string) => string,
                            lang: string,
                            publicName: string,
                            scopePermissions: {
                                avatar: string,
                                public_name: string
                            },
                            uniqueID: string,
                        },
                        formattedScore: string
                    },
                    ...
                ]
            }
        */

        /*
        // this.SDK.adv инициализируется при инициализации SDK
        this.SDK.adv.showFullscreenAdv({
            callbacks: {
                onOpen: function() {
                // Действие после открытия рекламы.
                },
                onClose: function(wasShown) {
                // Действие после закрытия рекламы.
                },
                onError: function(error) {
                // Действие в случае ошибки.
                },
            }
        })
        this.SDK.adv.showRewardedVideo({
            callbacks: {
                onOpen: () => {
                console.log('Video ad open.');
                },
                onRewarded: () => {
                console.log('Rewarded!');
                },
                onClose: () => {
                console.log('Video ad closed.');
                },
                onError: (e) => {
                console.log('Error while open video ad:', e);
                },
            }
        })
        */

        this._saveTimerData = {
            timeout: null,
            isLoad: this._isSaveUsed,
            isSave: false
        }
        this._initTimer = setTimeout(() => this._initSDK(), 0)

        // Настраиваем обработчики для сохранения при закрытии
        if (this._isSaveUsed) {
            this._isFlushSavingEmit = false
            window.addEventListener('beforeunload', () => this._flushSaving() )
            document.addEventListener('visibilitychange', () => this._flushSaving() )
        }
    }

    /**
     * Сохранение при закрытии окна (потеря видимости = закрытие для IOS)
     * @private
     */
    _flushSaving() {
        if (document.visibilityState === 'visible') {
            this._isFlushSavingEmit = false
            return
        }

        if (this._isFlushSavingEmit || !this._player) return

        this._handleSave( true )
    }

    /**
     * инициализируем SDK
     * @private
     */
    _initSDK() {
        if(!YaGames) return this._initTimer = setTimeout(() => this._initSDK(), INIT_DELAY)

        YaGames.init().then( SDK => {
            clearTimeout( this._initTimer )
            this._SDK = SDK
            this._initPlayer()
        }).catch( e => this._initTimer = setTimeout(() => this._initSDK(), INIT_DELAY))
    }

    /**
     * инициализируем игрока
     * @private
     */
    _initPlayer() {
        // для лидербордов и инап покупок нужен signed параметр
        const parameterPlayer = this._leaderboardNames.length === 0 ? {} : { signed: true }
        this._SDK.getPlayer(parameterPlayer).then( player => {
            clearTimeout( this._initTimer )
            this._player = player
            if (this._leaderboardNames.length) {
                this._initLeaderboard()
            } else {
                this._isReady = true
                if (this._readyCallback) this._readyCallback()
            }
        }).catch( e => this._initTimer = setTimeout(() => this._initPlayer(), INIT_DELAY))
    }

    /**
     * инициализируем игрока
     * @private
     */
    _initLeaderboard() {
        /* заглушка */
        clearTimeout( this._initTimer )
        this._isReady = true
        if (this._readyCallback) this._readyCallback()
        /*
        this._SDK._getPlayer().then( player => {
            clearTimeout( this._initTimer )
            this.player = player
            this.isReady = true
            if (this.readyCallback) this.readyCallback()
        }).catch( e => this._initTimer = setTimeout(() => this.initLeaderboard(), INIT_DELAY))
        */
    }

    gameReady() {
        if (this._SDK && 'features' in this._SDK && 'LoadingAPI' in this._SDK.features) {
            this._SDK.features.LoadingAPI.ready()
        } else {
            console.warn('*** can not call SDK.gameReady() ***')
            this._initTimer = setTimeout(() => this.gameReady(), 1000)
        }
    }

    getLanguageCode() {
        try {
            return this?._SDK?.environment?.i18n?.lang ?? null
        } catch {
            return null
        }
    }

    getSavedData() {
        if (!this._setSavedStateCallback) return

        this._saveTimerData.isLoad = true
        if (this._saveTimerData.timeout === null) this._handleSave()
    }

    save() {
        if (!this._getStateForSaveCallback || !this._player) return

        this._saveTimerData.isSave = true
        if (this._saveTimerData.timeout === null) {
            this._saveTimerData.timeout = setTimeout(
                () => this._handleSave(), SAVE_DELAY_DATA
            )
        }
    }

    /**
     * инициализируем игрока
     * @private
     */
    _handleSave( isFlush = false ) {
        if (!this._player) {
            this._saveTimerData.timeout = setTimeout(
                () => this._handleSave(), SAVE_DELAY_DATA
            )
            return
        }

        clearTimeout(this._saveTimerData.timeout)
        this._saveTimerData.timeout = null

        // приоритет на загрузку, так как загрузка важна при старте
        if (this._saveTimerData.isLoad) {
            this._player.getData().then( (data) => {
                this._saveTimerData.isLoad = false
                this._setSavedStateCallback(data)

                // если есть запрос на сохранение
                if (this._saveTimerData.isSave) {
                    this._saveTimerData.timeout = setTimeout(
                        () => this._handleSave(), SAVE_DELAY_DATA
                    )
                } else {
                    clearTimeout(this._saveTimerData.timeout)
                    this._saveTimerData.timeout = null
                }
            // ошибка загрузки - повторяем вызов через таймаут
            }).catch( (error) => {
                this._saveTimerData.timeout = setTimeout(
                    () => this._handleSave(), SAVE_DELAY_DATA
                )
            })

            return
        } 
        
        // отправка сохранений
        if (this._saveTimerData.isSave) {
            this._saveTimerData.isSave = false
            this._player.setData( this._getStateForSaveCallback(), isFlush ).catch( (error) => {
                this._saveTimerData.isSave = true
                this._saveTimerData.timeout = setTimeout(
                    () => this._handleSave(), SAVE_DELAY_DATA
                )
            })
        }
    }

    showFullScreenAd( callback = null ) {
        if (!this._SDK) return

        this._SDK.features?.GameplayAPI?.stop()
        this._SDK.adv.showFullscreenAdv({
            callbacks: {
                // onOpen: () => { console.log('Video ad open.'); },
                onClose: () => {
                    this?._SDK?.features?.GameplayAPI?.start()
                    callback()
                },
                onError: (e) => {
                    this?._SDK?.features?.GameplayAPI?.start()
                    callback()
                }
            }
        })
    }

    showRewardAd( callback = null ) {
        if (!this._SDK) return

        this._SDK.features?.GameplayAPI?.stop()
        this._SDK.adv.showRewardedVideo({
            callbacks: {
                // onOpen: () => { console.log('Video ad open.'); },
                onRewarded: () => {
                    this?._SDK?.features?.GameplayAPI?.start()
                    callback(true)
                },
                onClose: () => {
                    this?._SDK?.features?.GameplayAPI?.start()
                    callback(false)
                },
                onError: (e) => {
                    this?._SDK?.features?.GameplayAPI?.start()
                    callback(false)
                }
            }
        })
    }
}