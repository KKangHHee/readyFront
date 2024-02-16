import axios from "axios";
import { useState, useEffect } from "react";

const apiRoot = process.env.REACT_APP_API_ROOT;
const apiVer = "api/v1";

const useFetchStoreInfo = (storeId) => {
  const [address, setAddress] = useState(null);
  const [imgs, setImgs] = useState([]);
  const [name, setName] = useState("");
  const [openTime, setOpenTime] = useState("");
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState(false);
  const [eventMessage, setEventMessage] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `${apiRoot}/${apiVer}/store/${storeId}`
        );
        setAddress(response.data.address);
        setImgs(response.data.imgs);
        setName(response.data.name);
        setOpenTime(response.data.openTime);
        setPhone(response.data.phone);
        setStatus(response.data.status);
        setEventMessage(response.data.eventMessage);
      } catch (error) {
        console.error("Error fetching store info:", error);
      }
    };
    fetchData();
  }, [storeId]);

  return { address, imgs, name, openTime, phone, status, eventMessage };
};

export default useFetchStoreInfo;
