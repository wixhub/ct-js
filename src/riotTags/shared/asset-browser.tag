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
                onclick="{clickHandler}"
                ondoubleclick="{doubleClickHandler}"
                class="{selected: selection.contains(item)}"
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
            // by date
            button.inline.square(
                onclick="{switchSort('date')}"
                class="{selected: sorting === 'date' && !searchResults}"
                title="{voc.sortByDate}"
            )
                svg.feather
                    use(xlink:href="data/icons.svg#clock")
            // by name
            button.inline.square(
                onclick="{switchSort('name')}"
                class="{selected: sorting === 'name' && !searchResults}"
                title="{voc.sortByName}"
            )
                svg.feather
                    use(xlink:href="data/icons.svg#sort-alphabetically")
            // by type
            button.inline.square(
                onclick="{switchSort('type')}"
                class="{selected: sorting === 'type' && !searchResults}"
                title="{voc.sortByType}"
            )
                svg.feather
                    use(xlink:href="data/icons.svg#x")
    script.
        this.namespace = 'assetViewer';
        this.mixin(window.riotVoc);

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

        const resetSelection = () => {
            this.selection = [];
            this.prevItem = void 0;
        };

        const path = required('path'),
              fs = require('fs-extra');
        const projects = require('./data/node_requires/resources/projects');

        // Navigation stuff
        this.path = './';
        this.navigateTo = p => () => {
            if (path.isAbsolute(p)) {
                throw new Error(`[asset-viewer] Cannot navigate by absolute path. Got ${p}`);
            }
            if (path.normalize(p).startsWith('..')) {
                throw new Error(`[asset-viewer] Cannot navigate to ${p}`);
            }
        };
        this.navigateUp = () => () => {
            if (path.normalize(this.path) !== '.') {
                this.path = path.join(this.path, '..');
            }
            resetSelection();
            rescan();
        };
        this.navigateDown = subfolder => () => {
            this.navigateTo(path.join(this.path, subfolder));
        };

        const getAbsolute = relative => path.join();
        const ctAssetPattern = /^([^\n]+)\.ct([a-z]+)$/; // filename should be at least one symbol
        const ctDataPattern = /^[^\n]+\.ct[a-z]+\.data$/;
        this.rescan = async () => {
            let entries = await fs.readdir(path.join(projects.getProjectPath(), this.path), {
                withFIleTypes: true
            });
            entries = entries.filter(entry =>
                (entry.isDirectory() && !ctDataPattern.test(entry.name)) || // skip data folders
                (entry.isFile() && ctAssetPattern.test(entry.name)) // skip non-ct.js files
            );
            const statPromises = [];
            this.collection = entries.map(entry => {
                let obj;
                // Lazily fetch modification date
                statPromises.push(
                    fs.stat(path.join(this.path, entry.name))
                    .then(result => {
                        obj.lastModified = result.mtime;
                    })
                );
                // Compute primary metadata
                if (entry.isFile()) {
                    const exec = ctAssetPattern.exec(entry.name);
                    obj = {
                        name: exec[1],
                        type: exec[2],
                        path: path.join(this.path, entry.name)
                    };
                } else {
                    return {
                        name: entry.name,
                        type: 'directory',
                        path: path.join(this.path, entry.name)
                    };
                }
                return obj;
            });
            if (this.sorting === 'date') {
                await Promise.all(statPromises);
            }
            this.sort();
            this.update();
        };

        // Sorting logic
        this.sorting = 'name';
        this.sortingFlipped = false;
        const directoriesFirst = (a, b) => {
            if (a.type === 'directory' && b.type !== 'directory') {
                return -1;
            }
            if (b.type === 'directory' && a.type !== 'directory') {
                return 1;
            }
            return 0;
        };
        this.switchSort = type => () => {
            if (type === this.sorting) {
                this.sortingFlipped = !this.sortingFlipped;
            } else {
                this.sortingFlipped = false;
            }
            this.sorting = type;
            this.sort();
        };
        this.sort = () => {
            if (this.sorting === 'name') {
                this.sortByName();
            } else if (this.sorting === 'date') {
                this.sortByDate();
            } else {
                this.sortByType();
            }
        };
        this.sortByName = () => {
            this.collection.sort((a, b) => {
                let d = directoriesFirst(a, b);
                if (d !== 0) {
                    return d;
                }
                if (!this.sortingFlipped) {
                    return a.name.localeCompare(b.name, undefined, {
                        numeric: true
                    });
                }
                return b.name.localeCompare(a.name, undefined, {
                    numeric: true
                });
            });
        };
        this.sortByDate = () => {
            this.collection.sort((a, b) => {
                let d = directoriesFirst(a, b);
                if (d !== 0) {
                    return d;
                }
                if (!this.sortingFlipped) {
                    return a.date - b.date;
                }
                return b.date - a.date;
            });
        };
        this.sortByType = () => {
            this.collection.sort((a, b) => {
                let d = directoriesFirst(a, b);
                if (d !== 0) {
                    return d;
                }
                if (!this.sortingFlipped) {
                    return a.type.localeCompare(b.type);
                }
                return b.type.localeCompare(a.type);
            });
        };

        this.getAssets = () => this.searchResults || this.collection

        this.selection = [];
        this.clickHandler = e => {
            const {asset} = e.item;
            // This part is only for selecting assets. Actions are triggered on double-click
            if (e.shiftKey) {
                // Multiple selection
                const prevIndex = this.getAssets().indexOf(this.prevItem);
                const currentIndex = this.getAssets().indexOf(item);
                if (prevIndex > currentIndex) {
                    [prevIndex, currentIndex] = [currentIndex, prevIndex];
                }
                for (let i = prevIndex + 1; i < currentIndex; i++) {
                    if (!this.selection.contains(asset)) {
                        this.selection.push(asset);
                    }
                }
            } else if (e.ctrlKey) {
                // Select/deselect an additional item
                if (this.selection.contains(asset)) {
                    this.selection.push(asset);
                } else {
                    this.selection.splice(this.selection.indexOf(asset), 1);
                }
            } else {
                // Singular selection
                this.selection = [asset];
            }
            this.prevItem = e.item.asset;
        };
        this.doubleClickHandler = e => {
            if (e.shiftKey || e.ctrlKey) {
                for (const item in this.selection) {
                    // TODO:
                }
            }
        };

        this.rescan();