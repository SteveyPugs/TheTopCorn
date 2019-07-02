import React from 'react'
import axios from "axios"
import { Map, GoogleApiWrapper, Marker } from 'google-maps-react';
import Header from "../Header/Header"
import Config from "../Config/Config";

class Detail extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            business: null,
            loaded: false
        };
    }
    goBackToSearchResults = () => {
        this.props.history.goBack()
    }
    componentDidMount = () => {
        let self = this;
        axios.get(Config.corsBaseUrl + "https://api.yelp.com/v3/businesses/" + this.props.match.params.id).then(function(response){
            self.setState({
                business: response.data,
                loaded: true
            })
        }).catch(function(error){
            console.log(error);
        });
    }
    render(){
        let photosSection = null        
        if(this.state.business){
            photosSection = this.state.business.photos.map(function(photo, y){
                return (
                    <div className={y === 0 ? "carousel-item active" : "carousel-item"} key={photo}>
                        <img alt="text" src={photo.replace("o.jpg", "l.jpg")} className="d-block w-100" />
                    </div>
                )
            })
        }
        var detailSection;
        if (this.state.business) {
            detailSection = (
                <div className="container">
                    <div className="row">
                        <div className="col-sm-4">
                            <div className="card">
                                <div className="card-header">Location</div>
                                <div className="card-body">
                                    <h5 className="card-title">{this.state.business.name}</h5>
                                    <p className="card-text">{this.state.business.location.display_address.join(", ")}</p>
                                </div>
                                <ul className="list-group list-group-flush">
                                    <li className="list-group-item">
                                        <b>Open Now</b> {this.state.business.is_closed ? "No" : "Yes"}
                                    </li>
                                    <li className="list-group-item">
                                        <b>Price</b> {this.state.business.price}
                                    </li>
                                    <li className="list-group-item">
                                        <b>Phone</b> {this.state.business.display_phone}
                                    </li>
                                </ul>
                            </div>
                        </div>
                        <div className="col-sm-8 col-xs-12">
                            <Map
                                google={this.props.google}
                                zoom={17}
                                style={{width: "100%", height: "100%"}}
                                initialCenter={{
                                    lat: this.state.business.coordinates.latitude,
                                    lng: this.state.business.coordinates.longitude
                                }}
                            >
                                <Marker />
                            </Map>
                        </div>
                    </div>
                    <br />
                    <div className="row">
                        <div className="col-sm">
                            <div className="card">
                                <div className="card-header">Photos</div>
                                <div className="card-body">
                                    <div id="carouselExampleIndicators" className="carousel slide" data-ride="carousel">
                                        <ol className="carousel-indicators">
                                            <li data-target="#carouselExampleIndicators" data-slide-to="0" className="active"></li>
                                            <li data-target="#carouselExampleIndicators" data-slide-to="1"></li>
                                            <li data-target="#carouselExampleIndicators" data-slide-to="2"></li>
                                        </ol>
                                        <div className="carousel-inner">{photosSection}</div>
                                        <a className="carousel-control-prev" href="#carouselExampleIndicators" role="button" data-slide="prev">
                                            <span className="carousel-control-prev-icon" aria-hidden="true"></span>
                                            <span className="sr-only">Previous</span>
                                        </a>
                                        <a className="carousel-control-next" href="#carouselExampleIndicators" role="button" data-slide="next">
                                            <span className="carousel-control-next-icon" aria-hidden="true"></span>
                                            <span className="sr-only">Next</span>
                                        </a>
                                    </div>
                                </div>
                            </div>                            
                        </div>
                    </div>
                </div>
            )
        }
        return (
            <div>
                <br />
                <Header></Header>
                <br />
                <div className="text-center">
                    <button type="button" className="btn btn-outline-secondary btn-sm" onClick={this.goBackToSearchResults}>Back to Search</button>
                </div>
                <br />
                {detailSection}
            </div>
        )
    }
}

export default GoogleApiWrapper({
    apiKey: Config.googleApiKey
})(Detail);