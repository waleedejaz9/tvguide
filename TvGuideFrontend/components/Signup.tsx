import { useEffect, useRef, useState } from "react";
import { Button, Modal } from "react-bootstrap";
import { CommonFunctions } from "../utils/common-functions";
import AxiosHelper from "../utils/helper/axios.helper";

export default function Signup(props) {
    const emailInputRef = useRef<HTMLInputElement>(null)
    const regionInputRef = useRef<HTMLSelectElement>(null)
    const [region, setRegions] = useState([])
    const submitFormHandler = async (event) => {
        event.preventDefault()
        // TODO: Ahmed - Need to fix these issues..
        const obj: { email, region } = { email: '', region: '' }
        if (emailInputRef && emailInputRef.current.value) {
            obj.email = emailInputRef.current.value
        }
        if (regionInputRef && regionInputRef.current.value) {
            obj.region = regionInputRef.current.value
        }
        try {
            let request = new AxiosHelper('/user/register')
            let result = (await request.post(obj)) as any
            if (result.success) {
                CommonFunctions.SetUser(result.data);
                location.reload()
            }
        } catch (e) {
            console.error(e)
            //TODO: Need to add toaster/any information message...
        }
    }
    const fetchRegions = () => {
        let server = new AxiosHelper(`/region/getAll`)
        server.get().then((res: any) => {
            const regions = res.data
            setRegions(regions)
        }).catch((error: any) => {
            console.log(error)
        })
    }
    useEffect(() => {
        fetchRegions()
    }, [])

    return (
        <>
            <Modal className="modal fade" id="SignUpModel" show={props.show} onHide={props.onClose}>
                <Modal.Header className="modal-header border-bottom-0" closeButton>
                </Modal.Header>
                <Modal.Body>
                    <>
                        <form onSubmit={submitFormHandler}>
                            <h1 className="text-center ModalLoginHeading">Sign up</h1>
                            <p className="text-center ModalLoginText">
                                Please enter your email address to get started
                            </p>
                            <div className="form-group mb-3">
                                <label className="mb-1 ms-2 ModelLodingEmail" htmlFor="email">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    className="form-control py-2 emailTextArea"
                                    placeholder="Enter your Email"
                                    ref={emailInputRef}
                                    id="signup-email"
                                />
                            </div>
                            <div className="form-group mb-5 mt-5">
                                <label className="mb-1 ms-2 ModelLodingEmail">Your Region</label>
                                <select
                                    className="form-select py-3 emailTextArea mt-3"
                                    aria-label="Default select example"
                                    placeholder="Select your Region"
                                    id="signup-region"
                                    ref={regionInputRef}
                                >
                                    {region.map((option, i) => (
                                        <option key={i} value={option.regionId}>{option.regionName}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="modal-footer mb-4 border-top-0 d-block text-end">
                                <Button type="submit" className="btn btn-primary text-white Login-Btn" id="signup-btn">Sign Up</Button>
                            </div>
                        </form>
                    </>
                </Modal.Body>
            </Modal>
        </>
    );
}