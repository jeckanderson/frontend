import axios from "axios";

const API_URL = "http://localhost:4000";

// Kumpulan function API
const ApiBackend = {
  getRevitalisasi: async () => {
    const res = await axios.get(`${API_URL}/revitalisasi`);
    return res.data.payload;
  },
  // getUsers: async () => {
  //   const res = await axios.get(`${API_URL}/users`);
  //   return res.data.payload;
  // },
  // getKabupaten: async (provinsiId) => {
  //   const res = await axios.get(`${API_URL}/kabupaten/${provinsiId}`);
  //   return res.data.payload;
  // },
  // endpoint lain sesuai kebutuhan
};

export default ApiBackend;
