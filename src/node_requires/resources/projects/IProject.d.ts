declare interface IProject {
    ctjsVersion: string,
    notes: string,
    libs: {
        [index: string]: unknown
    },
    palette: Array<string>
    startroom: string | -1
    settings: {
        authoring: {
            author: string,
            site: string,
            title: string,
            version: Array<number>,
            versionPostfix: string
        },
        rendering: {
            usePixiLegacy: boolean,
            maxFPS: number,
            pixelatedrender: boolean,
            highDensity: boolean,
            desktopMode: 'maximized' | 'fullscreen' | 'windowed',
            hideCursor: boolean
        },
        export: {
            windows: boolean
            linux: boolean
            mac: boolean
            functionWrap: boolean
            codeModifier: 'obfuscate' | 'minify' | 'none'
        },
        branding: {
            icon: -1 | string
            accent: string
            invertPreloaderScheme: boolean
        }
    }
}
