export type PwaRegisterCallbacks = {
	onOfflineReady?: () => void;
	onUpdateAvailable?: () => void;
	onRegistered?: () => void;
	onRegisterError?: (error: unknown) => void;
};

let registered = false;

export function registerPwaServiceWorker(_callbacks: PwaRegisterCallbacks = {}): void {
	if (registered) return;
	registered = true;
}
