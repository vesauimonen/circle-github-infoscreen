import React from 'react';
import DaysAgo from './DaysAgo';


class PullRequest extends React.Component {
  render() {
    return (
      <li>
        <DaysAgo date={this.props.pullRequest.created_at} />
        <div className="pr-details">
          <h3>{this.props.pullRequest.title}</h3>
          <span className="repository">{this.props.pullRequest.head.repo.name}</span>
        </div>
        {this.props.pullRequest.assignee &&
          <img className="assignee-avatar" src={this.props.pullRequest.assignee.avatar_url} />}
        <img src={this.props.pullRequest.user.avatar_url} />
      </li>
    );
  }
}

PullRequest.propTypes = {
  pullRequest: React.PropTypes.object.isRequired
};

export default PullRequest;
