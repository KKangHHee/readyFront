import React from "react";
import { Link } from "react-router-dom";
import Header from "../../components/views/Header/Header";
import "./PolicyPage.css";

function PolicyPage() {
  return (
    <div className="policy-div">
      <Header
        headerProps={{
          pageName: "약관 및 정책",
          isClose: false,
          linkTo: "/mypage",
        }}
      />
      <div className="myprofile-head">
        <Link to="/" alt="서비스 이용약관" className="terms-of-use">
          <div>서비스 이용약관</div>
        </Link>
        <Link to="/" alt="개인정보 처리 방침" className="personal-info">
          <div>개인정보 처리방침</div>
        </Link>
      </div>
    </div>
  );
}

export default PolicyPage;
