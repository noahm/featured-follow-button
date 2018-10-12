import '../common-styles.css';
import styles from './config.css';
import { applyThemeClass } from '../common-styles';
import { FollowButton } from './follow-button';
import { Component, CSSProperties } from 'react';
import { render } from 'react-dom';
import Dropzone from 'react-dropzone';
import Draggable from 'react-draggable';

class App extends Component {
	state = {};

	render() {
		return (
			<div style={{ fontSize: '200%' }}>
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
				<div>
					<Dropzone accept="image/*" disableClick multiple={false} onDrop={this.onDrop} style={this.getDropzoneStyles()}>
						<div style={{ height: '720px', width: '1280px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
							{this.state.background ? <img src={this.state.background} style={{ height: '100%' }} /> : <div>Drop an image of your stream layout here</div>}
							<div style={{ position: "absolute", height: '100%', width: '100%' }}>
								<Draggable bounds="parent" defaultClassName={styles.draggable} defaultClassNameDragging={styles.dragging}>
									<div style={{ display: 'inline-block', cursor: 'grab' }}><FollowButton>Me</FollowButton></div>
								</Draggable>
							</div>
						</div>
					</Dropzone>
				</div>
			</div>
		);
	}

	/** @return {CSSProperties} */
	getDropzoneStyles() {
		return {
			border: '2px #666 dotted',
			borderRadius: '5px',
			display: 'inline-block',
		};
	}

	onDrop = (files) => {
		if (!files || !files.length) {
			return;
		}
		const file = files[0];
		const reader = new FileReader();
		reader.onload = () => {
			this.setState({
				background: reader.result,
			});
		}
		reader.readAsDataURL(file);
	}
}

const appNode = document.createElement('div');
document.body.appendChild(appNode);
render(<App />, appNode);
applyThemeClass();
