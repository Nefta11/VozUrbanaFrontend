import './SkeletonReportList.css'

const SkeletonReportList = () => {
    return (
        <div className="skeleton-reports-grid">
            {[...Array(6)].map((_, i) => (
                <div className="skeleton-report-card" key={i}>
                    <div className="skeleton-header"></div>
                    <div className="skeleton-content"></div>
                    <div className="skeleton-footer"></div>
                </div>
            ))}
        </div>
    )
}

export default SkeletonReportList
