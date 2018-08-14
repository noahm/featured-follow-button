import '../common-styles.css';
import { applyThemeClass } from '../common-styles';
import { Component, render } from 'preact';

class App extends Component {
	render() {
		return (
			<div style={{ maxWidth: '37em' }}>
				<h2>No configuration required!</h2>
				<p>
					Go to your live dashboard to control follow buttons in real-time.
					Queue up buttons for known channels to be able to quickly display
					them on demand, or display them immediately as the need arises.
				</p>
				<p>
					Use auto display name to use a channel's current display name
					on the button, or manually input your own.
				</p>
			</div>
		);
	}
}

const appNode = document.createElement('div');
document.body.appendChild(appNode);
render(<App />, appNode);
applyThemeClass();
