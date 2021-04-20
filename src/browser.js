import vscode from './vscode_extension'

if (!vscode) {
    window.onbeforeunload = function() {
        return '您的操作将不会被保留';
    }

    async function registerSW() {
        try {
            await navigator.serviceWorker.register('./service_worker.js');
        } catch (err) {
            console.log(err)
        }
	}
    if ('serviceWorker' in navigator) {
        registerSW();
    }
}
