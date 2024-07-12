(function () {
    const vscode = acquireVsCodeApi();
    const token = document.querySelector("#token");

    const validateToken = async (tokenValue, provider) => {
        const urls = {
            'github': { url: 'https://api.github.com/user', authType: 'Bearer' },
            'gitlab': { url: 'https://gitlab.com/api/v4/user', authType: 'Bearer' },
            'bitbucket': { url: 'https://api.bitbucket.org/2.0/user', authType: 'Basic' },
        };

        if (!urls[provider]) {
            return false;
        }

        const gb = await fetch(urls[provider].url, {
            headers: {
                Authorization: `${urls[provider].authType} ${tokenValue}`,
            }
        });
        const valid = gb.status < 400;
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
        const provider = selectedText.textContent.toLowerCase();
        const username = document.querySelector('#username');

        if (provider === 'bitbucket') {
            username.classList.add('show');
        } else {
            username.classList.remove('show');
        }

        const isValidUsername = provider === 'bitbucket' ? !username.textContent.trim() : true;

        let isValidToken = false;
        if (!!token.value.trim()) {
            let tokenValue = token.value;
            if (provider === 'bitbucket') {
                tokenValue = btoa(`${username.value}:${token.value}`);
            }
            isValidToken = await validateToken(tokenValue, provider);
        } else {
            const invalidToken = document.querySelector('.invalid-token');
            invalidToken.classList.remove('show');
        }
        addServer.disabled = !isValidToken || !token.value.trim() || !alias.value.trim() || !serverIsSelected || !isValidUsername;
        return !addServer.disabled;
    };

    alias?.addEventListener("keyup", checkToken);
    token?.addEventListener("keyup", checkToken);

    const listServers = document.querySelector('#list-servers');

    addServer.addEventListener("click", () => {
        const selectedText = selected.querySelector('.text');
        const provider = selectedText.textContent.toLowerCase();
        const username = document.querySelector('#username');

        const tokenValue = provider === 'bitbucket' ? btoa(`${username.value}:${token.value}`) : token.value;
        vscode.postMessage({
            type: "add-server",
            data: {
                server: selectedText.textContent,
                id: Date.now().toString(),
                alias: alias.value,
                token: tokenValue,
            },
        });

        const noContent = listServers.querySelector('.no-content');

        if (noContent) {
            listServers.removeChild(noContent);
        }

        const name = `${alias.value}(${selectedText.textContent})`;
        const span = document.createElement("SPAN");
        span.innerHTML = `<span>
                <span class="icon refresh loading"></span>
                <span title="${name}">${name}</span>
            </span>`;
        listServers.appendChild(span);
    });


    deleteServer.forEach((btn) => btn.addEventListener("click", (el) => {
        vscode.postMessage({
            type: "delete-server",
            data: {
                id: el.target.dataset.id,
            },
        });
        btn.disabled = true;
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