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

import useSound from 'use-sound';

import {NoFundsPopper, WinPopper, LosePopper} from './components/layout/popup'

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
  const [ended, setEnded] = useState(false)
  const [generated, setGen] = useState(false)
  const [gameId, setGameId] = useState(null)
  const [gameMod, setGame] = useState("bubble")

  const [numBub, setNumBub] = useState(null)
  const [n, setN] = useState(null)
  const [bet, setBet] = useState(0.1)
  const [popped, setPopped] = useState(false)
  const [mode, setDifficulty] = useState("easy")

  const [noFunds, setNoFunds] = useState(false);
  const [resultPopper, setResPopper] = useState(false);
  const [losePopper, setLosePopper] = useState(false);
  const [canClose, setCanClose] = useState(false);

  const [winSound] = useSound(winAudio, {volume: 0.3});
  const [loseSound] = useSound(loseAudio, {volume: 0.3});

  const { logout, isAuthenticated, authenticate } = useMoralis();

  const tres = "GFkgJ17mQJTx91xCcZvbKqhAYQStTUHWQBqeWJZnoDjT"
  //const escrowPDA = "FQw2TgLrfvGo92eAtXXC63amvUY9b6FnECwYPAmPfMS7"

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

  async function initTrez(){
    let [treasuryPDA, abump] = await web3.PublicKey.findProgramAddress(
      [utf8.encode("treazury_wallet").buffer], program.programId);
    try{
      await program.methods.init(abump).accounts({
        treasuryAccount: treasuryPDA,
        player: anchorWallet.publicKey
      }).rpc()
     // console.log(treasuryPDA.toBase58())
    }
    catch(err){
     // console.log(err)
    }
  }

  async function initPlayer(){
    const aUser = Moralis.User.current()
    const walletQry = new Moralis.Query("Wallet")
    walletQry.equalTo("owner", aUser.id)
    const aWallet = await walletQry.first()

    const playerBuff = _base64ToArrayBuffer(aWallet.get("key"))
    const u8int = new Uint8Array(playerBuff)
    const escrowWallet = Keypair.fromSecretKey(u8int)

    let [accPDA, accBump] = await web3.PublicKey.findProgramAddress(
      [utf8.encode("escrow_wallet").buffer, escrowWallet.publicKey.toBuffer()], program.programId);
   
    try{
      const tx = await program.methods.initialize(accBump)
      .accounts({
        anAccount: accPDA,
        signer: anchorWallet.publicKey,
        player: escrowWallet.publicKey
      }).rpc()
     // console.log(treasuryPDA.toBase58())
    }
    catch(err){
     // console.log(err)
    }
  }

  function generate2DFillRandom(){
    function generateFillRandom(){
      const zeros = new Array(25).fill(0)
      return zeros
    }
    const rarray = generateFillRandom()
    const newArr:any[] = [];

    while(rarray.length){
      newArr.push(rarray.splice(0,5));
    }
    
    setBoard(newArr)
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

  async function genCloudBoard(){
    if (!generated){
      const playerId = Moralis.User.current().id
      let params;
      if(gameId) params = {mod: gameMod, game: gameId, playerId: playerId, mode:mode};
      else  params = {mod: gameMod, game: null, playerId: playerId, mode:mode};
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
      const params = {game: gameId};
      await Moralis.Cloud.run("reset", params);

      setGameId(null)
      setStart(false)
      setEnded(false)
      setGen(false)
      setBubbles(null)
      setBoard(null)

      setN(null)
      setNumBub(null)
      setPopped(false)
      
    }
  }

  async function getBalance(){
    const aconnection = new web3.Connection(network, "processed");
    const aUser = Moralis.User.current();
    const playerPDA = aUser.get("player_wallet");
    if (playerPDA) {
      const escrow = new web3.PublicKey(playerPDA)
      try {
        let balance = await aconnection.getBalance(escrow);
        props.setbalance(Math.round((balance / LAMPORTS_PER_SOL)  * 100) / 100);

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

    let [playerPDA, accBump] = await web3.PublicKey.findProgramAddress(
      [utf8.encode("escrow_wallet").buffer, escrowWallet.publicKey.toBuffer()], program.programId);

   //DISABLED FOR BETA
    try{
      const tx = await program.methods.depositz(new BN((LAMPORTS_PER_SOL*bet) -(0.0001 * LAMPORTS_PER_SOL)), mode.toLowerCase())
      .accounts({
        player: escrowWallet.publicKey, //from
        anAccount: playerPDA
      }).transaction() //.signers([escrowWallet]).rpc()

      const aConnection = new web3.Connection(network, 'finalized');
      tx.feePayer = escrowWallet.publicKey;
      tx.recentBlockhash = (await aConnection.getLatestBlockhash('finalized')).blockhash;
      const sig = await sendAndConfirmTransaction(connection, tx, [escrowWallet], {commitment: "processed"});
      //console.log("Deposit signature ",tx)
      const pacc = await program.account.gameAccount.fetch(playerPDA);
     // console.log(pacc)
      getBalance()
    }
    catch(err){
    // console.log(err)
    }

  }

  //if we lose, funds gets transferred from escrow to treasury
  const lose = async () => {

    const aUser = Moralis.User.current()
    const walletQry = new Moralis.Query("Wallet")
    walletQry.equalTo("owner", aUser.id)
    const aWallet = await walletQry.first()
    const playerBuff = _base64ToArrayBuffer(aWallet?.get("key"))
    const u8int = new Uint8Array(playerBuff)
    const escrowWallet = Keypair.fromSecretKey(u8int)

    let [playerPDA, accBump] = await web3.PublicKey.findProgramAddress(
      [utf8.encode("escrow_wallet").buffer, escrowWallet.publicKey.toBuffer()], program.programId);
    const treasurePDA = new web3.PublicKey(tres);
    losePop()

    //DISABLED FOR BETA
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
      const sig = await sendAndConfirmTransaction(connection, tx, [escrowWallet], {commitment: "processed"});

      //console.log("losing sigature", sig)
      const msg = `${aUser.getUsername()} lost ${bet} SOL... :( `
      await Moralis.Cloud.run("addAnnouncement", {msg: msg});
      setEnd()
      setCanClose(true)
     // const pacc = await program.account.gameAccount.fetch(playerPDA);
      //console.log(pacc.deposit.toNumber()/LAMPORTS_PER_SOL)
    }
    catch(err){
     // console.log(err)
    }
  }

  //if we win, bet is transferred from treasury to escrow, then total is transferred to player wallet
  const win = async (ratio:number) => {
    const aUser = Moralis.User.current()
    const walletQry = new Moralis.Query("Wallet")
    walletQry.equalTo("owner", aUser.id)
    const aWallet = await walletQry.first()

    const playerBuff = _base64ToArrayBuffer(aWallet.get("key"))
    const u8int = new Uint8Array(playerBuff)
    const escrowWallet = Keypair.fromSecretKey(u8int)

    let [playerPDA, accBump] = await web3.PublicKey.findProgramAddress(
      [utf8.encode("escrow_wallet").buffer, escrowWallet.publicKey.toBuffer()], program.programId);
    const treasurePDA = new web3.PublicKey(tres);
    winPop()
    //DISABLED FOR BETA
    try{
      const tx = await program.methods.winz(await Moralis.Cloud.run("checkWinner", {game: gameId}) as number) //.win()
      .accounts({
        player: escrowWallet.publicKey, //from
        anAccount: playerPDA,
        treasuryAccount: treasurePDA
      }).transaction()

      const aConnection = new web3.Connection(network, 'finalized');
      tx.feePayer = escrowWallet.publicKey;
      tx.recentBlockhash = (await aConnection.getLatestBlockhash('finalized')).blockhash;
      await sendAndConfirmTransaction(connection, tx, [escrowWallet], {commitment: "processed"}); 
      const msg = `${aUser.getUsername()} won ${(bet*ratio).toPrecision(3)} SOL! Sheeesh`
      await Moralis.Cloud.run("addAnnouncement", {msg: msg});
      setEnd()
      setCanClose(true)
      getBalance()

     // const pacc = await program.account.gameAccount.fetch(playerPDA);
      //console.log(pacc)
    }
    catch(err){
   //   console.log(err)
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

  const setEnd = () => {
    setEnded(true)
  }

  const reveal = async() =>{
    //const value = event.target.value;
    //console.log(value)
  }

  const startGame = async () =>{
    if(bet >= 0.1 && bet <= 1 ){
      const aUser = Moralis.User.current();
      const playerPDA = aUser.get("player_wallet");
      if (playerPDA) {
        try {
          if (props.balance > 0.1 && props.balance >= bet){
            await deposit()
            if (gameMod.toLowerCase() === "classic") generate2DFillRandom()
            setStart(true)
          }else{
            setNoFunds(true)
          }
         // else console.log("you're poor")
        } catch (err) {
        }
      }
    }
  }

  const popping = (val) =>{
    setPopped(val)
  }

  const winPop = () =>{
    setResPopper(true)
    winSound()
  }

  const losePop = () =>{
    setLosePopper(true)
    loseSound()
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
          <NoFundsPopper noFunds={noFunds} close={() => setNoFunds(false)} />
          <WinPopper noFunds={resultPopper} canClose={canClose} close={async () => {
            if(canClose){
              setResPopper(false)
              await reset()
            }
          }} />
          <LosePopper noFunds={losePopper} canClose={canClose} close={async() => {
            if(canClose){
              setLosePopper(false)
              await reset()
            }
          }} />
          {start && bubbles && gameId ? 
          (<div>
            <audio
                id="click"
                src={clickAudio}
            />
            {(gameMod === "bubble" && !ended) ? <Bubbles game={gameId}/> 
            : (
              <div >
                {board  && !ended ? 
                  <div className="centered" >
                    <ClassicMod setEnded={setEnd} ended={ended} game={gameId} 
                      reveal={reveal} board={board} win={win} lose={lose} setPop={popping}/>
                  </div>
                : null
                }
              </div>
            )
            }
             <ClaimContainer setEnd={setEnd} ended={ended} mode={mode}
              gameId={gameId} start={start} generated={generated} board={board} 
              bubbles={bubbles} bet={bet} win={win} popped={popped} setPop={popping}/>
          </div>) : 
          (
          <div className='gameForm'>
            <Row className="justify-content-md-center gameMod">
            <Col sm={3}><h2>GAME </h2> 
            <Container><StyledSelect  size="lg" value={gameMod} onChange={setMod}>
              <option value="bubble">Bubble </option>
              <option value="classic">Classic </option>
            </StyledSelect></Container></Col>
            <Col sm={3}><h2>MODE</h2> 
              <Container><StyledSelect size="lg" value={mode} onChange={setMode}>
                <option value="easy">Easy</option>
                <option value="normal">Normal</option>
                <option value="hard">Hard</option>
              </StyledSelect></Container></Col>
              <Col sm={3}><h2>BET</h2> 
              <Container><StyledSelect size="lg" value={bet} onChange={setaBet}>
                <option value={0.1}>0.1 SOL</option>
                <option value={0.25}>0.25 SOL</option>
                <option value={0.5}>0.5 SOL</option>
                <option value={1}>1 SOL</option>
              </StyledSelect></Container>
              </Col>
            </Row>
          <AsakaBtn className="btnFrom" onClick={startGame} > Play</AsakaBtn>
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
        <Col lg={6}>
        <MainContainer/>
        </Col>
        <Col><CardContainer><Announcements connected={isAuthenticated}/></CardContainer></Col>
      </ContainerRow>
    );
  }
}

const Announcements = (props) => {
  const [announcements, setAnnouncements] = useState<any[]>([])

  function addAnnouncement(msg: any){
    announcements.pop()
    announcements.unshift(msg)
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
        if(announcements.length === 10) addAnnouncement(object)
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
                         <td colSpan={5}><p>{ann.get("msg")}</p></td>
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
        <Row   key={i} className='justify-content-md-center chickens'>
        {
          aRow.map((val, idx) =>{
            return(
              <RevealBtn setEnded={props.setEnded} ended={props.ended} 
              popper={props.popper} lose={props.lose} win={props.win} game={props.game} 
              key={(((i) * (5)) + idx)} akey={(((i) * (5)) + idx).toString()} index={((i) * (5)) + idx} 
              reveal={props.reveal}/>
            )
          })
        }
      </Row>
      )
    }))
  )
}

