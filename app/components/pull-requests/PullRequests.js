import React from 'react';

import PullRequest from './PullRequest';


class PullRequests extends React.Component {
  render() {
    return (
      <div className="pull-requests">
        <h2>Pull Requests ({this.props.pullRequests.length})</h2>
        <ul className="metric-list">
          {this.props.pullRequests.map((pr, index) => (
            <PullRequest pullRequest={pr} key={index} />
          ))}
        </ul>
      </div>
    );
  }
}

PullRequests.propTypes = {
  pullRequests: React.PropTypes.array.isRequired
};

export default PullRequests;
