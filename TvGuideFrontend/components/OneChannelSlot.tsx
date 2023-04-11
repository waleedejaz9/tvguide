import { FC } from 'react';

interface OneChannelSlotProps {
    slots: Array<{
        ID: number, 
        showName: string,
        width: string,
        translateX: string,
        showTime: string   
    }>
}


const OneChannelSlot:FC<OneChannelSlotProps> = ({ slots }) => {
    return (
        <div className="channel-row position-relative w-100">
            {slots.map((slot, i) =>{
                return <>
                    <div className="position-absolute top-0 text-truncate cell program" aria-expanded="false"
                        style={{
                            transform: `translateX(${slot.translateX})`,
                            width: `${slot.width}`,
                        }}
                        // aria-controls={`${asset.toggleId}`}
                        data-bs-toggle="collapse"
                        // data-bs-target={`#${asset.toggleId}`}
                        // onClick={() => showCurrentToggledItem(asset, index)}
                    >
            
                        <a className="pb-md-1 pb-0">
                            <div className="show-details">
                                <h3 className="show-name">{slot.showName}</h3>
                                <p className="show-time">{slot.showTime}</p>
                            </div>
                        </a>
                    </div>
                </>
            })}
        </div>
    )
}

export default OneChannelSlot;