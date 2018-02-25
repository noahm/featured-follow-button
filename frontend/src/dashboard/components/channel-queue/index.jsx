import style from './style';
import { Component } from 'preact';
import { getUsername } from '../../../utils';
import { ChannelInput } from '../channel-input';

export class ChannelQueue extends Component {
    state = {
        nextIndex: 0,
        queue: [],
    };

    render({ channelName, onClear }, { nextIndex, queue }) {
        let nextChannel = null;
        if (queue.length && queue[nextIndex]) {
            nextChannel = queue[nextIndex];
        }
        return (
            <div className={style.ChannelQueue}>
                <ChannelInput onAdd={this.addChannel} onActivate={this.props.onChange} />
                <div className={style.ChannelList}>
                    {!!channelName && <button onClick={onClear}>Clear current</button>}
                    <button disabled={!nextChannel} onClick={this.onCueNext}>Cue next</button>
                    {nextChannel && <span> => {getUsername(nextChannel.channelName, nextChannel.displayName)}</span>}
                    <ol>
                        {queue.map((queuedChannel, i) => (
                            <li key={i}>
                                {getUsername(queuedChannel.channelName, queuedChannel.displayName)}
                                <div data-channel-index={i}>
                                    <button onClick={this.onCueClick}>Display</button>
                                    <button onClick={this.onDeleteClick}>Remove</button>
                                </div>
                            </li>
                        ))}
                    </ol>
                </div>
            </div>
        );
    }

    onCueNext = () => {
        const nextChannel = this.state.queue[this.state.nextIndex];
        this.props.onChange(nextChannel.channelName, nextChannel.displayName);
        this.setState((state) => ({
            nextIndex: state.nextIndex + 1,
        }));
    }

    onCueClick = (e) => {
        const channelIndex = +e.currentTarget.parentElement.dataset.channelIndex;
        const channel = this.state.queue[channelIndex];
        this.setState({
            nextIndex: channelIndex + 1,
        });
        this.props.onChange(channel.channelName, channel.displayName);
    }

    onDeleteClick = (e) => {
        const channelIndex = +e.currentTarget.parentElement.dataset.channelIndex;
        this.state.queue.splice(channelIndex, 1);
        if (this.state.nextIndex >= this.state.queue.length) {
            this.setState((state) => ({
                nextIndex: Math.max(0, state.nextIndex - 1),
            }));
        } else {
            this.forceUpdate();
        }
    }

    addChannel = (channelName, displayName = '') => {
        this.state.queue.push({ channelName, displayName });
        this.forceUpdate();
    }
}
