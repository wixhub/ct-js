interface IStyleFillSolid {
    type: 0
    color: string
}
interface IStyleFillGradient {
    type: 1
    gradsize: number
    color1: string
    color2: string
    gradtype: number
}
interface IStyleFont {
    family: string,
    italic: boolean,
    weight: fontWeight,
    size: number,
    lineHeight?: number,
    halign: 'left' | 'center' | 'right',
    wrap?: boolean,
    wrapPosition?: number
}
interface IStyleShadow {
    color: string,
    x: number,
    y: number,
    blur: number
}
interface IStyleStroke {
    color: string,
    weight: number
}

interface IStyle extends IAsset {
    fill?: IStyleFillSolid | IStyleFillGradient,
    font?: IStyleFont,
    stroke?: IStyleStroke,
    shadow?: IStyleShadow
}
