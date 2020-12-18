const defaultProjectTemplate: IProject = {
    ctjsVersion: process.versions.ctjs,
    notes: '/* empty */',
    // Ct.js' themeDay colors
    palette: ['#446adb', '#5144db', '#44dbb5', '#4ab660', '#ff9748', '#d44f57'],
    startroom: -1,
    libs: {
        place: {
            gridX: 1024,
            gridY: 1024
        },
        fittoscreen: {
            mode: 'scaleFit'
        },
        mouse: {},
        keyboard: {},
        'sound.howler': {}
    },
    settings: {
        authoring: {
            author: '',
            site: '',
            title: '',
            version: [0, 0, 0],
            versionPostfix: ''
        },
        rendering: {
            usePixiLegacy: true,
            maxFPS: 60,
            pixelatedrender: false,
            highDensity: true,
            desktopMode: 'maximized',
            hideCursor: false
        },
        export: {
            windows: true,
            linux: true,
            mac: true,
            functionWrap: false,
            codeModifier: 'none'
        },
        branding: {
            icon: -1,
            accent: '#446adb', // ct.js' crystal blue
            invertPreloaderScheme: true
        }
    }
};

export class defaultProject {
    static get(): IProject {
        return JSON.parse(JSON.stringify(defaultProjectTemplate));
    }
}
