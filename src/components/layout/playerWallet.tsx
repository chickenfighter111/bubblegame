import React, { useState, useEffect, useMemo } from "react";
import Form from "react-bootstrap/Form";
import Moralis from "moralis";
import { useMoralis } from "react-moralis";
import { useWallet } from "@solana/wallet-adapter-react";
import { AnchorProvider, Program, utils, web3, } from "@project-serum/anchor";
import { Keypair, PublicKey, LAMPORTS_PER_SOL, clusterApiUrl, Connection, sendAndConfirmTransaction } from "@solana/web3.js";
import * as anchor from "@project-serum/anchor";
import Buffer from 'buffer'
import {idl, network} from '../../rpc_config';

import { AsakaBtn } from "./styles";
const utf8 = utils.bytes.utf8;

function PlayerWallet() {
  const { isAuthenticated } = useMoralis();
  const [username, setUsername] = useState("");
  const { connected, wallet, publicKey, signTransaction, signAllTransactions } =
    useWallet();
  const anchorWallet = useMemo(() => {
    if (!wallet || !publicKey || !signTransaction || !signAllTransactions) {
      return;
    }

    return {
      publicKey: publicKey,
      signAllTransactions: signAllTransactions,
      signTransaction: signTransaction,
    };
  }, [wallet]);

  const connection = new web3.Connection(network, "processed");
  const provider = new AnchorProvider(connection, anchorWallet, {
    preflightCommitment: "processed",
  });
  const program = new Program(idl as Idl, idl.metadata.address, provider);

  const createWallet = async (event) => {
    event.preventDefault();
    if (username) {
      await create_player_wallet().then(() => {
        alert("Player wallet created!")
        window.location.reload()
      })

    }
  };

  const generateWallet = async () =>{
    function _arrayBufferToBase64( buffer ) {
        var binary = '';
        var bytes = new Uint8Array( buffer );
        var len = bytes.byteLength;
        for (var i = 0; i < len; i++) {
            binary += String.fromCharCode( bytes[ i ] );
        }
        return window.btoa( binary );
    }

    function _base64ToArrayBuffer(base64) {
      var binary_string = window.atob(base64);
      var len = binary_string.length;
      var bytes = new Uint8Array(len);
      for (var i = 0; i < len; i++) {
          bytes[i] = binary_string.charCodeAt(i);
      }
      return bytes.buffer;
    }

    const aKP = Keypair.generate()
    var b58Public = aKP.publicKey.toBase58();
    var b64 = aKP.secretKey.buffer
    const b64encoded = _arrayBufferToBase64(b64)
    return [b58Public,b64encoded]
  }

  const initPlayerAccount = async (pk:string) => {
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

    //const player = Moralis.User.current()
    const playerBuff = _base64ToArrayBuffer(pk)
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
    }
    catch(err){
      console.log(err)
    }
  }

  const create_player_wallet = async () =>{
    const aKp_string = await generateWallet();
    const currentUser =  Moralis.User.current();
    const params = { address: aKp_string[0], kp: aKp_string[1], owner: currentUser.id};
    const aWallet = await Moralis.Cloud.run("createWallet", params);
    currentUser.set("username", username);
    currentUser.set("player_wallet", aKp_string[0]);
    await currentUser.save()
    aWallet.setACL(new Moralis.ACL(currentUser));
    await aWallet.save()
    await initPlayerAccount(aKp_string[1])
  }

  const handleInput = (event) => {
    setUsername(event.target.value);
  };

  useEffect(() => {
    if (isAuthenticated) {
      const aUser = Moralis.User.current();
      const someUser = aUser.getUsername();
      setUsername(someUser);
    }
  }, [isAuthenticated]);

  return (
    <Form>
      <Form.Group className="mb-3" 
          placeholder="Enter username">
        <Form.Label>Create your player wallet</Form.Label>
        <Form.Control
          required
          type="text"
          value={username}
          onChange={handleInput}
        />
        <Form.Text className="text-muted">Your in-game username</Form.Text>
      </Form.Group>
      <AsakaBtn variant="primary" type="submit" onClick={createWallet}>
        Submit
      </AsakaBtn>
    </Form>
  );
}

export default PlayerWallet;
