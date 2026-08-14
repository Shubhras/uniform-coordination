const AxiosRequestIntrceptorConfigCallback = (config) => {
    let locale = 'en'

    if (typeof window !== 'undefined') {
        const match = document.cookie.match(/(?:^|; )locale=([^;]*)/)
        if (match) {
            locale = decodeURIComponent(match[1])
        }
    }

    if (!config.headers) {
        config.headers = {}
    }

    if (typeof config.headers.set === 'function') {
        config.headers.set('Accept-Language', locale)
    } else {
        config.headers['Accept-Language'] = locale
    }

    return config
}

export default AxiosRequestIntrceptorConfigCallback
