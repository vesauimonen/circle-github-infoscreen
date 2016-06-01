import React from 'react';


class DaysAgo extends React.Component {
  render() {
    const now = new Date();
    const dateObj = new Date(this.props.date);
    const timeDiff = Math.abs(dateObj.getTime() - now.getTime());
    const diffInDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
    return (
      <span className="metric-stamp">
        <span className="value">{diffInDays}</span>
          {diffInDays === 1 ?
            <span className="label">day open</span> :
            <span className="label">days open</span>
          }
      </span>
    );
  }
}

DaysAgo.propTypes = {
  date: React.PropTypes.string.isRequired
};

export default DaysAgo;
