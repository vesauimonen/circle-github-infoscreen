import React from 'react';
import { Line } from 'react-chartjs';

import { getSuccessRate, getSuccessRatesByMonth } from '../../utils/helpers';


class BuildSuccessRates extends React.Component {
  render() {
    const { builds } = this.props;
    const successRateOfLatest20 = getSuccessRate(builds.slice(0, 20));
    const successRateOfLatest100 = getSuccessRate(builds.slice(0, 100));
    const successRatesByMonth = getSuccessRatesByMonth(builds).reverse();
    const labels = successRatesByMonth.map(successRate => (successRate.month));
    const values = successRatesByMonth.map(successRate => (successRate.value));
    const chartData = {
      labels,
      datasets: [
        {
          label: 'Build success rate',
          fillColor: 'rgba(0, 0, 0, 0)',
          strokeColor: '#58acb6',
          pointColor: '#fff',
          pointStrokeColor: '#fff',
          pointHighlightFill: '#fff',
          pointHighlightStroke: '#dcdcdc',
          data: values
        }
      ]
    };
    const chartOptions = {
      responsive: true,
      maintainAspectRatio: false
    };
    return (
      <div className="build-success-rates">
        <h2>{this.props.repository} build success rate</h2>
        <div className="metrics">
          <div className="metric">
            <span className="success-rate">{successRateOfLatest100}%</span>
            <span className="postfix">latest 100 builds</span>
          </div>
          <div className="metric">
            <span className="success-rate">{successRateOfLatest20}%</span>
            <span className="postfix">latest 20 builds</span>
          </div>
        </div>
        <div className="chart">
          <Line data={chartData} options={chartOptions}></Line>
        </div>
      </div>
    );
  }
}

BuildSuccessRates.propTypes = {
  repository: React.PropTypes.string.isRequired,
  builds: React.PropTypes.array.isRequired
};

export default BuildSuccessRates;
