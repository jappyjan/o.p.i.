module.exports = {
    pluginOptions: {
        i18n: {
            locale: 'en',
            fallbackLocale: 'en',
            localeDir: 'locales',
            enableLegacy: false,
            runtimeOnly: false,
            compositionOnly: false,
            fullInstall: true,
        },
    },
    publicPath: process.env.NODE_ENV === 'production'
        ? '/o.p.i./'
        : '/',
    transpileDependencies: ['vuex-persist'],
};
