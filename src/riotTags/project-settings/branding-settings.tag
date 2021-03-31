branding-settings
    h1 {voc.heading}
    .block
        b
            span {voc.icon}
            hover-hint(text="{voc.iconNotice}")
        br
        texture-input(
            val="{currentProject.settings.branding.icon || -1}"
            showempty="yep"
            onselected="{updateGameIcon}"
            header="{voc.icon}"
        )
    .spacer
    .block
        b
            span {voc.accent}
            hover-hint(text="{voc.accentNotice}")
        color-input(onchange="{wire('this.currentProject.settings.branding.accent', true)}" color="{currentProject.settings.branding.accent}")
    .spacer
    .block.checkbox
        input(type="checkbox" value="{this.currentProject.settings.branding.invertPreloaderScheme}" checked="{currentProject.settings.branding.invertPreloaderScheme}" onchange="{wire('this.currentProject.settings.branding.invertPreloaderScheme')}")
        span {voc.invertPreloaderScheme}
    script.
        this.namespace = 'settings.branding';
        this.mixin(window.riotVoc);
        this.mixin(window.riotWired);
        const {getProject} = require('./data/node_requires/resources/projects');
        this.currentProject = getProject();

        this.updateGameIcon = tex => {
            getProject().settings.branding.icon = tex.uid;
        };