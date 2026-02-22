import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchReviewAnalytics } from '../../../store/slices/analyticsSlice'
import '../styles/ReviewAnalytics.css'

const ReviewAnalytics = () => {
  const dispatch = useDispatch()
  const { reviewAnalytics, loading } = useSelector((state) => state.analytics)

  useEffect(() => {
    dispatch(fetchReviewAnalytics())
  }, [dispatch])

  if (loading) return <div className="loading">Loading review data...</div>

  if (!reviewAnalytics) return <div className="loading">No review data available</div>

  const getRatingPercentage = (count, total) => {
    return total > 0 ? ((count / total) * 100).toFixed(1) : 0
  }

  const totalReviews = reviewAnalytics.total_reviews || 1

  return (
    <div className="review-analytics">
      <div className="review-summary">
        <div className="summary-card">
          <h3>Average Rating</h3>
          <div className="rating-display">
            <span className="rating-value">{(reviewAnalytics.avg_rating || 0).toFixed(2)}</span>
            <span className="stars">★★★★★</span>
          </div>
        </div>

        <div className="summary-card">
          <h3>Total Reviews</h3>
          <p className="count">{reviewAnalytics.total_reviews || 0}</p>
          <p className="label">from {reviewAnalytics.reviewers || 0} reviewers</p>
        </div>

        <div className="summary-card">
          <h3>Helpful Reviews</h3>
          <p className="count">{reviewAnalytics.helpful_reviews || 0}</p>
          <p className="label">Avg {(reviewAnalytics.avg_helpful_votes || 0).toFixed(1)} votes</p>
        </div>

        <div className="summary-card">
          <h3>Rated Products</h3>
          <p className="count">{reviewAnalytics.rated_products || 0}</p>
          <p className="label">products</p>
        </div>
      </div>

      <div className="rating-distribution">
        <h3>Rating Distribution</h3>
        <div className="distribution-bars">
          {[
            { rating: 5, label: '5 Stars', count: reviewAnalytics.five_star },
            { rating: 4, label: '4 Stars', count: reviewAnalytics.four_star },
            { rating: 3, label: '3 Stars', count: reviewAnalytics.three_star },
            { rating: 2, label: '2 Stars', count: reviewAnalytics.two_star },
            { rating: 1, label: '1 Star', count: reviewAnalytics.one_star },
          ].map((item, index) => {
            const percentage = getRatingPercentage(item.count, totalReviews)
            const colorMap = {
              5: '#2ECC71',
              4: '#3498DB',
              3: '#F39C12',
              2: '#E67E22',
              1: '#E74C3C',
            }

            return (
              <div key={index} className="rating-bar">
                <div className="rating-label">{item.label}</div>
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{
                      width: `${percentage}%`,
                      backgroundColor: colorMap[item.rating],
                    }}
                  >
                    {percentage > 5 && <span className="percentage">{percentage}%</span>}
                  </div>
                </div>
                <div className="rating-count">{item.count}</div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="review-insights">
        <h3>Review Insights</h3>
        <div className="insights-grid">
          <div className="insight-card positive">
            <h4>Positive Reviews</h4>
            <p className="insight-value">
              {(
                (((reviewAnalytics.five_star || 0) + (reviewAnalytics.four_star || 0)) /
                  totalReviews) *
                100
              ).toFixed(1)}
              %
            </p>
            <p className="insight-label">5-4 star ratings</p>
          </div>

          <div className="insight-card neutral">
            <h4>Neutral Reviews</h4>
            <p className="insight-value">
              {(((reviewAnalytics.three_star || 0) / totalReviews) * 100).toFixed(1)}%
            </p>
            <p className="insight-label">3 star ratings</p>
          </div>

          <div className="insight-card negative">
            <h4>Negative Reviews</h4>
            <p className="insight-value">
              {(
                (((reviewAnalytics.two_star || 0) + (reviewAnalytics.one_star || 0)) /
                  totalReviews) *
                100
              ).toFixed(1)}
              %
            </p>
            <p className="insight-label">1-2 star ratings</p>
          </div>

          <div className="insight-card engagement">
            <h4>Engagement Rate</h4>
            <p className="insight-value">
              {((reviewAnalytics.helpful_reviews / totalReviews) * 100).toFixed(1)}%
            </p>
            <p className="insight-label">helpful reviews</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ReviewAnalytics
