import React from 'react';

import PullRequest from './PullRequest';


class PullRequests extends React.Component {
  render() {
    return (
      <div className="pull-requests">
        <h2>{this.props.repository} pull requests ({this.props.pullRequests.length})</h2>
        <ul className="pull-requests-list">
          {this.props.pullRequests.map((pr, index) => {
            return (
              <PullRequest pullRequest={pr} key={index} />
            );
          })}
        </ul>
      </div>
    );
  }
}

PullRequests.propTypes = {
  repository: React.PropTypes.string.isRequired,
  pullRequests: React.PropTypes.array.isRequired
};

export default PullRequests;
