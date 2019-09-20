room-generic-actions
    button.wide(onclick="{duplicateLayer}")
        i.icon-copy
        |   {voc.genericLayerActions.duplicate}
    button.wide(onclick="{deleteLayer}")
        i.icon-trash
        |   {voc.genericLayerActions.delete}
    script.
        this.namespace = 'roomview';
        this.mixin(window.riotVoc);
        this.duplicateLayer = e => {
            const duplicate = JSON.parse(JSON.stringify(this.opts.layer)); // I'm lazy
            this.parent.update();
        };
        this.deleteLayer = e => {
            this.opts.room.removeLayer(this.opts.layer);
            this.parent.activeLayer = this.opts.layers[0];
            this.parent.update();
        };