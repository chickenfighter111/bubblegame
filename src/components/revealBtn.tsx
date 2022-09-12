import { Cardbtn } from './layout/styles';
import {Container,Row,Col, Table, Form} from "react-bootstrap";
import React,{useState, useMemo, useEffect} from 'react';
import Moralis from "moralis";
import {FaBomb} from 'react-icons/fa'

import logo from './layout/media/asaka.png'

import AOS from "aos";
import "aos/dist/aos.css";

const RevealBtn = (props) =>{
    const [reveal, setReveal] = useState(false)
    const [bomb, setBomb] = useState(false)

    useEffect(() => {
        AOS.init({ 
          duration: 1500,
          offset:0,
          once: true
        });
      }, []);

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
            props.lose()
        }
    }

    return(
        <Col key={props.akey} className='cardCol' md={2}>
            {
                !reveal ? 
                (<div >
                    {!bomb ? 
                    <Cardbtn data-aos="flip-left" data-aos-easing="ease-in-out" value={props.index} onClick={revealBtn} className='aCard'></Cardbtn>
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