
(function () {
    const vscode = acquireVsCodeApi();

    const groups = document.querySelectorAll('.title.group');

    groups.forEach(group => {
        group.addEventListener('click', () => {
            const childrenId = group.dataset.id;
            document.querySelector('#' + childrenId).classList.toggle('expanded');
            group.classList.toggle('expanded');
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


    const titles = document.querySelectorAll('.title');
    const search = document.querySelector('.search-bar #search');
    const clearAll = document.querySelector('.search-bar .clear-all');
    clearAll.addEventListener('click', () => {
        if (search.value !== '') {
            search.value = '';
            search.dispatchEvent(new Event('keyup'));
        }
    });

    search.addEventListener('keyup', (event) => {
        const children = document.querySelectorAll('.children');
        const value = event.target.value;
        if (value.toLowerCase().trim() === '') {
            titles.forEach(title => {
                title.classList.remove('hidden');
                title.classList.remove('expanded');
            });
            children.forEach(child => {
                child.classList.remove('hidden');
                child.classList.remove('expanded');
            });
            return;
        }


        children.forEach(child => {
            child.classList.remove('expanded');
            child.classList.add('hidden');
        });

        const titlesWithValue = [];
        titles.forEach(title => {
            title.classList.remove('expanded');
            title.classList.add('hidden');

            const hasValue = title.textContent.toLowerCase().trim().search(value.toLowerCase().trim()) !== -1;
            if (hasValue) {
                titlesWithValue.push(title);
            }

        });

        const removeToParentRecursive = (element) => {
            if (element.classList.contains('tree-content')) {
                return;
            }


            element.classList.remove('hidden');
            element.classList.add('expanded');
            const title = element.previousElementSibling;
            if (title && title.classList.contains('group')) {
                title.classList.remove('hidden');
                title.classList.add('expanded');
            }
            if (element.parentElement) {
                removeToParentRecursive(element.parentElement);
            }
        };
        titlesWithValue.forEach(title => removeToParentRecursive(title));
    });

})();
