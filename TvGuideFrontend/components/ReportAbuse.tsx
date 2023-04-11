import { Modal, Button } from "react-bootstrap";
import { useState, useRef, useEffect } from "react"
import { CommonFunctions } from "../utils/common-functions";
import AxiosHelper from "../utils/helper/axios.helper";
import { useRouter } from "next/router";
export default function ReportAbuse(props) {
    const reportAbuseRef = useRef<HTMLInputElement>(null)
    const router = useRouter();
    const [reportAbuse, setShowReportAbuse] = useState(true)
    const [showAbuseModal, setShowReportAbuseModal] = useState(false)

    const handleClose = () => {
        setShowReportAbuseModal(false)
    }

    const submitFormHandler = async (event) => {
        event.preventDefault()
        let user = CommonFunctions.GetLoggedInUser()
        if (!user) return
        let server = new AxiosHelper(`/reportAbuse?userId=${user.userId}&programId=${router.query.pid}`)
        server.post(reportAbuse).then((res: any) => {
            setShowReportAbuse(false);
        }).catch((error: any) => {
            console.log(error)
        })
    }

    return (
        <>
            {reportAbuse &&
                (<a className="text-decoration-underline" onClick={(e) => {
                    e.preventDefault();
                    setShowReportAbuseModal(true)
                }}>Report
                    abuse</a>
                )}

            <Modal className="modal fade" id="reportModal" tabindex={-1} show={showAbuseModal} onHide={handleClose}>
                <Modal.Header className="modal-header border-bottom-0" closeButton>
                </Modal.Header>
                <Modal.Body>
                    <div className="modal-content py-3">
                        <div className="modal-body text-center">
                            <h5 className="modal-title mb-3" id="reportModalLabel">Are you sure you?</h5>
                        </div>
                        <div className="modal-footer border-top-0 justify-content-center pt-0">
                            <Button type="button" className="btn btn-outline-secondary me-3 fs-sm"
                                data-bs-dismiss="modal">Cancel</Button>
                            <Button type="button" className="btn px-4 btn-primary text-white ms-3 fs-sm" onClick={(e) => {
                                submitFormHandler(e)
                            }}>Yes</Button>
                        </div>
                    </div>
                </Modal.Body>
            </Modal>

        </>
    )
}