import { Modal, Button, Form } from "react-bootstrap";
export default function Login(props) {
    return (
        <>
            <Modal className="modal fade" show={props.show} onHide={props.onClose} id="sign-in-modal">
                <Modal.Header className="modal-header border-bottom-0" closeButton>
                </Modal.Header>
                <Modal.Body>
                    <>
                        <Form className="mt-3" onSubmit={props.onSubmit}>
                            <h1 className="text-center ModalLoginHeading">Login</h1>
                            <p className="text-center ModalLoginText">Please enter your email address to retrieve your saved profile</p>
                            <Form.Group className="form-group mb-3 mt-3">
                                <Form.Label className="mb-1 ms-2 ModelLodingEmail" htmlFor="email">Email</Form.Label>
                                <Form.Control type="email" id="email"
                                    className="form-control py-2 emailTextArea" placeholder="Enter your email" />
                            </Form.Group>
                            <div className="modal-footer mb-4 border-top-0 d-block">
                                <div className="d-flex justify-content-between align-items-center">
                                    <span className="cursor-pointer"><p className="small mb-0 createProfileText" onClick={props.onSignupFormOpen} id="create-profile">Create profile</p></span>
                                    <Button type="submit" className="btn btn-primary text-white Login-Btn" id="login-btn">Login</Button>
                                </div>
                            </div>
                        </Form>
                    </>
                </Modal.Body>
            </Modal>
        </>
    );
}