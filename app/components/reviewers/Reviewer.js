import React from 'react';


class Reviewer extends React.Component {
  render() {
    return (
      <li>
        <span className="metric-stamp">
          <span className="value">{this.props.user.count}</span>
          <span className="label">
            {this.props.user.count === 1 ?
              'review' :
              'reviews'
            }
          </span>
        </span>
        <div className="metric-details">
          <h3>{this.props.user.login}</h3>
        </div>
        <img src={this.props.user.avatar_url} />
      </li>
    );
  }
}

Reviewer.propTypes = {
  user: React.PropTypes.object.isRequired
};

export default Reviewer;
