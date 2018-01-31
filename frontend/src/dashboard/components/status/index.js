import style from './style';
import { Component } from 'preact';
import { getUsername } from '../../../utils';

export class Status extends Component {
    render({ channelName, displayName }) {
        let statusLine = <span>Follow button is not active</span>;
        if (channelName) {
            statusLine = <span>Follow button is visible for {getUsername(channelName, displayName)}</span>;
        }
        return (
            <div className={style.Status}>
                {statusLine}
            </div>
        );
    }
}
