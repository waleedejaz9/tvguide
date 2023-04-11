import Skeleton from 'react-loading-skeleton';

export default function homePageSkeleton() {
    return (
        <div className="w-100 skeltonBodyDiv">
            <Skeleton className="skeltonBody" count={1} height={90} style={{width: "19%", display: "inline-block", float: "left", marginTop: "22px", marginBottom: "20px"}}/>
            <Skeleton className="skeltonBody" count={1}  height={90} style={{width: "80%", display: "inline-block", float: "right", marginTop: "5px", marginBottom: "20px"}} />
        </div>
    )
}