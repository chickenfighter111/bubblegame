import React,{useState, useMemo, useEffect} from 'react';
import Navbar from './components/layout/header';
import Moralis from "moralis";
import {Container,Row,Col, Table, Form} from "react-bootstrap";
import './App.css';
import styled from "styled-components";

import { useWallet } from "@solana/wallet-adapter-react";
import { useMoralis } from "react-moralis";

import { Keypair, PublicKey, LAMPORTS_PER_SOL, clusterApiUrl, Connection, sendAndConfirmTransaction } from "@solana/web3.js";
import {idl, network} from './rpc_config';
import {AnchorProvider, Program, utils, web3, BN, Wallet, Idl} from "@project-serum/anchor";
import Buffer from 'buffer'
import { utf8 } from '@project-serum/anchor/dist/cjs/utils/bytes';

import Stage from './components/stage'
import DiscordChat from './components/discordchat';
import { AsakaBtn, AsakaRadio, StyledSelect, Cardbtn } from './components/layout/styles';
import RevealBtn from './components/revealBtn'

import winAudio from './components/layout/media/winz.wav';
import loseAudio from './components/layout/media/lose.mp3';
import clickAudio from './components/layout/media/clicz.wav';


const ContainerRow = styled(Row)`
  max-width: 99vw
`

const CardContainer = styled(Container)`
  margin-top: 50px;
  display:flex;
  padding: 40px;
  justify-content: center;
  gap: 6px;
  border: 1px solid rgb(255, 196, 0);
  border-radius: 25px;
`

