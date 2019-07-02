import React from 'react';
import ResultItems from "./ResultItems/ResultItems"

const ResultGroup = (props) => {
    let resultsList = null;
    if(props.searchResults){
        if(props.searchResults.length > 0){
            let searchResultsGroups = props.searchResults.map(function(e,i){
                return i % 4 === 0 ? props.searchResults.slice(i , i + 4) : null; 
            }).filter(function(e){ return e; });
            resultsList = searchResultsGroups.map(function(searchResultsGroup, index){
                return (
                    <div key={index}>
                        <div className="row">
                            <ResultItems items={searchResultsGroup}></ResultItems>
                        </div>
                        <br />
                    </div>
                )
            })
        } else {
            resultsList = <div className="alert alert-light" role="alert">No results found!</div>
        }
    } else {
        if(!props.searchResults){
            resultsList = (
                <div className="d-flex justify-content-center">
                    <div className="spinner-border" role="status">
                        <span className="sr-only">Loading...</span>
                    </div>
                </div>
            )
        }
    }
    return resultsList
}

export default ResultGroup;