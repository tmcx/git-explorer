(function () {
    const vscode = acquireVsCodeApi();


    const newServer = document.querySelector(".new-server");
    const selected = newServer.querySelector('.selected');
    const deleteServer = document.querySelectorAll("#delete-server");
    const addServer = document.querySelector("#add-server");
    const alias = document.querySelector("#alias");
    const token = document.querySelector("#token");
    checkToken = () => {
        const selectedText = selected.querySelector('.text');
        const serverIsSelected = selectedText.getAttribute('aria-default') !== 'true';
        addServer.disabled = !token.value.trim() || !alias.value.trim() || !serverIsSelected;
        return !addServer.disabled;
    };

    alias?.addEventListener("keyup", checkToken);
    token?.addEventListener("keyup", checkToken);


    addServer.addEventListener("click", () => {
        const selectedText = selected.querySelector('.text');
        vscode.postMessage({
            type: "add-server",
            data: {
                server: selectedText.textContent,
                id: Date.now().toString(),
                alias: alias.value,
                token: token.value,
            },
        });
    });


    deleteServer.forEach((btn) => btn.addEventListener("click", (el) => {
        vscode.postMessage({
            type: "delete-server",
            data: {
                id: el.target.dataset.id,
            },
        });
    }));


    selected.addEventListener("click", () => {
        selected.parentElement.querySelector('.options').classList.toggle('show');
    });

    const options = newServer.querySelectorAll('.options span');
    options.forEach((option) => {
        option.addEventListener("click", (el) => {
            const selectedText = selected.querySelector('.text');
            selectedText.textContent = el.target.textContent;
            selectedText.setAttribute('aria-default', 'false');
            selected.parentElement.querySelector('.options').classList.remove('show');
            checkToken();
        });
    });
})();