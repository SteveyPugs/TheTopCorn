import React, { Component } from 'react'
import { BrowserRouter as Router, Route } from 'react-router-dom'
import Main from "./Main/Main"
import Detail from "./Detail/Detail"
import './App.css';
import axios from "axios"
import Geocode from "react-geocode";
import Config from "./Config/Config";
import { GoogleApiWrapper } from 'google-maps-react';
axios.defaults.headers.common['Authorization'] = Config.yelpApiKey;

class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            searchResults: null,
            radius: 40000,
            offset: 0, 
            limit: 12,
            loaded: false
        };
    }

    onDistanceChange = (event) => {
        this.setState({
            radius: event.target.value
        });
    }

    componentDidUpdate = (prevProps, prevState) => {
        if(prevState.loaded === this.state.loaded){
            if(prevState.radius !== this.state.radius){
                this.loadData()
            }
        }
    }

    loadData = (location) => {
        var self = this;
        if(location){
            axios.get(Config.corsBaseUrl + "https://api.yelp.com/v3/businesses/search?location=" + location + "&categories=popcorn&limit=" + this.state.limit + "&offset=" + this.state.offset + "&radius=" + this.state.radius).then(function(response){
                let data = response.data.businesses;
                self.setState({
                    searchResults: data,
                    loaded: true,
                    location: location
                })
            }).catch(function(error){
                console.error(error);
            });
        } else {
            const locationAPI = (window.navigator && window.navigator.geolocation)
            locationAPI.getCurrentPosition((position) => {
                Geocode.fromLatLng(position.coords.latitude, position.coords.longitude).then(response => {
                    const address = response.results[0].formatted_address;
                    axios.get(Config.corsBaseUrl + "https://api.yelp.com/v3/businesses/search?location=" + address + "&categories=popcorn&limit=" + this.state.limit + "&offset=" + this.state.offset + "&radius=" + this.state.radius).then(function(response){
                        let data = response.data.businesses;
                        self.setState({
                            searchResults: data,
                            loaded: true,
                            location: address
                        })
                    }).catch(function(error){
                        console.error(error);
                    });
                }, error => {
                    console.error(error);
                });
            }, error => {
                console.error(error);
            });
        }
    }
    componentDidMount = () => {
        this.loadData()
    }
    onChangeCity = (location) => {
        this.loadData(location.label)
    }
    render(){
        return (
            <Router>
                <Route exact path="/" component={() => <Main
                    radius={this.state.radius}
                    changeDistance={this.onDistanceChange}
                    searchResults={this.state.searchResults}
                    onChangeCity={this.onChangeCity}
                    location={this.state.location}
                ></Main>}/>
                <Route exact path="/:id" component={Detail}/>
            </Router>
        )
    }
}

export default GoogleApiWrapper({
    apiKey: Config.googleApiKey
})(App);