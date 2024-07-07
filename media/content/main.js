
(function () {
    const vscode = acquireVsCodeApi();

    const titles = document.querySelectorAll('.title');

    titles.forEach(title => {
        title.addEventListener('click', () => {
            const childrenId = title.dataset.id;
            document.querySelector('#' + childrenId).classList.toggle('expanded');
            title.classList.toggle('expanded');
        });
    });


    const gitClones = document.querySelectorAll('.icon.git-clone');
    gitClones.forEach(clone => {
        clone.addEventListener('click', (event) => {
            event.stopPropagation();
            vscode.postMessage({
                type: 'git-clone',
                data: {
                    http: clone.dataset.http,
                    ssh: clone.dataset.ssh,
                },
            });
        });
    });


    const goTos = document.querySelectorAll('.icon.go-to');
    goTos.forEach(goTo => {
        goTo.addEventListener('click', (event) => {
            event.stopPropagation();
            vscode.postMessage({
                type: 'go-to',
                data: {
                    url: goTo.dataset.url,
                },
            });
        });
    });


})();

