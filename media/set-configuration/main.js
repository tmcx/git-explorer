(function () {
    const vscode = acquireVsCodeApi();


    const selectServer = document.querySelector("#select-server");
    const deleteServer = document.querySelectorAll("#delete-server");
    const addServer = document.querySelector("#add-server");
    const alias = document.querySelector("#alias");
    const token = document.querySelector("#token");

    checkToken = () => {
        const serverIsSelected = selectServer?.selectedOptions[0].value !== '-99';
        addServer.disabled = !token.value || !alias.value || !serverIsSelected;
        return !addServer.disabled;
    };

    selectServer?.addEventListener("change", checkToken);
    alias?.addEventListener("keyup", checkToken);
    token?.addEventListener("keyup", checkToken);


    addServer.addEventListener("click", () => {
        vscode.postMessage({
            type: "add-server",
            data: {
                server: selectServer.value,
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
})();