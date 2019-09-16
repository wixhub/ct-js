room-background-editor
    button.aTexturePicker.flexrow.wide(onclick="{onChangeBgTexture}")
        img.nogrow(src="{background.texture === -1? '/img/notexture.png' : (glob.texturemap[background.texture].src.split('?')[0] + '_prev.png?' + glob.texturemap[background.texture].g.lastmod)}")
        span   {voc.changeTexture}

    b {voc.shift}
    .clear
    label.fifty.npl.npt
        input.wide(type="number" value="{background.extends.shiftX || 0}" step="8" oninput="{wire('this.background.extends.shiftX')}")
    label.fifty.npr.npt
        input.wide(type="number" value="{background.extends.shiftY || 0}" step="8" oninput="{wire('this.background.extends.shiftY')}")

    b {voc.scale}
    .clear
    label.fifty.npl.npt
        input.wide(type="number" value="{background.extends.scaleX || 1}" step="0.01" oninput="{wire('this.background.extends.scaleX')}")
    label.fifty.npr.npt
        input.wide(type="number" value="{background.extends.scaleY || 1}" step="0.01" oninput="{wire('this.background.extends.scaleY')}")

    b {voc.movement}
    .clear
    label.fifty.npl.npt
        input.wide(type="number" value="{background.extends.movementX || 0}" step="0.1" oninput="{wire('this.background.extends.movementX')}")
    label.fifty.npr.npt
        input.wide(type="number" value="{background.extends.movementY || 0}" step="0.1" oninput="{wire('this.background.extends.movementY')}")

    b {voc.parallax}
    .clear
    label.fifty.npl.npt
        input.wide(type="number" value="{background.extends.parallaxX || 1}" step="0.01" oninput="{wire('this.background.extends.parallaxX')}")
    label.fifty.npr.npt
        input.wide(type="number" value="{background.extends.parallaxY || 1}" step="0.01" oninput="{wire('this.background.extends.parallaxY')}")
    .clear

    b {voc.repeat}
    select(onchange="{wire('this.background.extends.repeat')}")
        option(value="repeat" selected="{background.extends.repeat === 'repeat'}") repeat
        option(value="repeat-x" selected="{background.extends.repeat === 'repeat-x'}") repeat-x
        option(value="repeat-y" selected="{background.extends.repeat === 'repeat-y'}") repeat-y
        option(value="no-repeat" selected="{background.extends.repeat === 'no-repeat'}") no-repeat

    texture-selector(ref="texturePicker" if="{pickingTexture}" oncancelled="{onTextureCancel}" onselected="{onTextureSelected}")
    script.
        const gui = require('nw.gui');
        const glob = require('./data/node_requires/glob');
        this.glob = glob;
        this.pickingTexture = false;
        this.namespace = 'roombackgrounds';
        this.background = this.opts.layer;
        this.on('update', () => {
            if (this.background !== this.opts.layer) {
                this.background = this.opts.layer;
            }
        });
        this.mixin(window.riotVoc);
        this.mixin(window.riotWired);
        this.onTextureSelected = texture => e => {
            this.background.texture = texture.uid;
            this.pickingTexture = false;
            this.update();
        };
        this.onTextureCancel = e => {
            this.pickingTexture = false;
            this.update();
        };
        this.onChangeBgTexture = e => {
            this.pickingTexture = true;
            this.background = e.item.background;
            this.update();
        };