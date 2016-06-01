import React from 'react';

import Reviewer from './Reviewer';


class Reviewers extends React.Component {
  render() {
    return (
      <div className="reviewers">
        <h2>PR reviews in last 3 months</h2>
        <ul className="metric-list">
          {this.props.reviewers.map((user, index) => {
            return (
              <Reviewer user={user} key={index} />
            );
          })}
        </ul>
      </div>
    );
  }
}

Reviewers.propTypes = {
  reviewers: React.PropTypes.array.isRequired
};

export default Reviewers;
