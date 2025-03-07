import moment from "moment/moment";
import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { IMAGES } from "../../../constants/images";
import useCancelOrder from "../../../hooks/useCancelOrder";
import useFetchCurrentOrder from "../../../hooks/useFetchCurrentOrder";
import Modal from "../../views/Modal/Modal";
import Loading from "./Loading";
import "./OrderProgress.css";

const OrderProgress = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const orderId = params.get("orderId");
  const [degree, setDegree] = useState(-1);
  const [isOpen, setIsOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const { estimatedTime, orderNum, progress, expectPoint } =
    useFetchCurrentOrder(orderId, refreshKey);
  const cancelOrder = useCancelOrder();
  const [rotate, setRotate] = useState(false); //새로고침 클릭시 회전용
  const [debounceTimeout, setDebounceTimeout] = useState(null); // 디바운싱 상태
  const progressList = useMemo(
    () => ({
      Loading: -1, //로딩
      CANCEL: 0, // 주문 취소
      ORDER: 1, // 접수 대기 중
      MAKE: 2, // 제조 중
      COMPLETE: 3, //제조 완료
    }),
    []
  );
  useEffect(() => {
    if (progress) {
      const currentProgress = progressList[progress];
      setDegree(currentProgress);
      if (degree === 0) {
        navigate(`/orderDetail?orderId=${orderId}`, { replace: true }); // 주문 취소 후 주문 내역 상세 페이지로
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [progress, progressList, degree]);

  useEffect(() => {
    const intervalId = setInterval(refreshOrderStatus, 10000); // 10초
    return () => clearInterval(intervalId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounceTimeout]);

  // 주문 상태 새로고침 함수
  const refreshOrderStatus = () => {
    // 기존에 설정된 타이머가 있다면 취소
    if (debounceTimeout) {
      clearTimeout(debounceTimeout);
    }
    // 새로운 디바운스 타이머 설정
    const timeout = setTimeout(() => {
      setRefreshKey((prevKey) => prevKey + 1);
    }, 500); // 0.5s 디바운싱 시간
    setRotate(!rotate);
    setDebounceTimeout(timeout);
  };

  const handleCancel = async () => {
    try {
      await cancelOrder(orderId); // 주문 취소 요청
      setDegree(progressList.CANCEL); // 취소 상태로 UI 업데이트
      // navigate(`/status`, { replace: true });
      // 주문 취소 후 주문 내역 페이지로 이동
    } catch (error) {
      console.error("주문 취소 중 오류 발생:", error);
      // 오류 처리 로직 (선택적)
    } finally {
      setIsOpen(false); // 성공, 실패, 예외에 관계없이 모달 닫기
    }
  };

  return (
    <>
      {degree === -1 || degree === 0 ? (
        <Loading styleBackground="linear-gradient(180deg, #fff 34.11%, #ffe2ed 100%)" />
      ) : (
        <div className="order_progress">
          <div className="order_progress__header">
            <div className="order_progress__controls">
              <img
                src={IMAGES.headerClose}
                alt="close"
                className="order_progress__close"
                onClick={() => navigate(`/status`, { replace: true })}
              />
              <img
                src={IMAGES.progressRefresh}
                alt="refresh"
                className={`order_progress__refresh ${
                  rotate ? "rotate-on-click" : ""
                }`}
                onClick={refreshOrderStatus}
              />
            </div>

            {degree === 2 && (
              <div className="order_progress__pick_up_time">
                <img src={IMAGES.progressClock} alt="clock" />
                <span>
                  {moment(estimatedTime, "HH:mm:ss.SSS").diff(
                    moment(),
                    "minutes"
                  ) <= 0 ? (
                    <span>
                      <span style={{ color: "D82356" }}>지금&nbsp;</span>수령
                      가능!
                    </span>
                  ) : (
                    <span>
                      <span style={{ color: "#D82356" }}>
                        {moment(estimatedTime, "HH:mm:ss.SSS").diff(
                          moment(),
                          "minutes"
                        )}
                        분 후&nbsp;
                      </span>
                      수령 가능!
                    </span>
                  )}
                </span>
              </div>
            )}
          </div>

          {degree === 1 ? (
            <div className="order_progress__num">결제완료</div>
          ) : (
            <div className="order_progress__num">{orderNum}번</div>
          )}

          <img
            src={
              degree === 1
                ? IMAGES.progressBar1
                : degree === 2
                ? IMAGES.progressBar2
                : degree === 3
                ? IMAGES.progressBar3
                : IMAGES.logo
            }
            alt={
              degree === 1
                ? "접수 대기 중"
                : degree === 2
                ? "제조 중"
                : degree === 3
                ? "제조 완료"
                : "진행 과정"
            }
            className="order_progress__bar"
          />

          <div className="order_progress__img animatedIcon">
            <img
              src={
                degree === 1
                  ? IMAGES.progress1
                  : degree === 2
                  ? IMAGES.progress2
                  : degree === 3
                  ? IMAGES.progress3
                  : IMAGES.berry
              }
              alt={
                degree === 1
                  ? "접수 대기 중"
                  : degree === 2
                  ? "제조 중"
                  : degree === 3
                  ? "제조 완료"
                  : "진행 과정"
              }
              className="order_progress__img"
            />
          </div>

          <div className="order_progress__status">
            {degree === 1
              ? "접수 대기 중"
              : degree === 2
              ? "제조 중"
              : degree === 3
              ? "제조 완료"
              : "진행 과정"}
          </div>

          <div className="order_progress__guide">
            {degree === 1
              ? "가게에서 주문 확인 중입니다."
              : degree === 2
              ? "주문하신 메뉴 준비 중입니다."
              : degree === 3
              ? "픽업대에서 주문하신 메뉴 수령해주세요."
              : "안내 문구"}
          </div>

          <div className="order_progress__wrapper">
            {degree === 1 ? (
              <div>
                <div
                  className="order_progress__detail"
                  onClick={() =>
                    navigate(`/orderDetail?orderId=${orderId}`, {
                      state: { returnTo: `/status?orderId=${orderId}` },
                    })
                  }
                >
                  주문상세
                </div>
                <div
                  className="order_progress__cancel"
                  onClick={() => setIsOpen((prev) => !prev)}
                >
                  주문취소
                </div>
              </div>
            ) : (
              <div
                className="order_progress__detail"
                onClick={() =>
                  navigate(`/orderDetail?orderId=${orderId}`, {
                    state: { returnTo: `/status?orderId=${orderId}` },
                  })
                }
              >
                주문상세
              </div>
            )}

            {degree === 3 ? (
              <div className="order_progress__point">
                <span className="order_progress__point_text">
                  <span>{expectPoint}</span>원 적립되었습니다
                </span>
              </div>
            ) : null}
          </div>

          {isOpen && (
            <Modal
              setIsOpen={setIsOpen}
              handleCancel={handleCancel}
              title={"주문을 취소하시겠습니까?"}
              subtitle={"확인 버튼을 누르시면, 주문이 취소됩니다."}
            />
          )}
        </div>
      )}
    </>
  );
};

export default OrderProgress;
