import React from 'react';
import SearchRepository from './SearchRepository';


const Main = (props) => {
  return (
    <div className="container">
      <header>
        <SearchRepository />
      </header>
      <div className="content">
        {props.children}
      </div>
    </div>
  );
};

export default Main;
