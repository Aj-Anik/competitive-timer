import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {

	console.log("Competitive Timer Activated");

	const provider = new TimerViewProvider();

	context.subscriptions.push(
		vscode.window.registerWebviewViewProvider(
			"competitiveTimerView",
			provider,
			{ webviewOptions: { retainContextWhenHidden: true } }
		)
	);
}

class TimerViewProvider implements vscode.WebviewViewProvider {

	private seconds = 0;
	private timer: NodeJS.Timeout | undefined;

	resolveWebviewView(
		webviewView: vscode.WebviewView,
		context: vscode.WebviewViewResolveContext,
		token: vscode.CancellationToken
	) {

		webviewView.webview.options = {
			enableScripts: true
		};

		webviewView.webview.html = this.getHtml();

		webviewView.webview.onDidReceiveMessage((msg) => {

			if (msg.command === "start") {

				if (!this.timer) {
					this.timer = setInterval(() => {

						this.seconds++;

						webviewView.webview.postMessage({
							command: "update",
							time: this.formatTime(this.seconds)
						});

					}, 1000);
				}
			}

			if (msg.command === "pause") {
				if (this.timer) {
					clearInterval(this.timer);
					this.timer = undefined;
				}
			}

			if (msg.command === "reset") {

				this.seconds = 0;

				if (this.timer) {
					clearInterval(this.timer);
					this.timer = undefined;
				}

				webviewView.webview.postMessage({
					command: "update",
					time: "00:00"
				});
			}

		});
	}

	formatTime(sec: number) {
		const m = Math.floor(sec / 60);
		const s = sec % 60;
		return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
	}

	getHtml() {
		return `
		<!DOCTYPE html>
		<html>
		<body style="background:#1e1e1e;color:white;text-align:center;font-family:sans-serif">

		<h1 id="timer">00:00</h1>

		<button onclick="start()">Start</button>
		<button onclick="pause()">Pause</button>
		<button onclick="reset()">Reset</button>

		<script>

		const vscode = acquireVsCodeApi();

		function start(){
			vscode.postMessage({command:"start"});
		}

		function pause(){
			vscode.postMessage({command:"pause"});
		}

		function reset(){
			vscode.postMessage({command:"reset"});
		}

		window.addEventListener("message", event => {
			const msg = event.data;

			if(msg.command === "update"){
				document.getElementById("timer").textContent = msg.time;
			}
		});

		</script>

		</body>
		</html>
		`;
	}
}

export function deactivate() {}