const ClaimContainer = (props) => {
  const [popped, setPopped] = useState(0)
  const [ratio, setRatio] = useState(null)
  const [updated, setUpdated] = useState(false)


  function getRatio(val) {
    let ratio;
    switch (props.mode) {
      case "easy": {
        switch (val) {
          case 1:
            ratio = 1.01;
            break;
          case 2:
            ratio = 1.08;
            break;
          case 3:
            ratio = 1.12;
            break;
          case 4:
            ratio = 1.18;
            break;
          case 5:
            ratio = 1.24;
            break;
          case 6:
            ratio = 1.3;
            break;
          case 7:
            ratio = 1.37;
            break;
          case 8:
            ratio = 1.47;
            break;
          case 9:
            ratio = 1.55;
            break;
          case 10:
            ratio = 1.65;
            break;
          case 11:
            ratio = 1.77;
            break;
          case 12:
            ratio = 1.9;
            break;
          case 13: ratio = 2.06; break;
          case 14: ratio = 2.25; break;
          case 15: ratio = 10.47; break;
          case 16: ratio = 2.47; break;
          case 17: ratio = 3.09; break;
          case 18: ratio = 3.54; break;
          case 19: ratio = 4.12; break;
          case 20: ratio = 4.94; break;  
          default:
            break;
        }; break;
      }
      case "normal": {
        switch (val) {
          case 1:
            ratio = 1.12;
            break;
          case 2:
            ratio = 1.29;
            break;
          case 3:
            ratio = 1.48;
            break;
          case 4:
            ratio = 1.71;
            break;
          case 5:
            ratio = 2.0;
            break;
          case 6:
            ratio = 2.35;
            break;
          case 7:
            ratio = 2.79;
            break;
          case 8:
            ratio = 3.35;
            break;
          case 9:
            ratio = 4.05;
            break;
          case 10:
            ratio = 5.0;
            break;
          case 11:
            ratio = 6.17;
            break;
          case 12:
            ratio = 7.4;
            break;
          case 13: ratio = 8.06; break;
          case 14: ratio = 9.25; break;
          case 15: ratio = 10.47; break;

          default:
            break;
        }; break;
      }
      case "hard": {
        switch (val) {
          case 1:
            ratio = 1.24;
            break;
          case 2:
            ratio = 1.56;
            break;
          case 3:
            ratio = 2.0;
            break;
          case 4:
            ratio = 2.58;
            break;
          case 5:
            ratio = 3.23;
            break;
          case 6:
            ratio = 4.52;
            break;
          case 7:
            ratio = 5.89;
            break;
          case 8:
            ratio = 6.4;
            break;
          case 9:
            ratio = 8.5;
            break;
          case 10:
            ratio = 12.1;
            break;
          default:
            break;
        }; break;
      }
      default:
        break;
    }
    setRatio(ratio)
   // setUpdated(true)
  }

  useEffect(() => {
    const poppedPing = async () => {
      let query = new Moralis.Query("Game");
      query.equalTo("objectId", props.gameId)
      //query.equalTo("popped", popped)
      query.select("popped")
      let subscription = await query.subscribe();
      subscription.on("update",(object) => {
        const newVal = object.get("popped")
        
        //setPopped(object.get("popped"))
        if(newVal !== popped){
          getRatio(newVal)
        }
      })
    };

    if(props.start && props.generated && (props.board || props.bubbles)){
      poppedPing()
    }
  },[props.start, props.generated,  props.board, props.bubbles]) 
  
  return(
    <div className='gameForm'>
    <h2 className='rew'>Rewards</h2>
    <h4 >{props.bet} x {ratio} SOL</h4>
      <AsakaBtn onClick={() => props.win(ratio)}> Claim </AsakaBtn>
  </div>
  )
}

export default App;
