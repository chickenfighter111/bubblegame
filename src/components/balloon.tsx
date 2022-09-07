import React,{useState, useEffect} from 'react';
import Moralis from "moralis";
//import balloon from './layout/media/bubble.png'
import {FaBomb} from 'react-icons/fa'

const Bubble = (props) => {
    const [popped, setPopped] = useState(false)
    const [correct, setCorrect] = useState(true) 
    const [gameId, setGameId] = useState(props.gameId)

    async function popBubble(event) {
        //When popping, should send cloud request to check if that index was 0 or 1
        const params = {game: gameId, bubble: Number(props.id)};
        const result = await Moralis.Cloud.run("popBubble", params);
        event.preventDefault();
        const bubble = event.target;
        const audio = document.getElementById("pop");
        bubble.classList.remove("animating");
        bubble.classList.add("popped");
        audio.play();
        //console.log(props.id)

        setPopped(true)
        if (result){
          props.pop()
          if(props.popped === props.numBub){
            props.win()
          }
        } else{
          setCorrect(false)
          props.lose()
        }
        window.setTimeout(function() {
          bubble.style.display = "none";
        }, 1000);
        
    }

    return (
      <div>
        {correct ? <div className="bubble" onClick={popBubble} /> :
        <div className="bubble"><FaBomb size={20}/> </div>
        }
      </div>
    )
    ;
};

export default Bubble;
