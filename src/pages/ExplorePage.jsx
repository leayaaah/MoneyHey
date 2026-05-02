import React from "react";
import { useNavigate } from "react-router-dom";

const ExplorePage = () => {
  const navigate = useNavigate();

  return (
    <div className="container py-5">
      {/* Header */}
      <div className="text-center mb-5">
        <h1 className="fw-bold">Khám phá Money Hey</h1>
        <p className="app-text-muted">
          Công cụ giúp bạn kiểm soát tài chính cá nhân một cách thông minh hơn.
        </p>
      </div>

      {/* Section 1 */}
      <div className="row g-4 mb-5">
        <div className="col-md-4">
          <div className="app-card h-100">
            <div className="card-body">
              <h5 className="card-title">💡 Gợi ý thông minh</h5>
              <p className="card-text app-text-muted">
                Phân tích thói quen chi tiêu và đưa ra đề xuất giúp bạn tiết kiệm hiệu quả hơn.
              </p>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="app-card h-100">
            <div className="card-body">
              <h5 className="card-title">📊 Thống kê trực quan</h5>
              <p className="card-text app-text-muted">
                Theo dõi thu chi bằng biểu đồ rõ ràng theo ngày, tháng và danh mục.
              </p>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="app-card h-100">
            <div className="card-body">
              <h5 className="card-title">🎯 Mục tiêu tài chính</h5>
              <p className="card-text app-text-muted">
                Đặt mục tiêu tiết kiệm và theo dõi tiến độ để đạt được kế hoạch của bạn.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Section 2 */}
      <div className="row g-4 mb-5">
        <div className="col-md-6">
          <div className="p-4 app-surface-muted rounded h-100">
            <h4>🔔 Nhắc nhở thông minh</h4>
            <ul className="mt-3 app-text-muted">
              <li>Nhắc thanh toán hóa đơn</li>
              <li>Cảnh báo vượt ngân sách</li>
              <li>Gợi ý điều chỉnh chi tiêu</li>
            </ul>
          </div>
        </div>

        <div className="col-md-6">
          <div className="p-4 app-surface-muted rounded h-100">
            <h4>🔍 Mẹo quản lý tài chính</h4>
            <ul className="mt-3 app-text-muted">
              <li>Quy tắc 50/30/20</li>
              <li>Ghi chép chi tiêu mỗi ngày</li>
              <li>Tránh mua sắm cảm xúc</li>
            </ul>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="text-center">
        <button className="btn-primary-emerald px-5 py-3 font-headline" onClick={() => navigate('/register')}>
          Bắt đầu ngay
        </button>
      </div>
    </div>
  );
};

export default ExplorePage;
