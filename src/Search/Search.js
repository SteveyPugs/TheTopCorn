import React from 'react';
import Geosuggest from 'react-geosuggest';
import { GoogleApiWrapper } from 'google-maps-react';
import Config from "../Config/Config";

const Search = (props) => {
    return (
        <div>
            <div className="row">
                <div className="col-sm">
                    <label>Where</label>
                    <Geosuggest
                        inputClassName="form-control form-control-sm"
                        initialValue={props.location}
                        onSuggestSelect={props.onChangeCity}
                    />
                </div>
                <div className="col-sm">
                    <label>Distance (mi)</label>
                    <select className="form-control form-control-sm" value={props.radius} onChange={props.changeDistance}>
                        <option value="1610">1</option>
                        <option value="3219">2</option>
                        <option value="8047">5</option>
                        <option value="16093">10</option>
                        <option value="40000">25</option>
                    </select>
                </div>
            </div>
        </div>
    )
}

export default GoogleApiWrapper({
    apiKey: Config.googleApiKey
})(Search);