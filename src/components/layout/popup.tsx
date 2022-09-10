import {StyledModal, AsakaBtn} from './styles'
import {Modal, Container} from 'react-bootstrap'
import nofund from './media/r3.png'
import lose from './media/r4.jpg'
import win from './media/r2.png'

export const NoFundsPopper = (props) =>{

    return (
      <StyledModal
        size="sm"
        show={props.noFunds}
        onHide={props.close}
        aria-labelledby="contained-modal-title-vcenter"
        centered
      >
        <Modal.Header         style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}>
          <Modal.Title>
            <h2>No funds !</h2>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="modalBody">
          <Container>
            <img
              width={100}
              height={100}
              src={nofund}
              alt=""
            />
            <AsakaBtn onClick={props.close} className="popupBtn">
                Close
            </AsakaBtn>
          </Container>
        </Modal.Body>
      </StyledModal>
    );
  }

  export const WinPopper = (props) =>{
    return (
      <StyledModal
        size="sm"
        show={props.noFunds}
        onHide={props.close}
        aria-labelledby="contained-modal-title-vcenter"
        centered
        backdrop="static"
      >
        <Modal.Header         style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}>
          <Modal.Title>
            <h2>You win !</h2>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="modalBody">
          <Container>
            <img
              width={100}
              height={100}
              src={win}
              alt=""
            />
            <AsakaBtn onClick={props.close} className="popupBtn">
                Close
            </AsakaBtn>
          </Container>
        </Modal.Body>
      </StyledModal>
    );
  }


  export const LosePopper = (props) =>{
    
    return (
      <StyledModal
        size="sm"
        show={props.noFunds}
        onHide={props.close}
        aria-labelledby="contained-modal-title-vcenter"
        centered
        backdrop="static"
      >
        <Modal.Header         style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}>
          <Modal.Title>
            <h2>You lost...</h2>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="modalBody">
          <Container>
            <img
              width={100}
              height={100}
              src={lose}
              alt=""
            />
            <AsakaBtn onClick={props.close} className="popupBtn">
                Close
            </AsakaBtn>
          </Container>
        </Modal.Body>
      </StyledModal>
    );
  }