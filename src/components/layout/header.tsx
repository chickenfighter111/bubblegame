import {Navbar,Button,Dropdown,Badge,Container,Row,Col, Modal} from "react-bootstrap";
import React, { useEffect, useState, useMemo } from "react";
import {WalletMultiButton, WalletDisconnectButton} from "@solana/wallet-adapter-react-ui";
import { useWallet } from "@solana/wallet-adapter-react";
import { useMoralis } from "react-moralis";
import Moralis from "moralis";

import styled from "styled-components";

import {idl, network} from '../../rpc_config';
import {AnchorProvider, Program, utils, web3, BN, Wallet, Idl} from "@project-serum/anchor";

import PlayerWallet from "./playerWallet";
import DepositForm from './forms/walletManager'
import logo from './media/darklog.png'
import { LAMPORTS_PER_SOL } from "@solana/web3.js";

import { AsakaBtn, DropdownTog, DropDownItemStyled, DarkModal, ConnectBtn } from "./styles";

const StyledNav = styled(Navbar)`
background-image: linear-gradient(
  to bottom,
  #00549d  0,
  #000c18 100%
);
`
const NavContainer = styled(Container)`
  min-width: 98vw;
`
const DDMenu = styled(Dropdown.Menu)`
  background-color: #FFD966;
  a{
    color: #000000
  }
  a:hover{
    background-color: #97803a
  }
`



const MyNavbar = (props) => {
    const [hasWallet, setHasWallet] = useState(false)
    const { logout, isAuthenticated, authenticate } = useMoralis();
    const { connected, publicKey, wallet, disconnect } = useWallet();
    const [modalShow, setModalShow] = useState(false);


    function DepositModal(props) {
      return (
        <DarkModal
          {...props}
          size="lg"
          aria-labelledby="contained-modal-title-vcenter"
          centered
        >
          <Modal.Header >
            <Modal.Title id="contained-modal-title-vcenter">
              Wallet Manager
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {!hasWallet ? <PlayerWallet /> : <DepositForm balance={props.balance} setBalance={props.setBalance}/>}
          </Modal.Body>
          <Modal.Footer>
            <AsakaBtn onClick={props.onHide}>Close</AsakaBtn>
          </Modal.Footer>
        </DarkModal>
      );
    }

    //Moralis
    const connectPhantomWallet = async () => {
      try {
        await authenticate({
          signingMessage: "Register",
          type: "sol",
        })
      } catch (err) {
      }
    };

    const fetchPlayerWallet = async() =>{
      const playerWallet = Moralis.User.current().get("player_wallet");
      if (playerWallet) setHasWallet(true)
      else setHasWallet(false)
    }

    async function getBalance(){
      const aconnection = new web3.Connection(network, "processed");
      const aUser = Moralis.User.current();
      const playerPDA = aUser.get("player_wallet");
      if (playerPDA) {
        const escrow = new web3.PublicKey(playerPDA)
        try {
          let balance = await aconnection.getBalance(escrow);
          props.setBalance(Math.round(balance / LAMPORTS_PER_SOL * 100) / 100 );

        } catch (err) {
        }
      }
    }

    async function web3Logout(){
      await disconnect()
      await logout()
    }

    useEffect(() => {
      if(!isAuthenticated && connected) connectPhantomWallet()
    }, [connected])

    useEffect(() => {

      if (connected && isAuthenticated) {
        getBalance()
        fetchPlayerWallet()
      }
    }, [connected, isAuthenticated])
  
    return (
      <StyledNav sticky="top" expand="lg">
        <NavContainer>
          <Navbar.Brand className="burando" href="/">
            <span>
              <h1>
                {" "}
                <img className="App-logo" alt="logo" src={logo} /> Asaka Games{" "}
              </h1>
            </span>
          </Navbar.Brand>
             <Row>
                {!connected ? 
                (<ConnectBtn />) 
                : 
                (
                  <div>
                    <Col>
                      <Dropdown>
                        <DropdownTog>
                          Wallet: {props.balance}
                        </DropdownTog>
                        <DDMenu>
                          <DropDownItemStyled onClick={() => setModalShow(true)}>
                          Wallet manager
                          </DropDownItemStyled>
                          <DropDownItemStyled onClick={web3Logout}>Disconnect</DropDownItemStyled>
                          <DepositModal balance={props.balance} setBalance={props.setBalance} show={modalShow} onHide={() => setModalShow(false)}/>
                        </DDMenu>
                      </Dropdown>
                    </Col>
                  </div>
                )
                }
            </Row>
        </NavContainer>
      </StyledNav>
    );
  };
  
  export default MyNavbar;