import {Modal, Col, Button, Dropdown, Form} from "react-bootstrap";
import {WalletMultiButton} from "@solana/wallet-adapter-react-ui";
import styled from "styled-components"

export const AsakaBtn = styled(Button)`
max-width: 150px;
height: 45px;
font-size: 25px;
margin-bottom: 10px;
background-color: #FFD966;
color: #000000;
border-color: #000000;
box-shadow: -3px 3px orange, -2px 2px orange, -1px 1px orange;
border: 1px solid black;

.btn-primary{
  background-color: #97803a !important;
  border-color: #000000;
  box-shadow: -3px 3px orange, -2px 2px orange, -1px 1px orange;
  border: 1px solid orange;
}

&:hover {
  background-color: #97803a !important;
  border-color: #000000;
  box-shadow: -3px 3px orange, -2px 2px orange, -1px 1px orange;
  border: 1px solid orange;
&:focus{
  background-color: #97803a;
  border-color: #000000;
  box-shadow: #FFD966;
  box-shadow: -3px 3px orange, -2px 2px orange, -1px 1px orange;
  border: 1px solid black !important;

}
&:active{
  background-color: #97803a !important;
  border-color: #000000 !important;
  box-shadow: -3px 3px orange, -2px 2px orange, -1px 1px orange !important;
  border: 1px solid black !important;
}
&:disabled{
  background-color: #97803a;
  border-color: #000000;
  box-shadow: #FFD966
  box-shadow: -3px 3px orange, -2px 2px orange, -1px 1px orange;
  border: 1px solid orange;
}
`

export const ConnectBtn = styled(WalletMultiButton)`
width: 200px;
height: 45px;
font-size: 25px;
margin-bottom: 10px;
background-color: #FFD966;
color: #000000;
border-color: #000000;
box-shadow: -3px 3px orange, -2px 2px orange, -1px 1px orange;
border: 1px solid black;

&:hover {
  background-color: #97803a !important;
  color: #ffffff !important;
  border-color: #000000;
  box-shadow: -3px 3px orange, -2px 2px orange, -1px 1px orange;
  border: 1px solid orange;
}
&:focus{
  background-color: #97803a;
  border-color: #000000;
  box-shadow: #FFD966
  box-shadow: -3px 3px orange, -2px 2px orange, -1px 1px orange;
  border: 1px solid orange;
}
&:disabled{
  background-color: #97803a;
  border-color: #000000;
  box-shadow: #FFD966
  box-shadow: -3px 3px orange, -2px 2px orange, -1px 1px orange;
  border: 1px solid orange;
}
`

export const DropdownTog = styled(Dropdown.Toggle)`
  width: 250px;
  height: 45px;
  font-size: 25px;
  background-color: #FFD966;
  border-color: #000000;
  color: #000000;
  box-shadow: -3px 3px orange, -2px 2px orange, -1px 1px orange;
  border: 1px solid black;
  &:hover {
    background-color: #97803a;
    border-color: #000000;
    box-shadow: #FFD966
  }
  &:focus{
    background-color: #97803a;
    border-color: #000000;
    box-shadow: #FFD966
  }
`

export const DropDownItemStyled = styled(Dropdown.Item)`
  &:hover {
    background-color: #FFD966;
  }
  &:focus{
    background-color: #FFD966;
  }
`

export const AsakaRadio = styled(Form.Check)`
  input{
    &:checked{
      color: #97803a;
      background-color: #FFD966;
      border-color: #000000;
    }
  }
`
export const DarkModal = styled(Modal)`
  .modal-header{
    border-color: #FFD966;
  }
  .modal-footer{
    border-color: #FFD966;
  }
  
  div{
    div{
      background-color: #282c34
    }
  }
`

export const StyledSelect = styled(Form.Select)`
  margin-top: 10px;
  width: 140px;
  background-color: #FFD966 !important;
  box-shadow: -3px 3px orange, -2px 2px orange, -1px 1px orange;
  border: 1px solid black;
  &:hover {
    background-color: #97803a !important;
    color: #ffffff !important;
    box-shadow: -3px 3px orange, -2px 2px orange, -1px 1px orange;
    border: 1px solid black;
  }
  &:focus {
    background-color: #97803a !important;
    color: #000000 !important;
    box-shadow: -3px 3px orange, -2px 2px orange, -1px 1px orange;
    border: 1px solid black;
  }
  .gameMod{
    &:hover{
      background-color: #FFD966 !important
      color: #000000 !important;

    }
  }
`

export const Cardbtn = styled(Button)`
  color: #000000 !important;
  margin-left: 10px;
  margin-right: 10px;
  max-width: 120px;
  max-height: 120px;
  width: 8vw;
  height: 13vh;
  &:hover{
    margin-top: 10px;
    color: #ffffff !important;
  }
  position:relative
`