import React, { Component } from "react";
import Bubble from "./balloon";
import {Container} from "react-bootstrap";
import popAudio from './layout/media/popp.wav';
import loseAudio from './layout/media/lose.mp3';

import Countdown from "react-countdown";
import './balloon.css';

import CustomBalloon from "./myBalloon"
import { AsakaBtn } from "./layout/styles";

class Stage extends Component {
  constructor(props) {
    super(props);

    this.state = {
      bubbleCount: props.bubbleCount,
      popped: 0,
      ready: false,
      bubbles: new Set(props.bubbles),
      stoped:false,
      game: props.game,
      win: false

    };

    this.getRandomPosition = this.getRandomPosition.bind(this);
    //this.popBubble = this.popBubble.bind(this);
    this.animateBubble = this.animateBubble.bind(this);
    this.renderBubbles = this.renderBubbles.bind(this);
    this.ready = this.ready.bind(this);
    this.init = this.init.bind(this);
    this.incrPopped = this.incrPopped.bind(this);
    this.getRndInteger = this.getRndInteger.bind(this);
    this.win = this.win.bind(this);
    this.lose = this.lose.bind(this);
    this.resetBubbles = this.resetBubbles.bind(this);
    this.renderer = this.renderer.bind(this);


  }

  componentDidUpdate() {
    if (this.state.popped < 1) {
      this.init();
    }
  }

  init() {
    const bubbles = document.querySelectorAll(".bubble");
    for (let i = 0; i < bubbles.length; i++) {
      this.animateBubble(bubbles, i);
    }
  }

  ready() {
    this.setState({
      ready: true
    });
  }

  lose(){
    const audio = document.getElementById("lose");
    audio.play();
    this.props.lose()
    this.resetBubbles()
  }

  win(){
    this.props.win()
    this.resetBubbles()
  }

  resetBubbles(){
    const bubbles = document.querySelectorAll(".bubble");
    for (let i = 0; i < bubbles.length; i++) {
      const aBubble = bubbles[i];
      aBubble.classList.remove("animating");
      window.setTimeout(function() {
        aBubble.style.display = "none";
      }, 1000);
    }
  }

  renderBubbles() {
    return [...Array(this.props.bubbleCount)].map((x, i) => (
      <Bubble id={i.toString()} key={i} pop={this.incrPopped} 
      win={this.win} lose={this.lose} popped={this.state.popped} 
      gameId={this.state.game} numBub={this.props.numBub}/> 
    ));
  }

 getRndInteger(min, max) {
    return Math.floor(Math.random() * (max - min) ) + min;
  }

  getRandomPosition(element) {
    const astage = document.getElementById("stage")
   // console.log(astage?.offsetTop) //530..

    const x = document.body.offsetHeight - element.clientHeight;
    const y = document.body.offsetWidth - element.clientWidth - astage?.offsetLeft * 2.1;
    //console.log(y) //436
    //console.log(document.body.offsetWidth)//1920

    const randomX = this.getRndInteger(document.body.clientLeft, x)
    const randomY = this.getRndInteger(document.body.clientTop, y);
    return [randomX, randomY];
  }

  animateBubble(bubbles, i) {
    const bubble = bubbles[i];
    const xy = this.getRandomPosition(bubble);
   // console.log(xy)

    Object.assign(bubble.style, {
      //position:'relative',
      top: xy[0] + "px",
      left: xy[1] + "px",
      zIndex: i,
      animationDuration: Math.floor(Math.random() * 15 + 7.5) + "s"
    });

    bubble.classList.add("animating");
  }

  incrPopped() {
    this.setState({
      popped: this.state.popped + 1
    });
    //this.props.popper(this.state.popped)
  }

  renderer = ({ seconds, completed }) => {
    if (completed) {
      this.ready()
    }
    else return <h2> STARTING IN {seconds}</h2>;
  };

  render() {
    const { popped, ready, bubbleCount, win } = this.state;
    return (
        <div className="stage" id="stage">
        <audio
          id="pop"
          src={popAudio}
        />
        <span className="score">
          Found : {popped} / {this.props.numBub}
        </span>
        <br/>
        {ready ? (
          this.renderBubbles()
        ) : (
          <Countdown date={Date.now() + 3000} renderer={this.renderer} />
        )}
        
      </div>
    );
  }
}




export default Stage;
