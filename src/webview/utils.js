var vscode;


function bindVscode() {
    vscode = acquireVsCodeApi();
}

function getVscode() {
    return vscode;
}

export {
    bindVscode,
    getVscode
}