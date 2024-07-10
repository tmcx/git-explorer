(function () {
    const vscode = acquireVsCodeApi();
    const token = document.querySelector("#token");

    const validateToken = async (tokenValue, provider) => {
        let valid = false;

        if (provider === 'github') {
            const gb = await fetch('https://api.github.com/user', {
                headers: {
                    Authorization: `Bearer ${tokenValue}`,
                }
            });
            valid = gb.status < 400;
        }

        if (provider === 'gitlab') {
            const gl = await fetch('https://gitlab.com/api/v4/user', {
                headers: {
                    'PRIVATE-TOKEN': tokenValue,
                }
            });
            valid = gl.status < 400;
        }

        const invalidToken = document.querySelector('.invalid-token');
        if (!valid) {
            invalidToken.classList.add('show');
        } else {
            invalidToken.classList.remove('show');
        }
        return valid;
    };


    const newServer = document.querySelector(".new-server");
    const selected = newServer.querySelector('.selected');
    const deleteServer = document.querySelectorAll("#delete-server");
    const addServer = document.querySelector("#add-server");
    const alias = document.querySelector("#alias");

    checkToken = async () => {
        const selectedText = selected.querySelector('.text');
        const serverIsSelected = selectedText.getAttribute('aria-default') !== 'true';
        let isValidToken = false;
        if (!!token.value.trim()) {
            isValidToken = await validateToken(token.value, selectedText.textContent.toLowerCase());
        }
        addServer.disabled = !isValidToken || !token.value.trim() || !alias.value.trim() || !serverIsSelected;
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