import React, { Component, useState } from 'react';
import QueryInput from '../QueryInput/QueryInput';
import { Progress, Row, Col, Button, ButtonDropdown, Card, CardTitle, CardText, CardDeck, Collapse, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';

import { faUndo, faStepForward, faStepBackward, faStop} from "@fortawesome/free-solid-svg-icons";
import { faPlayCircle } from "@fortawesome/free-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import './TopicViewer.css';

class TopicViewer extends Component {

    componentDidMount() {
        fetch('./joined/' + this.state.topicId + '.json')
            .then(response => response.json())
            .then(topicData => this.setState({ topicData }));
    }

    handleCurrentTimeUpdate = (elapsed) => {
        var currentTime = this.state.currentTime;
        if (currentTime == null) {
            this.setState( {currentTime: 0} );
        }
        else {
            this.setState( {currentTime: currentTime + elapsed} );

            if (currentTime > this.state.maximumTime + 5000 && this.state.autoPlay) {
                this.nextTopic();
            }
        }
    }

    update(timestamp) {
        if (this.start == undefined)
            this.start = timestamp;

        const elapsed = timestamp - this.start;

        if (elapsed > 33) {
            this.handleCurrentTimeUpdate(elapsed);
            this.start = timestamp;
        }

        if (this.state.playing) {
            this.animationID = window.requestAnimationFrame(this.update.bind(this));
        }
    }

    startPlaying() {
        this.setState({ playing: true, currentTime: 0});
        this.animationID = window.requestAnimationFrame(this.update.bind(this));
        this.start = null;
    }

    stopPlaying() {
        window.cancelAnimationFrame(this.animationID);

        this.setState( {playing: false} );
        this.start = null;
    }

    startAutoplay() {
        this.setState( {autoPlay: true} );
        this.startPlaying();
    }

    stopAutoplay() {
        this.setState( {autoPlay: false} );
    }

    componentWillUnmount() {
        this.stopPlaying();
    }

    constructor(props) {
        super(props);
        this.start = null;
        this.state = { 
            qCount: 10, 
            speedModifier: 1.0, 
            topicId: this.props.topicId, 
            syncStart: false, 
            showSummaries: true, 
            backButtonText: this.getBackButtonText(true), 
            showStats: false,
            maximumTime: 0,
            playing: false,
            showSpeedMenu: false,
            speedButtonText: this.getSpeedText(1.0),
            autoPlay: true
         }
    }

    getBackButtonText(showingSummaries) {
        if (showingSummaries)
            return "Hide Summaries";
        return "Show Summaries";
    }

    getSpeedText(speedModifier) {
      return "Speed: " + Number(speedModifier).toFixed(1) + "X";
    }

    getPlayPauseIcon() {
        if (this.state.playing) {
            return <FontAwesomeIcon className="playbackIcon" icon={faStop} />;
        }
        return <FontAwesomeIcon className="playbackIcon" icon={faPlayCircle} />;
    }

    nextTopic() {
        var currentTopic = this.state.topicId;
        var nextTopic = Number(currentTopic) + 1;
        if (nextTopic == 174) {
            nextTopic = 1;
        }
        this.setState({ topicData: null, topicId: nextTopic, currentTime: 0});

        fetch('./joined/' + nextTopic + '.json')
            .then(response => response.json())
            .then(topicData => this.setState({ topicData }));
    }

    restartTopic() {
        this.stopPlaying();
        this.startPlaying();
    }

    prevTopic() {
        var currentTopic = this.state.topicId;
        var nextTopic = Number(currentTopic) - 1;
        if (nextTopic == 0) {
            nextTopic = 173;
        }
        this.setState({ topicData: null, topicId: nextTopic, currentTime: 0});

        fetch('./joined/' + nextTopic + '.json')
            .then(response => response.json())
            .then(topicData => this.setState({ topicData }));
    }

    toggleSpeedMenu() {
      this.setState({ showSpeedMenu: !this.state.showSpeedMenu });
    }

    toggleBack() {
       this.setState({ showSummaries: !this.state.showSummaries , backButtonText : this.getBackButtonText(!this.state.showSummaries)});
    }

    togglePlayPause() {
        if (!this.state.playing) {
            this.startPlaying();
        }
        else {
            this.stopPlaying();
        }
    }

    toggleAutoMode() {
        if (!this.state.autoPlay) {
            this.startAutoplay();
        }
        else {
            this.stopAutoplay();
        }
    }

    handleTopicChange(event) {
        this.setState({ topicData: null, topicId: event.target.value, currentTime: 0});

        if (event.target.value != undefined && event.target.value > 0) {
            fetch('./joined/' + event.target.value + '.json')
                .then(response => response.json())
                .then(topicData => this.setState({ topicData }));
        }
    }

    handleQCountChange(event) {
        if (this.state.playing) {
            this.stopPlaying();
            this.setState({qCount: event.target.value, currentTime: 0})
            this.startPlaying();
        }
        else {
            this.setState({qCount: event.target.value});
        }
    }

    handleSpeedChange(event) {
        if (this.state.playing) {
            this.stopPlaying();
            this.setState({speedModifier: event.target.value, currentTime: 0})
            this.startPlaying();
        }
        else {
            this.setState({speedModifier: event.target.value});
        }
       this.setState({speedButtonText: this.getSpeedText(event.target.value)});
    }

    handleAutoplayChange(event) {
        this.setState({autoPlay: event.target.checked});
    }

    handleSyncChange(event) {
        clearInterval(this.timerID);
        this.setState({syncStart: event.target.checked});

        if (event.target.checked) {
            this.startPlaying();
        }
    }

    findKeyStrokeIndexOfFirstChange(keyStrokeSplit) {
        var result = this.state.syncStart ? 4 : 0;
        if (this.state.syncStart) {
            for (var i = result; i < keyStrokeSplit.length; i++) {
                if (i % 2 != 0) {
                    if (keyStrokeSplit[i] != "") {
                        return i - 1;
                    }
                }
            }
        }
        return result;
    }

    computeTotalTime(startingPoint, keyStrokeSplit) {
        var totalTime = 0;
        for (var i = startingPoint; i < keyStrokeSplit.length; i++) {
            if (i % 2 == 0) {
                totalTime += Number(keyStrokeSplit[i]) * (1.0/this.state.speedModifier);
            }
        }
        return totalTime;
    }

    interleaveModalities(queries, numberOfQueries, currentTime) {
        var queryInputs = [];
        var keysUsed = [];
        var maxTime = 0;

        if (numberOfQueries > queries.length) {
            numberOfQueries = queries.length;
        }

        while(queryInputs.length < numberOfQueries) {
            for (var mode of ["image", "audio"]) {
                for (var summaryLength of ["title", "short", "long"]) {
                    for (var i = 0; i < queries.length; i++) {
                        var query = queries[i];
                        if (query.summary_modality == mode &&
                            query.summary_length == summaryLength &&
                            !keysUsed.includes(query.uid)) {

                            keysUsed.push(query.uid);

                            var keyStrokeSplit = query.typed_sequence.split("|");
                            var newKeyStrokeIndex = this.findKeyStrokeIndexOfFirstChange(keyStrokeSplit);
                            var totalTime = this.computeTotalTime(newKeyStrokeIndex, keyStrokeSplit);

                            if (totalTime > maxTime) {
                                maxTime = totalTime;
                            }

                            queryInputs.push(
                                <QueryInput key={query.uid} 
                                    queryKey={query.uid}
                                    syncStart={this.state.syncStart}
                                    currentTime={currentTime}
                                    mode={query.summary_modality} 
                                    summaryLength={query.summary_length}
                                    device={query.device}
                                    browser={query.browser} 
                                    keyStrokeInfo={query.typed_sequence}
                                    firstChange={newKeyStrokeIndex}
                                    totalTime={totalTime} 
                                    speedModifier={this.state.speedModifier}
                                    playing={this.state.playing} />
                            );
                            break;
                        }
                    }

                    if (queryInputs.length == numberOfQueries) {
                        this.state.maximumTime = maxTime;
                        return queryInputs;
                    } 
                }
            }
        }

        this.state.maximumTime = maxTime;
        return queryInputs;
    }

    wrapQueryInputsInColumns(queryInputs) {
        var wrappedInputs = [];
        for (var i = 0; i < queryInputs.length; i+=2) {
            wrappedInputs.push(
                <Row key={i} className="queryRow">
                    <div className="col-sm-12 col-sm-pull-12 col-md-6 col-md-pull-6">
                        {queryInputs[i]}
                    </div>
                    <div className="col-sm-12 col-sm-pull-12 col-md-6 col-md-pull-6">
                        {queryInputs[i+1]}
                    </div>
                </Row>
            )
        }
        return wrappedInputs;
    }

    render() { 
        var queryInputs = (<p>Loading</p>); 
        var queriesSubmitted = (<p>Loading</p>);
        var topicTitle = (<p>Loading</p>);
        var topicSummaryShort = (<p>Loading</p>);
        var topicSummaryLong = (<p>Loading</p>);
        var meanQueryLength = (<p>Loading</p>);
        var uniqueQueryCount = (<p>Loading</p>);
        var uniqueWorkers = (<p>Loading</p>);

        if (this.state.topicData != undefined) {
            queryInputs = this.interleaveModalities(this.state.topicData.queries, this.state.qCount, this.state.currentTime);
            queryInputs = this.wrapQueryInputsInColumns(queryInputs);
            queriesSubmitted = this.state.topicData.queries.length;
            topicTitle = this.state.topicData.doc_title; 
            topicSummaryShort = this.state.topicData.doc_summary_short;
            topicSummaryLong = this.state.topicData.doc_summary_long;
            meanQueryLength = this.state.topicData.mean_length.toFixed(2);
            uniqueQueryCount = this.state.topicData.unique_queries;
            uniqueWorkers = this.state.topicData.unique_workers;
        }

      return (
            <div>
                <div className="stickyBanner">
                    <div className="topicInfoContainer">
                        <Row>
                            <div className="col-sm-12 col-sm-pull-0 col-md-4 col-md-pull-4 col-lg-3 col-lg-pull-3">
                                <img src="cc.png" className="logo" alt="CC News Query Explorer"/>
                            </div>
                            <div className="col-sm-12 col-sm-pull-0 col-md-8 col-md-pull-8 col-lg-6 col-lg-pull-6">
                                <Row className="topicProgressRow topicControls">
                                    <div className="col-xs-3 mx-auto">
                                        <a href="#" onClick={this.togglePlayPause.bind(this)}>{this.getPlayPauseIcon()}</a>
                                        <a href="#" onClick={this.restartTopic.bind(this)}><FontAwesomeIcon className="playbackSolidIcon" icon={faUndo} /></a>
                                    </div>
                                    <div className="topicProgressCol col-xs-9 mx-auto">
                                        <a href="#" onClick={this.prevTopic.bind(this)}><FontAwesomeIcon className="forwardBackSolidIcon" icon={faStepBackward}/></a>
                                        <b>Topic</b>: 
                                            <input type="text" 
                                                maxLength="3" 
                                                size="3" 
                                                name="topic" 
                                                value={this.state.topicId} 
                                                onChange={this.handleTopicChange.bind(this)} />
                                        &nbsp;of 173&nbsp;
                                        <a href="#" onClick={this.nextTopic.bind(this)}><FontAwesomeIcon className="forwardBackSolidIcon" icon={faStepForward}/></a>
                                        <input id="autoPlay" type="checkbox" name="autoPlay" checked={this.state.autoPlay} onChange={this.handleAutoplayChange.bind(this)} />
                                        <label for="autoPlay"><b>Auto</b></label>
                                        &nbsp;
                                    </div>
                                </Row>
                                <Row className="topicProgressRow">
                                    <Col className="topicProgressCol">
                                        <Progress color="info" className="progressBar" value={this.state.currentTime} max={this.state.maximumTime} style={{transition: "none"}} />
                                    </Col>
                                </Row>
                            </div>
                            <div className="controlPanel col-sm-12 col-sm-pull-0 col-md-12 col-md-pull-0 col-lg-3 col-lg-pull-3">
                                
                                <div style={{display:"block"}}>
                                    <span style={{"white-space":"nowrap", "margin-right":"10px", display:"block"}}>
                                        <b>Queries</b>: &nbsp;<input type="text" maxLength="3" size="3" name="qCount" value={this.state.qCount} onChange={this.handleQCountChange.bind(this)} />
                                        <input id="syncStart" type="checkbox" name="syncStart" checked={this.state.syncStart} onChange={this.handleSyncChange.bind(this)} />
                                        <label for="syncStart"><b>Sync Start</b></label>
                                    </span>

                                    <span style={{"white-space":"nowrap", display: "block"}}>
                                        <ButtonDropdown isOpen={this.state.showSpeedMenu} toggle={this.toggleSpeedMenu.bind(this)}>
                                            <DropdownToggle color="info" caret>
                                                {this.state.speedButtonText}
                                            </DropdownToggle>
                                            <DropdownMenu>
                                                <DropdownItem value={0.2} onClick={this.handleSpeedChange.bind(this)}>0.2</DropdownItem>
                                                <DropdownItem value={0.5} onClick={this.handleSpeedChange.bind(this)}>0.5</DropdownItem>
                                                <DropdownItem value={1.0} onClick={this.handleSpeedChange.bind(this)}>1.0</DropdownItem>
                                                <DropdownItem value={2.0} onClick={this.handleSpeedChange.bind(this)}>2.0</DropdownItem>
                                                <DropdownItem value={5.0} onClick={this.handleSpeedChange.bind(this)}>5.0</DropdownItem>
                                            </DropdownMenu>
                                        </ButtonDropdown>
                                        <Button id="toggleBack" color="info" onClick={this.toggleBack.bind(this)} style={{ "margin-bottom": '0rem' }}>{this.state.backButtonText}</Button>
                                    </span>
                                </div>
                            </div>
                        </Row>
                        <div className="mx-auto text-center topicTitleRow">
                            <b>Topic Title:&nbsp;</b><span>{topicTitle}</span>
                        </div>
                        <Row>
                            <Col className="statsColumn">
                                <b>Queries Submitted</b>: {queriesSubmitted}<br></br>
                            </Col>
                            <Col className="statsColumn">
                                <b>Mean Word Count</b>: {meanQueryLength}<br></br>
                            </Col>
                            <Col className="statsColumn">
                                <b>Unique Query Count</b>: {uniqueQueryCount}<br></br>
                            </Col>
                            <Col className="statsColumn">
                                <b>Unique Workers</b>: {uniqueWorkers}
                            </Col>
                        </Row>

                    <Collapse isOpen={this.state.showSummaries}>
                        <br></br>
                        <CardDeck>
                            
                            <Card body outline color="info">
                            <CardTitle className="text-center" tag="b">Short Summary</CardTitle>
                            <CardText>{topicSummaryShort}</CardText>
                            </Card>
                            <Card body outline color="info">
                            <CardTitle className="text-center" tag="b">Long Summary</CardTitle>
                            <CardText>{topicSummaryLong}</CardText>
                            </Card>
                        </CardDeck>
                    </Collapse>
                </div>
                </div>
                <div>
                        { queryInputs }
                </div>
            </div>
        );
    }
}
 
export default TopicViewer;
