import React, { useEffect, useState, useMemo } from "react";
import { Button, Modal, Form, Dropdown } from "react-bootstrap";
import styled from 'styled-components'

import { LAMPORTS_PER_SOL, sendAndConfirmTransaction, Keypair } from "@solana/web3.js";
import * as anchor from "@project-serum/anchor";
import { AnchorProvider, Program, utils, web3, BN } from "@project-serum/anchor";
import { useWallet } from "@solana/wallet-adapter-react";

import {network, idl} from '../../../rpc_config'

import Moralis from "moralis";
import { useMoralis } from "react-moralis";

import sol from '../media/solc.png'

const StyledInput = styled(Form.Control)`
  margin-top: 10px;
  width: 100px;
`
const StyledSelect = styled(Form.Select)`
  margin-top: 10px;
  width: 120px;
`
const FormButton = styled(Button)`
  border-radius: 20px;
  margin-right: 10px;
  margin-bottom: 30px;
  background-color: #FFD966;
  color: #000000;
  border-color: #000000;
  margin-top: 20px;
  box-shadow: -3px 3px orange, -2px 2px orange, -1px 1px orange;
  border: 1px solid black;
  &:hover {
    background-color: #97803a;
    border-color: #000000;
    
  }
`

export default function DepositForm(props) {
    const [amount, setAmount] = useState(0.1);
    const { wallet, publicKey, signTransaction, signAllTransactions } = useWallet();
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
    const program = new Program(idl, idl.metadata.address, provider);

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

    const deposit = async (event) => {
      event.preventDefault();
      const aUser = Moralis.User.current();
      const playerPDA = aUser.get("player_wallet");
      if (playerPDA) {
        const escrow = new anchor.web3.PublicKey(playerPDA)
        try {
          const tx = await program.methods.depozit(new BN(amount*LAMPORTS_PER_SOL))
            .accounts({
              from: publicKey,
              escrowAcc: escrow
            }).rpc()  
          //  console.log(tx)
          await getBalance();//refresh
        } catch (err) {
      //   console.log(err)
        }
      }
    };

    const withdraw = async (event) => {
      async function _base64ToArrayBuffer(base64) {
        var binary_string = window.atob(base64);
        var len = binary_string.length;
        var bytes = new Uint8Array(len);
        for (var i = 0; i < len; i++) {
            bytes[i] = binary_string.charCodeAt(i);
        }
        return bytes.buffer;
     }

        event.preventDefault();
        const aUser = Moralis.User.current();
        const playerPDA = aUser.get("player_wallet");
        if (playerPDA) {
          try {
            const walletQry = new Moralis.Query("Wallet")
            walletQry.equalTo("owner", aUser.id)
            const aWallet = await walletQry.first()
            //console.log(aWallet)
            const arraybuf = await _base64ToArrayBuffer(aWallet.get("key"))
            const u8int= new Uint8Array(arraybuf)
            const escrowWallet = Keypair.fromSecretKey(u8int)
            const wTx = await program.methods.widrawl(new BN(LAMPORTS_PER_SOL*amount-(0.001*LAMPORTS_PER_SOL)))
            .accounts({
              escrowAcc: escrowWallet.publicKey,
              toMe: publicKey
            }).transaction()
            const aConnection = new web3.Connection(network, 'finalized');
            wTx.feePayer = escrowWallet.publicKey;
            wTx.recentBlockhash = await aConnection.getLatestBlockhash('finalized').blockhash;
            //const signedTx = wTx.sign([escrowWallet])
            const sig = await sendAndConfirmTransaction(connection, wTx, [escrowWallet], {commitment: "processed"});
          //  console.log(sig)
            await getBalance(); //refresh
          } catch (err) {
         //   console.log(err)
          }
        }
    };

    const handleInput = (event) => {
      setAmount(event.target.value);
    };

    return (
      <Form>
        <Form.Group className="mb-3" controlId="formBasicEmail">
          <Form.Label> Deposit/Withdraw <img src={sol} width={35} height={25} alt="$SOL"/></Form.Label>
          <StyledInput
            required
            type="number"
            value={amount}
            min={0.1}
            placeholder="Enter amount to deposit"
            onChange={handleInput}
          />
          <Form.Text className="text-muted"><span>Your deposit</span></Form.Text>
        </Form.Group>
        <FormButton variant="primary" type="submit" onClick={deposit}>
          Deposit
        </FormButton>
        <FormButton variant="primary" type="submit" onClick={withdraw}>
          Withdraw
        </FormButton>
      </Form>
    );
  }