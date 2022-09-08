import { Cardbtn } from './layout/styles';
import {Container,Row,Col, Table, Form} from "react-bootstrap";
import React,{useState, useMemo, useEffect} from 'react';
import Moralis from "moralis";
import {FaBomb} from 'react-icons/fa'

const RevealBtn = (props) =>{
    const [reveal, setReveal] = useState(false)
    const [bomb, setBomb] = useState(false)


    const revealBtn = async() =>{
        const audio = document.getElementById("click");
        audio.play();
        const params = {game: props.game, bubble: props.index};
        const result = await Moralis.Cloud.run("popBubble", params);
        //console.log(value)
        if(result){
            setReveal(true)
        }
        else{
            setBomb(true)
            props.lose()
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