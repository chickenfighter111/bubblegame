import {StyledModal, AsakaBtn} from './styles'
import {Modal, Container} from 'react-bootstrap'
import nofund from './media/r3.png'

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