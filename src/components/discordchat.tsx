import {Container, Col, Button} from "react-bootstrap";
import WidgetBot from "@widgetbot/react-embed";
import React, { useState, useEffect } from "react";
import styled from "styled-components"

import { AsakaBtn } from "./layout/styles";

const DarkBtn = styled(Button)`
  width: 150px;
  height: 45px;
  font-size: 25px;
  margin-bottom: 10px;
  background-color: 
`

const CardContainer = styled(Container)`
  margin-left: 20px;
  margin-right: 20px;
  margin-top: 20px;
  display:flex;
  justify-content: center;
  border: 1px solid rgb(255, 196, 0);
  border-radius: 25px;

`


const DiscordChat = (props) => {
  const [hide, setHide] = useState(true);
  
  const hideShow = async () =>{
    if(hide) setHide(false)
    else setHide(true)
   }

   useEffect(() => {
    if (props.started) setHide(true)
   },[props.started])

    return (
        <CardContainer>
        {hide ? (<AsakaBtn disabled={props.started} onClick={hideShow}>Show chat</AsakaBtn>) 
              :  (
              <div className="discordChat">
                <AsakaBtn disabled={props.started}  onClick={hideShow}>Hide chat</AsakaBtn>
                <WidgetBot
                  server="1002944553050968215"
                  channel="1002949643077963857"
                  height="70vh"
                  width='20vw'
                />
              </div>)}
        </CardContainer>
    );
  }

  export default DiscordChat;