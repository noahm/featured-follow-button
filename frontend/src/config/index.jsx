import '../common-styles';
import { Component, render } from 'preact';

class App extends Component {
	render() {
		return (
			<div>
				<h1>No configuration required!</h1>
				<p>Go to your live dashboard to control follow buttons in real-time.</p>
			</div>
		);
	}
}

const appNode = document.createElement('div');
document.body.appendChild(appNode);
render(<App />, appNode);
