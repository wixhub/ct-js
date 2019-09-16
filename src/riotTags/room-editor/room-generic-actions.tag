room-generic-actions
    button.wide(onclick="{duplicateLayer}")
        i.icon-copy
        | {voc.genericLayerActions.duplicate}
    button.wide(onclick="{deleteLayer}")
        i.icon-trash
        | {voc.genericLayerActions.delete}
    script.
        this.namespace = 'roomview';
        this.mixin(window.riotVoc);
        this.duplicateLayer = e => {
            // TODO:
        };
        this.deleteLayer = e => {
            // TODO:
        };