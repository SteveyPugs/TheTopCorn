import React from 'react';
import { Link } from 'react-router-dom'


const ResultItems = (props) => {
    let row = null
    row = props.items.map(function(item, index){        
        return (
            <div className="col-sm-3" key={'item' + item.id}>   
                <div className="card">
                    <div className="card-body">
                        <h6 className="card-title">{item.name}</h6>
                        <small>
                            <p>Stars: {item.rating}</p>
                            <Link to={item.id}>See More</Link>
                        </small>
                    </div>
                </div>
            </div>
        )
    })
    return row
}

export default ResultItems;