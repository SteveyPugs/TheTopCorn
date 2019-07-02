import React from 'react';
import Header from "../Header/Header"
import Search from "../Search/Search"
import ResultGroup from "../ResultGroup/ResultGroup"

const Main = (props) => {
    return (
        <div>
            <br />
            <Header></Header>
            <br />
            <div className="container">
                <Search
                    radius={props.radius}
                    changeDistance={props.changeDistance}
                    onChangeCity={props.onChangeCity}
                    location={props.location}
                ></Search>
                <hr />
                <ResultGroup searchResults={props.searchResults}></ResultGroup>
            </div>
        </div>
    )
}

export default Main;