function App(props) {
  const [board, setBoard] = useState<any>(null)
  const [bubbles, setBubbles] = useState<any>(null)
  const [start, setStart] = useState(false)
  const [generated, setGen] = useState(false)
  const [gameId, setGameId] = useState(null)
  const [gameMod, setGame] = useState("Bubble")

  const [numBub, setNumBub] = useState(null)
  const [n, setN] = useState(null)
  const [bet, setBet] = useState(0)

  const [mode, setDifficulty] = useState(null)




  const { logout, isAuthenticated, authenticate } = useMoralis();

  const testArr = [
    [1, 0, 0, 0, 1],
    [1, 1, 0, 0, 0],
    [0, 0, 0, 0, 1],
    [0, 1, 1, 1, 1],
    [1, 0, 0, 0, 0]
  ]

  const b58pk = "Dy5nq5Rpvkm4D6N7qVLMAwqFRvtFpRGvmKqtQFV5xjCq";
  const sk = "kKC2dbEpH808lttMVL0dhhubwYTt9S7dU6abH1+iLlPAqi9GayJwkQcOImouIWyB707c3ucjCAlOFXeFsatu7g==";
  const treasury = "2JM2X3J1JnQ7kRvLg1vF5rbNw1Hrg6AhPHx1BoQJESho"
  const escrowPDA = "FQw2TgLrfvGo92eAtXXC63amvUY9b6FnECwYPAmPfMS7"

  const { wallet, publicKey, signTransaction, signAllTransactions, connected } = useWallet();
  const anchorWallet = useMemo(() => {
    return {
      publicKey: publicKey,
      signAllTransactions: signAllTransactions,
      signTransaction: signTransaction,
    } as Wallet;
  }, [wallet]);

  const connection = new web3.Connection(network, "processed");
  const provider = new AnchorProvider(connection, anchorWallet, {
    preflightCommitment: "processed",
  });
  const program = new Program(idl as Idl, idl.metadata.address, provider);


  function generateBubbles(){
    var rngs: number[] = [];
    while(rngs.length < 5){
        var r = Math.floor(Math.random() * 5);
        if(rngs.indexOf(r) === -1) rngs.push(r);
    }
    return rngs
  }

  function generateFillRandom(){
    const zeros = new Array(25).fill(0)
    /*var rngs: number[] = [];
    while(rngs.length < 5){
        var r = Math.floor(Math.random() * 25);
        if(rngs.indexOf(r) === -1) rngs.push(r);
    }

    rngs.forEach((rng: number) => {
      zeros[rng] = 1;
    }) */

    return zeros
  }

  function generate2DFillRandom(){

    const rarray = generateFillRandom()
    const newArr:any[] = [];

    while(rarray.length){
      newArr.push(rarray.splice(0,5));
    }
    
    setBoard(newArr)
    //console.log(newArr)
    return newArr
  }

  function _arrayBufferToBase64( buffer: ArrayBufferLike ) {
    var binary = '';
    var bytes = new Uint8Array( buffer );
    var len = bytes.byteLength;
    for (var i = 0; i < len; i++) {
        binary += String.fromCharCode( bytes[ i ] );
    }
    return window.btoa( binary );
  }

  function _base64ToArrayBuffer(base64:string) {
    var binary_string = window.atob(base64);
    var len = binary_string.length;
    var bytes = new Uint8Array(len);
    for (var i = 0; i < len; i++) {
        bytes[i] = binary_string.charCodeAt(i);
    }
    return bytes.buffer;
  }

  function checkIntegrity(b1:any[][], b2:any[][]){
    var correct = true;
    for(let y = 0; y < n; y++){
      for (let x = 0; x < n; x++){
        if( b1[y][x] !== b2[y][x]){
          correct = false
        }
      }
    }
    //console.log(correct)
    return correct
  }

  async function genCloudBoard(){
    if (!generated){
      const playerId = Moralis.User.current().id
      let params;
      if(gameId){
        params = {mod: gameMod, game: gameId, playerId: playerId, mode:mode};
      } else  params = {mod: gameMod, game: null, playerId: playerId, mode:mode};
      const board = await Moralis.Cloud.run("generateBoard", params);
//
      setN(board.get("n"))
      setNumBub(board.get("numBub"))
      setGameId(board.id)
      setGen(true)
      setBubbles(board.get("bubbles"))
    }
    //setBoard(board.get("board"))
  }

  async function reset(){
    if (gameId){
      setStart(false)
      setGen(false)
      setBubbles(null)
      setBoard(null)
      const params = {game: gameId};
      await Moralis.Cloud.run("reset", params);
    }
  }

  const generateWallet = async () =>{

    const aKP = Keypair.generate()
    var b58Public = aKP.publicKey.toBase58();
    var b64 = aKP.secretKey.buffer
    const b64encoded = _arrayBufferToBase64(b64)
   // console.log([b58Public,b64encoded])
    return [b58Public,b64encoded]
  }

  async function getBalance(){
    const aconnection = new web3.Connection(network, "processed");
    const aUser = Moralis.User.current();
    const playerPDA = aUser.get("player_wallet");
    if (playerPDA) {
      const escrow = new web3.PublicKey(playerPDA)
      try {
        let balance = await aconnection.getBalance(escrow);
        props.setBalance(Math.round((balance / LAMPORTS_PER_SOL)  * 100) / 100);

      } catch (err) {
      }
    }
  }

  //deposit funds into escrow game
  const deposit = async () => {
    const aUser = Moralis.User.current()
    const walletQry = new Moralis.Query("Wallet")
    walletQry.equalTo("owner", aUser.id)
    const aWallet = await walletQry.first()

    const playerBuff = _base64ToArrayBuffer(aWallet.get("key"))
    const u8int = new Uint8Array(playerBuff)
    const escrowWallet = Keypair.fromSecretKey(u8int)
    const playerPDA = new web3.PublicKey(escrowPDA);

    try{
      const tx = await program.methods.deposit(new BN((LAMPORTS_PER_SOL*bet) -(0.0001 * LAMPORTS_PER_SOL)))
      .accounts({
        player: escrowWallet.publicKey, //from
        anAccount: playerPDA
      }).transaction() //.signers([escrowWallet]).rpc()

      const aConnection = new web3.Connection(network, 'finalized');
      tx.feePayer = escrowWallet.publicKey;
      tx.recentBlockhash = (await aConnection.getLatestBlockhash('finalized')).blockhash;
      const sig = await sendAndConfirmTransaction(connection, tx, [escrowWallet]);
     // console.log("Deposit signature ",sig)
      //const pacc = await program.account.gameAccount.fetch(playerPDA);
      getBalance()
      //console.log(pacc.deposit.toNumber()/LAMPORTS_PER_SOL)
    }
    catch(err){
   //   console.log(err)
    }
  }

  //if we lose, funds gets transferred from escrow to treasury
  const lose = async () => {
    const audio = document.getElementById("lose");
    audio.play();
    const aUser = Moralis.User.current()
    const walletQry = new Moralis.Query("Wallet")
    walletQry.equalTo("owner", aUser.id)
    const aWallet = await walletQry.first()

    const playerBuff = _base64ToArrayBuffer(aWallet?.get("key"))
    const u8int = new Uint8Array(playerBuff)
    const escrowWallet = Keypair.fromSecretKey(u8int)
    const playerPDA = new web3.PublicKey(escrowPDA);
    const treasurePDA = new web3.PublicKey(treasury);
    const player = Moralis.User.current()

    try{
      const tx = await program.methods.lose()
      .accounts({
        player: escrowWallet.publicKey, //from
        anAccount: playerPDA,
        treasuryAccount: treasurePDA
      }).transaction()

      const aConnection = new web3.Connection(network, 'finalized');
      tx.feePayer = escrowWallet.publicKey;
      tx.recentBlockhash = (await aConnection.getLatestBlockhash('finalized')).blockhash;
      const sig = await sendAndConfirmTransaction(connection, tx, [escrowWallet]);
    //  console.log("losing sigature", sig)
      const msg = `${player.id} lost ${bet} SOL... :( `
      await Moralis.Cloud.run("addAnnouncement", {msg: msg});
      await reset()
     // const pacc = await program.account.gameAccount.fetch(playerPDA);
      //console.log(pacc.deposit.toNumber()/LAMPORTS_PER_SOL)
    }
    catch(err){
     // console.log(err)
    }
  }

  //if we win, bet is transferred from treasury to escrow, then total is transferred to player wallet
  const win = async () => {
    const audio = document.getElementById("win");
    audio.play();
    const aUser = Moralis.User.current()
    const walletQry = new Moralis.Query("Wallet")
    walletQry.equalTo("owner", aUser.id)
    const aWallet = await walletQry.first()

    const playerBuff = _base64ToArrayBuffer(aWallet.get("key"))
    const u8int = new Uint8Array(playerBuff)
    const escrowWallet = Keypair.fromSecretKey(u8int)
    const playerPDA = new web3.PublicKey(escrowPDA);
    const treasurePDA = new web3.PublicKey(treasury);
    const player = Moralis.User.current()

    const won: boolean = await Moralis.Cloud.run("generateBoard", {game: gameId});
    if(won){
      try{
        const tx = await program.methods.win()
        .accounts({
          player: escrowWallet.publicKey, //from
          anAccount: playerPDA,
          treasuryAccount: treasurePDA
        }).transaction()
  
        const aConnection = new web3.Connection(network, 'finalized');
        tx.feePayer = escrowWallet.publicKey;
        tx.recentBlockhash = (await aConnection.getLatestBlockhash('finalized')).blockhash;
        const sig = await sendAndConfirmTransaction(connection, tx, [escrowWallet]);
       // console.log(sig)
        //const pacc = await program.account.gameAccount.fetch(playerPDA);
        getBalance()
        const msg = `${player.id} won ${bet} SOL! Sheeesh`
        await Moralis.Cloud.run("addAnnouncement", {msg: msg});
        await reset()
        //console.log(pacc.deposit.toNumber()/LAMPORTS_PER_SOL)
      }
      catch(err){
      //  console.log(err)
      }
    }
  }


  const Bubbles = (props) => {
     return <Stage bubbles={bubbles} bubbleCount={n} numBub={numBub} game={props.game} win={win} lose={lose}/>
  }


  const setMode = (event) =>{
    const mode = event.target.value;
    setDifficulty(mode)
  }

  const setMod = (event) =>{
    const game = event.target.value;
    setGame(game)
  }

  const setaBet = (event) =>{
    const value = event.target.value;
    setBet(value)
  }

  const reveal = async() =>{
    //const value = event.target.value;
    //console.log(value)
  }

  const startGame = async () =>{
    if(bet >= 0.1 && bet <= 1 ){
      const aconnection = new web3.Connection(network, "finalized");
      const aUser = Moralis.User.current();
      const playerPDA = aUser.get("player_wallet");
      if (playerPDA) {
        const escrow = new web3.PublicKey(playerPDA)
        try {
          //let balance = Math.round(((await aconnection.getBalance(escrow)) /LAMPORTS_PER_SOL * 100) / 100)
          //props.setBalance(balance)
       //   console.log(props.balance)
          if (props.balance >= 0.1){
            //await deposit()
            if (gameMod === "Classic") generate2DFillRandom()
            setStart(true)
          }
         // else console.log("you're poor")
        } catch (err) {
        }
      }
    }
  }

  useEffect(() => {
    if(start){
      genCloudBoard();
    }
  },[start])

  const MainContainer = () => {
    return (
      <Container>
        <div className="mainContainer">
          {start && bubbles && gameId ? 
          (<div>
             <audio
                id="lose"
                src={loseAudio}
            />
            <audio
                id="win"
                src={winAudio}
            />
            <audio
                id="click"
                src={clickAudio}
            />
            {(gameMod === "Bubble") ? <Bubbles game={gameId}/> 
            : (
              <div>
                {board ? 
                <div className="centered"><ClassicMod game={gameId} reveal={reveal} board={board} win={win} lose={lose}/></div>
                : null
                }
              </div>
            )
            }
          </div>) : 
          (
          <div className='gameForm'>
            <Row className="justify-content-md-center gameMod">
            <h2>MODE</h2> 
            <StyledSelect size="lg" value={gameMod} onChange={setMod}>
              <option value="Bubble">Bubble</option>
              <option value="Classic">Classic</option>
            </StyledSelect>
            </Row>
            <Row className="justify-content-md-center">
              <h2>DIFFICULTY</h2> 
              <Col md={2}><AsakaBtn onClick={setMode} value="easy"> Easy</AsakaBtn></Col>
              <Col md={2}><AsakaBtn onClick={setMode} value="normal"> Normal</AsakaBtn></Col>
              <Col md={2}><AsakaBtn onClick={setMode} value="hard"> Hard</AsakaBtn></Col>
            </Row>
            <br/>
            <Form>
            <Row className="justify-content-md-center bets">
              <h2>BET</h2> 
              <Col  sm={2} ><AsakaRadio onClick={setaBet} value={0.1} type="radio" name="group1" label="0.1 SOL" /></Col>
              <Col  sm={2}><AsakaRadio onClick={setaBet} value={0.5} type="radio" name="group1" label="0.5 SOL" /></Col>
              <Col  sm={2} ><AsakaRadio onClick={setaBet} value={1} type="radio" name="group1" label="1 SOL" /></Col>
            </Row>
            </Form>
          <br/>
          <Row>
          <Col><AsakaBtn onClick={startGame} > Pay</AsakaBtn></Col>
          </Row>
          </div>
          )
          }
        </div>
      </Container>
    )
  }

  if(connected && isAuthenticated){
    return (
      <ContainerRow>

        <Col><DiscordChat started={start}/></Col >
        <Col lg={6}><MainContainer/></Col>
        <Col><CardContainer><Announcements connected={isAuthenticated}/></CardContainer></Col>
      </ContainerRow>
    );
  }
}

