import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, GeoJSON, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./Map.css";
import Chart from "./Chart";
import { Card, Row, Col, ListGroup, Container, Table } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import getApiBackend from "../../api/ApiBackend";
import { cleanNumber } from "../../utils/cleanNumber";
import { formatRupiah } from "../../utils/formatRupiah";
import { sumByField } from "../../utils/sumByField";
import { ComboChart } from "../../utils/ComboCharts";

function FitBoundsOnData({ geoData }) {
  const map = useMap();

  useEffect(() => {
    if (geoData) {
      const geojsonLayer = L.geoJSON(geoData);
      const bounds = geojsonLayer.getBounds();

      map.fitBounds(bounds); // zoom otomatis pas ke peta Indonesia
      map.setMaxBounds(bounds); // batasi agar peta tidak bisa keluar Indonesia
    }
  }, [geoData, map]);

  return null;
}

function Map() {
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getApiBackend.getRevitalisasi();
        console.log("cek api:", data);
      } catch (err) {
        console.error("Gagal ambil data API:", err);
      }
    };

    fetchData();
  }, []);
  // Fungsi helper untuk format angka
  const formatNumber = (num) => num.toLocaleString("id-ID");
  const [geoData, setGeoData] = useState(null);
  const [provinsi, setProvinsi] = useState([]);
  const [provinsiData, setProvinsiData] = useState([]);
  const [kabupaten, setKabupaten] = useState(0);
  const [totalSekolah, setTotalSemua] = useState(0);
  const [totalPaud, setTotalPaud] = useState(0);
  const [totalSd, setTotalSd] = useState(0);
  const [totalSmp, setTotalSmp] = useState(0);
  const [totalSma, setTotalSma] = useState(0);
  const [totalAnggaranRef, setTotaAnggaranRef] = useState(0);
  const [anggaranPaud, setAnggaranPaud] = useState(0);
  const [anggaranSD, setAnggaranSD] = useState(0);
  const [anggaranSMP, setAnggaranSMP] = useState(0);
  const [anggaranSMA, setAnggaranSMA] = useState(0);

  // Ambil GeoJSON
  useEffect(() => {
    fetch("/indonesia.geojson")
      .then((res) => res.json())
      .then((data) => setGeoData(data))
      .catch((err) => console.error("Gagal fetch GeoJSON:", err));
  }, []);

  // Ambil data backend
  useEffect(() => {
    fetch("http://localhost:4000/revitalisasi")
      .then((res) => res.json())
      .then((data) => {
        // console.log("Data Total Revitalisasi Sekolah:", data);
        // hitung total semua sekolah
        const provinsi = data.payload.filter(
          (item) => item.tingkat_label === "provinsi"
        );
        console.log("total berdasarkan provinsi", provinsi);
        setProvinsi(provinsi);

        // =========================================
        const provinsiData = data.payload.filter(
          (item) => item.tingkat_label === "provinsi"
        );

        // setProvinsiData(provinsi);
        // console.log("Data provinsi dari backend:", provinsi);
        // hitung total semua sekolah
        // const totalSekolah = provinsi.reduce(
        //   (sum, item) => sum + (item.total_jml_rev_sekolah || 0),
        //   0
        // );
        // setTotalSemua(totalSekolah);
        // Hitung total Jml_rev_paud per provinsi
        const provinsiWithTotals = provinsiData.map((prov) => {
          const kabupatenData = data.payload.filter(
            (item) =>
              item.tingkat_label === "kabupaten" &&
              item.kode_pro === prov.kode_pro
          );

          // const totalRefPaud = kabupatenData.reduce(
          //   (sum, kab) => sum + (Number(kab.Jml_rev_paud) || 0),
          //   0
          // );
          // console.log("cek data", totalRefPaud);
          // const totalRefSd = kabupatenData.reduce(
          //   (sum, kab) => sum + (Number(kab.Jml_revi_sd) || 0),
          //   0
          // );

          return {
            ...prov,
            // totalPaud, // tambahan field hasil jumlah
            totalRefPaud: sumByField(kabupatenData, "Jml_rev_paud"),
            totalRefSd: sumByField(kabupatenData, "Jml_revi_sd"),
            totalRefSmp: sumByField(kabupatenData, "Jml_rev_smp"),
            totalRefSma: sumByField(kabupatenData, "Jml_rev_sma"),
            totalAnggaranPaud: sumByField(kabupatenData, "anggaran_rev_paud"),
            totalAnggaranSd: sumByField(kabupatenData, "anggaran_rev_sd"),
            totalAnggaranSmp: sumByField(kabupatenData, "anggaran_rev_smp"),
            totalAnggaranSma: sumByField(kabupatenData, "anggaran_rev_sma"),
          };
        });
        setProvinsiData(provinsiWithTotals);
        // console.log("Provinsi + total PAUD:", provinsiWithTotals);
        // ==================================================

        const kabupaten = data.payload.filter(
          (item) => item.tingkat_label === "kabupaten"
        );
        console.log("berdasarkan kabupaten", kabupaten);
        setKabupaten(kabupaten);

        const totalSekolah = kabupaten.reduce(
          (sum, item) => sum + (item.total_jml_rev_sekolah || 0),
          0
        );
        console.log(totalSekolah);
        setTotalSemua(totalSekolah);

        const totalPaud = kabupaten.reduce(
          (sum, item) => sum + item.Jml_rev_paud || 0,
          0
        );
        setTotalPaud(totalPaud);

        const totalSd = kabupaten.reduce(
          (sum, item) => sum + item.Jml_revi_sd || 0,
          0
        );
        setTotalSd(totalSd);

        const totalSmp = kabupaten.reduce(
          (sum, item) => sum + item.Jml_rev_smp || 0,
          0
        );
        setTotalSmp(totalSmp);

        const totalSma = kabupaten.reduce(
          (sum, item) => sum + item.Jml_rev_sma || 0,
          0
        );
        setTotalSma(totalSma);

        // TOTAL ANGGARAN PER JENJANG
        const totalAnggaranRef = kabupaten.reduce(
          (sum, item) => sum + cleanNumber(item.total_anggaran_rev),
          0
        );
        setTotaAnggaranRef(totalAnggaranRef);

        const anggaranPaud = kabupaten.reduce(
          (sum, item) => sum + cleanNumber(item.anggaran_rev_paud),
          0
        );
        setAnggaranPaud(anggaranPaud);

        const anggaranSD = kabupaten.reduce(
          (sum, item) => sum + cleanNumber(item.anggaran_rev_sd),
          0
        );
        // console.log("anggaran sekolah PAUD", anggaranPaud);
        setAnggaranSD(anggaranSD);

        const anggaranSMP = kabupaten.reduce(
          (sum, item) => sum + cleanNumber(item.anggaran_rev_smp),
          0
        );
        // console.log("anggaran sekolah PAUD", anggaranPaud);
        setAnggaranSMP(anggaranSMP);

        const anggaranSMA = kabupaten.reduce(
          (sum, item) => sum + cleanNumber(item.anggaran_rev_sma),
          0
        );
        // console.log("anggaran sekolah PAUD", anggaranPaud);
        setAnggaranSMA(anggaranSMA);
      })

      .catch((err) => console.error("Gagal fetch data provinsi:", err));
  }, []);

  // Style provinsi
  const geoStyle = {
    color: "#2543b1ff",
    weight: 1,
    fillColor: "#ccccccff",
    fillOpacity: 0.3,
  };

  // Hubungkan GeoJSON dengan API backend
  const onEachProvince = (feature, layer) => {
    const namaGeo = feature.properties.state.toUpperCase(); // dari GeoJSON
    const prov = provinsi.find((p) => p.nama_wilayah.toUpperCase() === namaGeo);

    if (prov) {
      // Popup (klik)
      layer.bindPopup(`
      <div class="popup-provinsi">
        <b>${prov.nama_wilayah}</b><br/>
        Total Sekolah: ${prov.total_jml_rev_sekolah || 0}<br/>
        Anggaran: ${prov.total_anggaran_rev || 0}
      </div>
      <div>
        <a href="#" onclick="window.showProvinsi('${
          prov.kode_pro
        }')">Lihat detail</a>
      </div>
    `);

      // Tooltip (label selalu tampil)
      layer.bindTooltip(`Prov. ${prov.nama_wilayah}`, {
        permanent: true,
        direction: "center",
        className: "map-label",
      });
    } else {
      console.warn(`Provinsi ${namaGeo} tidak ditemukan di backend`);
    }
  };

  return (
    <>
      <div className="mt-4">
        <Row>
          <Col md={7}>
            <Card>
              <Card.Header className="text-center">
                <h5>Persebaran Program Revitalisasi Sekolah Nasional</h5>
              </Card.Header>
              <Card.Body className="p-0">
                <MapContainer
                  center={[-2.5, 118]}
                  zoom={12}
                  minZoom={4}
                  maxZoom={10}
                  style={{ height: "350px", width: "100%" }}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution="&copy; OpenStreetMap contributors"
                  />
                  {geoData && (
                    <>
                      <GeoJSON
                        data={geoData}
                        style={geoStyle}
                        onEachFeature={onEachProvince}
                      />
                      <FitBoundsOnData geoData={geoData} />
                    </>
                  )}
                </MapContainer>
              </Card.Body>
            </Card>
          </Col>

          <Col md={5}>
            <Card>
              <Card.Header className="text-center">
                <h5>Nasional</h5>
              </Card.Header>
              <Card.Body className="p-3">
                <Row>
                  <Col md={6}>
                    <div className="head-nasional">
                      <p className="m-0 p-0 text-muted">
                        Total Revitalisasi Sekolah
                      </p>
                      <p className="isi">{formatNumber(totalSekolah)}</p>
                    </div>
                    <div className="head-nasional">
                      <p className="m-0 p-0 text-muted">
                        Revitalisasi Sekolah PAUD
                      </p>
                      <p className="isi">{formatNumber(totalPaud)}</p>
                    </div>
                    <div className="head-nasional">
                      <p className="m-0 p-0 text-muted">
                        Revitalisasi Sekolah SD
                      </p>
                      <p className="isi">{formatNumber(totalSd)}</p>
                    </div>
                    <div className="head-nasional">
                      <p className="m-0 p-0 text-muted">
                        Revitalisasi Sekolah SMP
                      </p>
                      <p className="isi">{formatNumber(totalSmp)}</p>
                    </div>
                    <div className="head-nasional">
                      <p className="m-0 p-0 text-muted">
                        Revitalisasi Sekolah SMA
                      </p>
                      <p className="isi">{formatNumber(totalSma)}</p>
                    </div>
                  </Col>

                  <Col md={6}>
                    <div className="head-nasional">
                      <p className="m-0 p-0 text-muted">
                        Total Anggaran Revitalisasi
                      </p>
                      <p className="isi">{formatRupiah(totalAnggaranRef)}</p>
                    </div>
                    <div className="head-nasional">
                      <p className="m-0 p-0 text-muted">
                        Anggaran Revitalisasi Sekolah PAUD
                      </p>
                      <p className="isi">{formatRupiah(anggaranPaud)}</p>
                    </div>
                    <div className="head-nasional">
                      <p className="m-0 p-0 text-muted">
                        Anggaran Revitalisasi Sekolah SD
                      </p>
                      <p className="isi">{formatRupiah(anggaranSD)}</p>
                    </div>
                    <div className="head-nasional">
                      <p className="m-0 p-0 text-muted">
                        Anggaran Revitalisasi Sekolah SMP
                      </p>
                      <p className="isi">{formatRupiah(anggaranSMP)}</p>
                    </div>
                    <div className="head-nasional">
                      <p className="m-0 p-0 text-muted">
                        Anggaran Revitalisasi Sekolah SMA
                      </p>
                      <p className="isi">{formatRupiah(anggaranSMA)}</p>
                    </div>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </div>

      <div className="mt-2">
        <Row>
          <Col md={7}>
            <Card>
              <Card.Header className="text-center">
                <h5>Tabel Revitalisasi Sekolah Berdasarkan Provinsi</h5>
              </Card.Header>
              <Card.Body className="p-0">
                {/* <div style={{ overflowX: "auto" }}> */}
                <div style={{ maxHeight: "457px", overflowY: "auto" }}>
                  <Table bordered hover responsive className="table-prov">
                    <thead>
                      <tr>
                        <th className="text-muted">Provinsi</th>
                        <th className="text-muted">Bentuk Pendidikan</th>
                        <th className="text-muted">
                          Banyak Sekolah
                          <br /> Akan di Revitalisasi
                        </th>
                        <th className="text-muted">Anggaran</th>
                      </tr>
                    </thead>
                    <tbody>
                      {provinsiData.map((item, i) => (
                        <tr key={i}>
                          <td>{item.nama_wilayah}</td>
                          <td>
                            PAUD <br />
                            SD <br />
                            SMP <br />
                            SMA
                          </td>
                          <td style={{ textAlign: "right" }}>
                            {item.totalRefPaud}
                            <br />
                            {item.totalRefSd}
                            <br />
                            {item.totalRefSmp}
                            <br />
                            {item.totalRefSma}
                            <br />
                          </td>
                          <td>
                            {formatRupiah(item.totalAnggaranPaud)}
                            <br />
                            {formatRupiah(item.totalAnggaranSd)}
                            <br />
                            {formatRupiah(item.totalAnggaranSmp)}
                            <br />
                            {formatRupiah(item.totalAnggaranSma)}
                            <br />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col md={5}>
            <Card>
              <Card.Header className="text-center">
                <h5>
                  Anggaran Revitalisasi Sekolah Berdasarkan Bentuk Pendidikan
                </h5>
              </Card.Header>
              <Card.Body className="d-flex justify-content-center align-items-center">
                <Row>
                  <Col md={6}>
                    <>
                      <Chart />
                    </>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </div>

      <div className="combo_chart mt-3 mb-5">
        <Card>
          <Card.Header className="text-center">
            <h5>
              Banyak Revitalisasi Sekolah Berdasarkan Anggaran Revitalisasi
              Berdasarkan Provinsi
            </h5>
          </Card.Header>
          <Card.Body>
            <ComboChart />
          </Card.Body>
        </Card>
      </div>
    </>
  );
}

export default Map;
