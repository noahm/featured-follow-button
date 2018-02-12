import './style';
import { Component } from 'preact';

export class ChannelInput extends Component {
    state = {
        pendingChannelName: '',
        pendingDisplayName: '',
    };

    render(props, { pendingChannelName, pendingDisplayName }) {
        return (
            <form onSubmit={this.onSubmit}>
                <input width="15" placeholder="Channel Name" value={pendingChannelName} onChange={this.setChannelName} />
                <br />
                <input width="15" placeholder="Display Name (optional)" value={pendingDisplayName} onChange={this.setDisplayName} />
                <br />
                <button onClick={this.onClickAdd}>Queue</button>
                <button onClick={this.onClickActivate}>Activate</button>
            </form>
        );
    }

    setChannelName = (e) => {
        this.setState({ pendingChannelName: e.currentTarget.value.toLowerCase() });
    }

    setDisplayName = (e) => {
        this.setState({ pendingDisplayName: e.currentTarget.value });
    }

    onSubmit = (e) => {
        e.preventDefault();
    }

    onClickAdd = () => {
        if (!this.state.pendingChannelName) {
            return;
        }
        this.props.onAdd(this.state.pendingChannelName, this.state.pendingDisplayName);
        this.setState({
            pendingChannelName: '',
            pendingDisplayName: '',
        });
    }

    onClickActivate = () => {
        if (!this.state.pendingChannelName) {
            return;
        }
        this.props.onActivate(this.state.pendingChannelName, this.state.pendingDisplayName);
        this.setState({
            pendingChannelName: '',
            pendingDisplayName: '',
        });
    }
}
