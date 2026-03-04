import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
	let panel: vscode.WebviewPanel | undefined;
	const statusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left);
	statusBar.text = "⏱ 00:00";
	statusBar.command = "competitive-timer.start";
	statusBar.show();

	const command = vscode.commands.registerCommand('competitive-timer.start', () => {

		let timer: NodeJS.Timeout | null = null;
		let seconds = 0;

		const panel = vscode.window.createWebviewPanel(
			'competitiveTimer',
			'Competitive Timer',
			vscode.ViewColumn.One,
			{ enableScripts: true }
		);

		panel.webview.html = getWebviewContent();

		panel.webview.onDidReceiveMessage((message) => {



			if (message.command === 'start') {
				if (!timer) {
					timer = setInterval(() => {
						seconds++;

						const time = formatTime(seconds);

						panel.webview.postMessage({
							command: 'update',
							time: time
						});

						statusBar.text = `⏱ ${time}`;
					}, 1000);
				}
			}

			if (message.command === 'pause') {
				if (timer) {
					clearInterval(timer);
					timer = null;
				}
			}

			if (message.command === 'reset') {
				seconds = 0;
				statusBar.text = "⏱ 00:00";
				if (timer) {
					clearInterval(timer);
					timer = null;
				}

				panel.webview.postMessage({
					command: 'update',
					time: "00:00"
				});
			}
			if (message.command === 'lap') {
				panel.webview.postMessage({
					command: 'lap',
					time: formatTime(seconds)
				});
			}

		});

	});

	context.subscriptions.push(command);
}

function formatTime(sec: number) {
	const m = Math.floor(sec / 60);
	const s = sec % 60;
	return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function getWebviewContent() {
	return `

<html>
<head>
<style>

#laps{
margin:auto;
margin-top:15px;
border-collapse:collapse;
}

#laps th,#laps td{
padding:6px 14px;
border-bottom:1px solid #444;
}

#laps tr.latest{
background:#1f6feb;
color:white;
}

#laps th{
color:#aaa;
font-weight:500;
}

.clear{
background:#6b7280;
color:white;
}

.lap{
    background:#3b82f6;
    color:white;
}
body{
text-align:center;
font-family:Segoe UI, sans-serif;
padding-top:80px;
background:#1e1e1e;
color:white;
}

#timer{
font-size:100px;
font-weight:600;
letter-spacing:3px;
}

button{
padding:10px 22px;
margin:8px;
border:none;
border-radius:8px;
font-size:16px;
cursor:pointer;
transition:0.2s;
}

.start{
background:#22c55e;
color:white;
}

.pause{
background:#f59e0b;
color:white;
}

.reset{
background:#ef4444;
color:white;
}

button:hover{
transform:scale(1.08);
}

#laps{
max-height:150px;
overflow-y:auto;
margin-top:10px;
}

</style>
</head>

<body>

<h1 id="timer">00:00</h1>

<button class="start" onclick="start()">▶ Start</button>
<button class="pause" onclick="pause()">⏸ Pause</button>
<button class="reset" onclick="reset()">🔄 Reset</button>
<button class="lap" onclick="lap()">🏁 Lap</button>
<button class="clear" onclick="clearLaps()">🧹 Clear Laps</button>

<h3>Lap Times</h3>
<table id="laps">
<thead>
<tr>
<th>Lap</th>
<th>Time</th>
</tr>
</thead>
<tbody></tbody>
</table>


<script>
const vscode = acquireVsCodeApi();

function lap(){
    vscode.postMessage({command:'lap'});
}

function clearLaps(){
    document.getElementById("laps").innerHTML = "";
}

function start(){
    vscode.postMessage({command:'start'});
}

function pause(){
    vscode.postMessage({command:'pause'});
}

function reset(){
    vscode.postMessage({command:'reset'});
}

window.addEventListener('message', event => {
    const msg = event.data;

    if(msg.command === 'update'){
        document.getElementById('timer').textContent = msg.time;
    }

    if(msg.command === 'lap'){

	const tableBody = document.querySelector("#laps tbody");

const lapNumber = tableBody.children.length + 1;

const row = document.createElement("tr");

const lapCell = document.createElement("td");
lapCell.textContent = lapNumber;

const timeCell = document.createElement("td");
timeCell.textContent = msg.time;

row.appendChild(lapCell);
row.appendChild(timeCell);

const previous = document.querySelector("#laps tr.latest");
if(previous){
previous.classList.remove("latest");
}

row.classList.add("latest");

tableBody.appendChild(row);

tableBody.scrollTop = tableBody.scrollHeight;

	lapsList.scrollTop = lapsList.scrollHeight;

}
});
</script>

</body>
</html>

`;
}

export function deactivate() { }
