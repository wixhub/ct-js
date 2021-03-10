main-menu-latest-projects
    h1 {voc.recentProjects}
    ul.aMenu
        li(each="{project in latestProjects}" title="{project}" onclick="{() => loadLatestProject(project)}")
            span {project}
    script.
        this.namespace = 'mainMenu.latestProjects';
        this.mixin(window.riotVoc);

        this.refreshLatestProjects = function refreshLatestProjects() {
            if (('latestProjects' in localStorage) &&
                (localStorage.latestProjects !== '')) {
                this.latestProjects = localStorage.latestProjects.split(';');
                this.latestProjects.length = Math.min(this.latestProjects.length, 10);
            } else {
                this.latestProjects = [];
            }
        };
        this.refreshLatestProjects();

        this.loadLatestProject = projPath => {
            alertify.confirm(window.languageJSON.common.reallyexit, e => {
                if (e) {
                    window.signals.trigger('resetAll');
                    window.loadProject(projPath);
                }
            });
        };
