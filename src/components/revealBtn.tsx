import { Cardbtn } from './layout/styles';
import {Container,Row,Col, Table, Form} from "react-bootstrap";
import React,{useState, useMemo, useEffect} from 'react';
import Moralis from "moralis";
import {FaBomb} from 'react-icons/fa'

const RevealBtn = (props) =>{
    const [reveal, setReveal] = useState(false)
    const [bomb, setBomb] = useState(false)


    const revealBtn = async(event) =>{
        const audio = document.getElementById("click");
        audio.play();
        const value = event.target.value;
        const params = {game: props.game, bubble: Number(value)};
        const result = await Moralis.Cloud.run("popBubble", params);
        //console.log(value)
        if(result){
            setBomb(true)
            props.lose()
        }
        else{
        setReveal(true)
        }
    }

    return(
        <Col key={props.akey} className='cardCol' md={2}>
            {
                !reveal ? 
                (<div>
                    {!bomb ? 
                    <Cardbtn value={props.index} onClick={revealBtn} className='aCard'><h2>?</h2></Cardbtn>
                    : 
                    <Cardbtn value={props.index} className='aCard'><FaBomb size={30}/></Cardbtn>
                    }
                </div>)
                : null
            }
        </Col>
    )
}

export default RevealBtn