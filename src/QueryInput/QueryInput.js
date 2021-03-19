import React, { Component } from 'react';
import { UncontrolledTooltip, Progress } from 'reactstrap';

import { faSearch, faHeadphones, faFont, faTabletAlt, faDesktop, faMobileAlt} from "@fortawesome/free-solid-svg-icons";
import { faChrome, faEdge, faFirefox, faSafari, faOpera} from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import './QueryInput.css';


class QueryInput extends Component {
    state = { 
        outputText: "",
    }

    componentDidMount() {
        if (this.state.playing) {
            this.startPlaying();
        }
    }

    handleTextChange = (timestamp, elapsed) => {
        var currentStr = this.state.keyStrokeSplit[this.state.keyStrokeIndex + 1];
        var cumulativeTime = this.state.keyStrokeTime;
        var currentInterval = 0;
        
        while (this.state.keyStrokeIndex + 2 < this.state.keyStrokeSplit.length) {
            this.state.keyStrokeIndex += 2;
            currentInterval = this.state.keyStrokeSplit[this.state.keyStrokeIndex] * (1.0 / this.state.speedModifier);
            cumulativeTime += currentInterval; 

            if (elapsed < cumulativeTime) {
                this.state.keyStrokeTime = currentInterval;
                this.start = timestamp;
                cumulativeTime -= currentInterval;
                break;
            }
        }
        
        this.setState({
            outputText : currentStr + this.state.cursorText, 
        })
    }


    update(timestamp) {
        if (this.start == undefined) {
            this.start = timestamp;
        }

        const elapsed = timestamp - this.start;

        if (elapsed > this.state.keyStrokeTime) {
            this.handleTextChange(timestamp, elapsed);
        }

        if (this.state.keyStrokeTime != -1) {
            this.animationID = window.requestAnimationFrame(this.update.bind(this));
        }

        if (this.state.keyStrokeIndex + 2 >= this.state.keyStrokeSplit.length) {
            this.state.keyStrokeTime = -1;
            this.setState({finished: true});
        }
    }

    startPlaying() {
        this.animationID = window.requestAnimationFrame(this.update.bind(this)); 
    }

    componentWillUnmount() {
        window.cancelAnimationFrame(this.animationID);
    }

    static getDerivedStateFromProps(props, state) {
        // Any time the current user changes,
        // Reset any parts of state that are tied to that user.
        // In this simple example, that's just the email.
        if (props.syncStart !== state.syncStart || 
            props.currentTime !== state.currentTime ||
            props.playing !== state.playing) {
            return {
                syncStart: props.syncStart,
                playing: props.playing,
                totalTime: props.totalTime
            }
        }

        return null;
    }
    
    componentDidUpdate(prevProps, prevState, snapshot) {
        if (prevProps.playing !== this.props.playing && !this.props.playing) {
            window.cancelAnimationFrame(this.animationID);
            return;
        }

        if ((prevProps.playing !== this.props.playing && this.props.playing) || 
            prevProps.currentTime > this.props.currentTime || 
            prevProps.syncStart !== this.props.syncStart) {
            window.cancelAnimationFrame(this.animationID);
            this.start = null;
            var newKeyStrokeIndex = this.props.firstChange;
            var newKeyStrokeTime = this.state.keyStrokeSplit[newKeyStrokeIndex] * (1.0 / this.props.speedModifier);
            this.setState({
                keyStrokeIndex: newKeyStrokeIndex,
                finished: false,
                keyStrokeTime: newKeyStrokeTime,
                outputText: "<span class=\"cursor\">|</span>",
                totalTime: this.props.totalTime,
                speedModifier: this.props.speedModifier
            });

            this.startPlaying();
        }
    }

    
    constructor(props) {
        super(props);

        this.animationId = null;
        this.start = null;

        this.state.keyStrokeSplit = this.props.keyStrokeInfo.split("|");
        this.state.syncStart = this.props.syncStart;
        this.state.finished = false;
        this.state.mode = this.props.mode;
        this.state.browser = this.props.browser;
        this.state.summaryLength = this.props.summaryLength;
        this.state.device = this.props.device;
        this.state.keyStrokeIndex = this.props.firstChange; 
        this.state.totalTime = this.props.totalTime;
        this.state.speedModifier = this.props.speedModifier;
        this.state.keyStrokeTime = this.state.keyStrokeSplit[this.props.firstChange] * (1.0 / this.props.speedModifier);
        this.state.cursorText = "<span class=\"cursor\">|</span>";
        this.state.playing = this.props.playing;
    }

