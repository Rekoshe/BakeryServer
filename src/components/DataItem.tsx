import React from "react";
import './../App.css';

export default function DataItem(props: { name: string, onClickDelete: React.MouseEventHandler<HTMLButtonElement> | undefined }){



    return (
    <div className="dataItemContainer">
        <div>
            {props.name}
        </div>
        <button className="dataItemDeleteButton" onClick={props.onClickDelete}>
            X
        </button>
    </div>
    )
}