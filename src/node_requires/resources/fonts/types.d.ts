type fontCharset = 'punctuation' | 'basicLatin' | 'latinExtended' | 'cyrillic' | 'greekCoptic' | 'custom' | 'allInFont';

interface IFont extends IAsset {
    weight: fontWeight,
    italic: boolean,
    bitmapFont: boolean,
    bitmapFontSize: number,
    bitmapFontLineHeight: number,
    charsets: Array<fontCharset>,
    customCharset: string
}