    render() { 
        var modality = (<p></p>);
        var modalityDescription = "Loading"; 
        var modalityIconId = "modalityIcon" + this.props.queryKey;
        if (this.state.mode == "audio") {
            modality = (<FontAwesomeIcon icon={faHeadphones} />);
            modalityDescription = "Searcher listened to topic";
        } else if (this.state.mode == "image") {
            modality = (<FontAwesomeIcon icon={faFont} />); 
            modalityDescription = "Searcher read topic from image";
        }

        var browser = (<p></p>);
        var browserDescription = "Loading";
        var browserIconId = "browserIcon" + this.props.queryKey;
        if (this.state.browser == "Chrome" || 
            this.state.browser == "Chrome Mobile" ||
            this.state.browser == "Chrome Mobile iOS" ||
            this.state.browser == "Chromium") {
            browser = (<FontAwesomeIcon icon={faChrome} />);
            browserDescription = "Searcher used Google Chrome Browser";
        } else if (this.state.browser == "Edge") {
            browser = (<FontAwesomeIcon icon={faEdge} />);
            browserDescription = "Searcher used Microsoft Edge Browser";
        } else if (this.state.browser == "Firefox") {
            browser = (<FontAwesomeIcon icon={faFirefox} />);
            browserDescription = "Searcher used Mozilla Firefox Browser";
        } else if (this.state.browser == "Safari" || 
            this.state.browser == "Mobile Safari") {
            browserDescription = "Searcher used Safari Browser";
            browser = (<FontAwesomeIcon icon={faSafari} />);
        } else if (this.state.browser == "Opera") {
            browser = (<FontAwesomeIcon icon={faOpera} />); 
            browserDescription = "Searcher used Opera Browser";
        }

        var device = (<p></p>);
        var deviceDescription = "Loading";
        var deviceIconId = "deviceIcon" + this.props.queryKey;
        if (this.state.device == "Mobile") {
            device = (<FontAwesomeIcon icon={faMobileAlt} />);
            deviceDescription = "Searcher was using a mobile phone";
        } else if (this.state.device == "PC") {
            device = (<FontAwesomeIcon icon={faDesktop} />); 
            deviceDescription = "Searcher was using a desktop computer";
        } else if (this.state.device == "Tablet") {
            device = (<FontAwesomeIcon icon={faTabletAlt} />); 
            deviceDescription = "Searcher was using a tablet";
        }

        var summaryLength = (<p></p>);
        var summaryDescription = "Loading";
        var summaryIconId = "summaryIcon" + this.props.queryKey;
        if (this.state.summaryLength == "long") {
            summaryLength = (<span>L</span>);
            summaryDescription = "Searcher was given a long backstory";
        } else if (this.state.summaryLength == "short") {
            summaryLength = (<span>S</span>);
            summaryDescription = "Searcher was given a short backstory";
        } else if (this.state.summaryLength == "title") {
            summaryLength = (<span>T</span>);
            summaryDescription = "Searcher was given a title backstory";
        }

        return ( 
            <div className={"queryContainer " + (this.state.finished ? "finished" : "")}>
                <span className="queryMeta">
                        <span id={modalityIconId} className="searchMetaIcon">{modality}</span> 
                        <span id={browserIconId} className="searchMetaIcon">{browser}</span> 
                        <span id={deviceIconId} className="searchMetaIcon">{device}</span> 
                        <span id={summaryIconId} className="searchMetaIcon">{summaryLength}</span>
                        <UncontrolledTooltip placement="left" target={modalityIconId}>
                            {modalityDescription}
                        </UncontrolledTooltip>
                        <UncontrolledTooltip placement="left" target={browserIconId}>
                            {browserDescription}
                        </UncontrolledTooltip>
                        <UncontrolledTooltip placement="left" target={deviceIconId}>
                            {deviceDescription}
                        </UncontrolledTooltip>
                        <UncontrolledTooltip placement="left" target={summaryIconId}>
                            {summaryDescription}
                        </UncontrolledTooltip>
                    <span className="queryKey">#{this.props.queryKey.split("_")[1]}</span>
                    <FontAwesomeIcon className="searchMetaIcon" icon={faSearch} />
                </span>

                <span className="queryBoxContainer">
                    <span className="queryBox">
                        <span className="textInnerBox">
                            <span dangerouslySetInnerHTML={{ __html: this.state.outputText }} />
                        </span>
                    </span>
                </span>
            </div>
        );
    }
}
 
export default QueryInput;
