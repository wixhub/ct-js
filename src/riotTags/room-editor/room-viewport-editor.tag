room-viewport-editor
    b {voc.width}
    input(type="number" value="{opts.layer.width}" onchange="{setWidth}")
    b {voc.height}
    input(type="number" value="{opts.layer.height}" onchange="{setHeight}")
    button.wide(onclick="{setAsDefault}")
        i.icon-play
        |   {voc.setAsDefault}
    script.
        this.namespace = 'roomviews';
        this.mixin(window.riotVoc);

        this.setWidth = e => {
            this.layer.width = Number(e.target.value);
            this.opts.room.templateToLayer(this.opts.layer).redrawFrame();
        };
        this.setHeight = e => {
            this.layer.height = Number(e.target.value);
            this.opts.room.templateToLayer(this.opts.layer).redrawFrame();
        };
        this.setAsDefault = e => {
            this.opts.room.setDefaultViewport(this.layer);
        };