const Announcements = (props) => {
  const [announcements, setAnnouncements] = useState<string[]>([])

  function addAnnouncement(msg: string){
    announcements.shift()
    announcements.push(msg)
  }

  async function getAnnouncements(){
    const anns = await Moralis.Cloud.run("getMostRecentGames", {});
    setAnnouncements(anns)
  }

  useEffect(() => {
    const newAnnouncementPing = async () => {
      let query = new Moralis.Query("Announcement");
      let subscription = await query.subscribe();
      subscription.on("create",(object) => {
        if(announcements.length === 15) addAnnouncement(object.get("msg"))
        else announcements.push(object.get("msg"))
      });
  };
    if (props.connected){
      newAnnouncementPing()
    }

    if(announcements.length === 0){
      getAnnouncements()
    }
  }, [announcements])

  return(
    <div className='announcements'>
        <Table responsive borderless>
              <thead>
                <tr>
                  <th colSpan={5}> </th>
                </tr>
              </thead>
              <tbody> 
                  {announcements ? (
                    announcements.map((ann: any, idx:number) => {
                    return(
                      <tr key={idx}>
                         <td colSpan={5}><p>{ann.msg}</p></td>
                      </tr>
                    )
                  })
                  ) : null}
              </tbody>
        </Table>
    </div>
  )
}

const ClassicMod = (props) => {
  return(
    (props.board.map((aRow, i) => {
      return(
        <Row key={i} className='justify-content-md-center chickens'>
        {
          aRow.map((val, idx) =>{
            return(
              <RevealBtn lose={props.lose} win={props.win} game={props.game} key={(((i) * (5)) + idx)} akey={(((i) * (5)) + idx).toString()} index={((i) * (5)) + idx} reveal={props.reveal}/>
            )
          })
        }
      </Row>
      )
    }))
  )
}

export default App;
