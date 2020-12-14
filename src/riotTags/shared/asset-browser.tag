asset-browser.flexfix
    .flexfix-header
        .nogrow
            h1
                virtual(each="{piece in breadcrumbs}")
                    span(onclick="{navigateTo(piece.path)}")
                    |
                    |
                    svg.feather.dim
                        use(xlink:href="data/icons.svg#chevron-right")
                span {currentFolderName}
                .anActionableIcon
                    svg.feather.dim(onclick="{navigateUp}")
                        use(xlink:href="data/icons.svg#chevron-up")
        .filler
        .nogrow
            button
                svg.feather.dim(onclick="{navigateUp}")
                    use(xlink:href="data/icons.svg#folder-plus")
                span {voc.newFolder}
            button
                svg.feather.dim(onclick="{navigateUp}")
                    use(xlink:href="data/icons.svg#plus")
                span {voc.newAsset}
    .flexfix-body
        // Asset cards
        ul.cards(class="{list: localStorage[opts.namespace? (opts.namespace+'Layout') : 'defaultAssetLayout'] === 'list'}")
            li(
                each="{asset in (searchResults? searchResults : collection)}"
                oncontextmenu="{parent.opts.contextmenu && parent.opts.contextmenu(asset)}"
                onlong-press="{parent.opts.contextmenu && parent.opts.contextmenu(asset)}"
                onclick="{parent.opts.click && parent.opts.click(asset)}"
                no-reorder
            )
                span {parent.opts.names? parent.opts.names(asset) : asset.name}
                span.date(if="{asset.lastmod}") {niceTime(asset.lastmod)}
                img(if="{parent.opts.thumbnails}" src="{parent.opts.thumbnails(asset)}")
    // Bottom row
    .flexfix-footer.flexrow
        .nogrow
            // Filter settings
            h3 {voc.filterHeader}
            - var assetTypes = ['all', 'textures', 'styles', 'tandems', 'sounds', 'types', 'rooms']
            for type in assetTypes
                label.checkbox
                    input(type="checkbox" value=type checked=`{filter.incudes('${key}')}` onchange="{toggleFilter('${key}')}")
                    span=`{voc.assetTypes.${type}}`
        .filler
        .nogrow
            // Search
            .aSearchWrap
                input.inline(type="text" onkeyup="{fuseSearch}")
                svg.feather
                    use(xlink:href="data/icons.svg#search")
            .spacer
            // layout picker
            button.inline.square(onclick="{switchLayout}")
                svg.feather
                    use(xlink:href="data/icons.svg#{localStorage[opts.namespace? (opts.namespace+'Layout') : 'defaultAssetLayout'] === 'list'? 'grid' : 'list'}")
            .spacer
            // Sort options
            button.inline.square(
                onclick="{switchSort('date')}"
                class="{selected: sort === 'date' && !searchResults}"
            )
                svg.feather
                    use(xlink:href="data/icons.svg#clock")
            button.inline.square(
                onclick="{switchSort('name')}"
                class="{selected: sort === 'name' && !searchResults}"
            )
                svg.feather
                    use(xlink:href="data/icons.svg#sort-alphabetically")
    script
        this.filter = ['all'];
        this.toggleFilter = type => () => {
            if (type === 'all') {
                this.filter = ['all'];
            } else {
                if (this.filter.length === 1 && this.filter[0] === 'all') {
                    this.filter = [type];
                } else if (this.filter.includes(type)) {
                    this.filter.splice(this.filter.indexOf(type), 1);
                } else {
                    this.filter.push(type);
                }
            }
        };