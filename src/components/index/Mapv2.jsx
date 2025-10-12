import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, GeoJSON, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./Map.css";
import ChartDonut from "../charts/ChartDonut";
import { Card, Row, Col, ListGroup, Container, Table } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import getApiBackend from "../../services/ApiBackend";
import { cleanNumber } from "../../helper/cleanNumber";
import { formatRupiah } from "../../helper/formatRupiah";
import { sumByField } from "../../helper/sumByField";
import { ComboChart } from "../charts/ComboCharts";
import { hitungSummary } from "../../helper/hitungSummary";
import { getChartData } from "../charts/getChartData";
import { totalAnggaranPerJenjang } from "../../utils/totalAnggaranPerJenjang";
import { jmlRefPerJenjang } from "../../utils/jmlRefPerJenjang";
import { ProgresBar } from "../../utils/ProgresBar";
import { getColor } from "../../utils/getColor";
import { SimpleMap } from "../../utils/SimpleMap";
import { Chart } from "react-chartjs-2";
// import { scaleLinear } from "d3-scale";

import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
  ZoomableGroup,
} from "react-simple-maps";
import { geoCentroid } from "d3-geo";

function Map() {
  const formatNumber = (num) => num.toLocaleString("id-ID");
  const [withTotalProvinsi, setWithTotalProvinsi] = useState([]);
  const [withTotalKabupaten, setWithTotalKabupaten] = useState([]);

  // const [provinsiData, setWithTotal] = useState([]);

  const [geoData, setGeoData] = useState(null);
  const [provinsi, setProvinsi] = useState([]);

  const [selectedProvinsi, setSelectedProvinsi] = useState(null);
  const [kabupatenData, setKabupatenData] = useState([]);
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
  const [summary, setSummary] = useState(null);
  const [dataJenjang, setJenjang] = useState(null);
  const [selectedKabupaten, setSelectedKabupaten] = useState(null);
  const [rangeValue, setRangeValue] = useState({ min: 0, max: 0 });

  const {
    data: jmlRefSekolahPerJenjang,
    options: optionsJmlRefSekolahPerJenjang,
  } = jmlRefPerJenjang(selectedKabupaten);
  const {
    data: totalAnggaranPerjenjang,
    options: optionsTotalAnggaranPerjenjang,
  } = totalAnggaranPerJenjang(selectedKabupaten);
  const { data: refSekolahAnggaran, options: optionsRefSekolahAnggaran } =
    getChartData(selectedKabupaten);

  // Ambil GeoJSON
  useEffect(() => {
    fetch("/indonesia_province_simple.geojson")
      .then((res) => res.json())
      .then((data) => setGeoData(data))
      .catch((err) => console.error("Gagal fetch GeoJSON:", err));
  }, []);
  console.log("cek geo", geoData);

  // Ambil data backend
  useEffect(() => {
    const fetchDataApi = async () => {
      try {
        const getDataRevitalisasi = await getApiBackend.getRevitalisasi();

        const getProvinsi = getDataRevitalisasi.filter(
          (item) => item.tingkat_label === "provinsi"
        );
        const getKabupaten = getDataRevitalisasi.filter(
          (item) => item.tingkat_label === "kabupaten"
        );
        setProvinsi(getProvinsi);
        setKabupaten(getKabupaten);

        const provinsiWithTotals = getProvinsi.map((prov) => {
          const filterData = getDataRevitalisasi.filter(
            (item) =>
              item.tingkat_label === "kabupaten" &&
              item.kode_pro === prov.kode_pro
          );
          return {
            ...prov,
            // totalPaud, // tambahan field hasil jumlah
            totalRefPaud: sumByField(filterData, "Jml_rev_paud"),
            totalRefSd: sumByField(filterData, "Jml_revi_sd"),
            totalRefSmp: sumByField(filterData, "Jml_rev_smp"),
            totalRefSma: sumByField(filterData, "Jml_rev_sma"),
            totalAnggaranPaud: sumByField(filterData, "anggaran_rev_paud"),
            totalAnggaranSd: sumByField(filterData, "anggaran_rev_sd"),
            totalAnggaranSmp: sumByField(filterData, "anggaran_rev_smp"),
            totalAnggaranSma: sumByField(filterData, "anggaran_rev_sma"),
          };
        });
        // setWithTotal(provinsiWithTotals);
        setWithTotalProvinsi(provinsiWithTotals);

        const totalsRage = provinsiWithTotals.map(
          (p) => p.totalRefPaud + p.totalRefSd + p.totalRefSmp + p.totalRefSma
        );
        setRangeValue({
          min: Math.min(...totalsRage),
          max: Math.max(...totalsRage),
        });

        const totalSekolah = kabupaten.reduce(
          (sum, item) => sum + (item.total_jml_rev_sekolah || 0),
          0
        );

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

        setAnggaranSD(anggaranSD);

        const anggaranSMP = kabupaten.reduce(
          (sum, item) => sum + cleanNumber(item.anggaran_rev_smp),
          0
        );

        setAnggaranSMP(anggaranSMP);

        const anggaranSMA = kabupaten.reduce(
          (sum, item) => sum + cleanNumber(item.anggaran_rev_sma),
          0
        );

        setAnggaranSMA(anggaranSMA);
      } catch (err) {
        console.error("Maps => Gagal ambil data API:", err);
      }
    };

    fetchDataApi();
  }, []);

  const normalisasiNama = (name) =>
    name
      .toLowerCase()
      .replace(/provinsi|daerah istimewa/gi, "")
      .replace(/[^a-z\s]/gi, "")
      .replace(/\s+/g, " ")
      .trim();

  // Pasang summary nasional saat data kabupaten sudah ada
  useEffect(() => {
    if (kabupaten.length > 0) {
      setSummary(hitungSummary(kabupaten)); // summary nasional
    }
  }, [kabupaten]);

  const handleProvinceClick = (geo) => {
    const namaGeo = geo.properties.Propinsi;
    // const mappedName = getMappedProvinceName(namaGeo);
    const prov = provinsi.find(
      (p) => normalisasiNama(p.nama_wilayah) === normalisasiNama(namaGeo)
    );

    if (prov) {
      setSelectedProvinsi(prov);

      const filterDataKab = kabupaten.filter(
        (k) => k.kode_pro === prov.kode_pro
      );

      setKabupatenData(filterDataKab);

      const nasional = filterDataKab.map((k) => ({
        nama_wilayah: k.nama_wilayah,
        totalRefPaud: k.Jml_rev_paud || 0,
        totalRefSd: k.Jml_revi_sd || 0,
        totalRefSmp: k.Jml_rev_smp || 0,
        totalRefSma: k.Jml_rev_sma || 0,
        totalAnggaranPaud:
          parseInt(k.anggaran_rev_paud?.replace(/[^0-9]/g, "")) || 0,
        totalAnggaranSd:
          parseInt(k.anggaran_rev_sd?.replace(/[^0-9]/g, "")) || 0,
        totalAnggaranSmp:
          parseInt(k.anggaran_rev_smp?.replace(/[^0-9]/g, "")) || 0,
        totalAnggaranSma:
          parseInt(k.anggaran_rev_sma?.replace(/[^0-9]/g, "")) || 0,
      }));

      // setWithTotal(nasional);
      setWithTotalKabupaten(nasional);
      // summary provinsi
      setSummary(hitungSummary(filterDataKab));

      // donutchart perjenjang
      const summary = hitungSummary(filterDataKab);
      setSummary(summary);
      // mapping ke ChartDonut
      setJenjang({
        anggaran_rev_paud: summary.paud.anggaran,
        anggaran_rev_sd: summary.sd.anggaran,
        anggaran_rev_smp: summary.smp.anggaran,
        anggaran_rev_sma: summary.sma.anggaran,
      });
    } else {
      // fallback jika provinsi tidak ditemukan
      console.warn(`Provinsi ${namaGeo} tidak ditemukan di backend`);
    }
  };

  return (
    <>
      <div className="mt-2">
        <Row>
          <Col md={7}>
            <Card>
              <Card.Header className="text-center">
                <h6>Persebaran Program Revitalisasi Sekolah Nasional</h6>
              </Card.Header>
              <Card.Body className="p-0">
                <div className="pb-2">
                  <ComposableMap
                    projection="geoMercator"
                    projectionConfig={{
                      scale: 1650,
                      center: [118, -2.5],
                    }}
                    style={{ width: "100%", height: "320px" }}
                  >
                    <ZoomableGroup zoom={1}>
                      {geoData && (
                        <>
                          {/* Wilayah Indonesia */}
                          <Geographies geography={geoData}>
                            {({ geographies }) =>
                              geographies.map((geo) => {
                                const namaGeo = geo.properties.Propinsi;
                                const provDataa = withTotalProvinsi.find(
                                  (p) =>
                                    normalisasiNama(p.nama_wilayah) ===
                                    normalisasiNama(namaGeo)
                                );
                                // console.log("cek geo data", provDataa);
                                if (provDataa) {
                                  console.log("Data prov:", namaGeo, provDataa);
                                }

                                const totalValue = provDataa
                                  ? provDataa.totalRefPaud +
                                    provDataa.totalRefSd +
                                    provDataa.totalRefSmp +
                                    provDataa.totalRefSma
                                  : 0;

                                console.log(
                                  "namaGeo:",
                                  namaGeo,
                                  "totalValue:",
                                  totalValue
                                );

                                const isSelected =
                                  selectedProvinsi &&
                                  selectedProvinsi.kode_pro ===
                                    provDataa?.kode_pro;

                                return (
                                  <Geography
                                    key={geo.rsmKey}
                                    geography={geo}
                                    onClick={() => handleProvinceClick(geo)}
                                    style={{
                                      default: {
                                        fill: provDataa
                                          ? isSelected
                                            ? "#0d5c90ff" // warna biru saat dipilih
                                            : getColor(
                                                totalValue,
                                                rangeValue.min,
                                                rangeValue.max
                                              )
                                          : "#cbd5e1",

                                        stroke: "#fff",
                                        strokeWidth: 0.5,
                                        outline: "none",
                                      },
                                      hover: {
                                        fill: "#76a3c1ff",
                                        cursor: "pointer",
                                      },
                                    }}
                                  />
                                );
                              })
                            }
                          </Geographies>

                          {/* Label nama provinsi */}
                          <Geographies geography={geoData}>
                            {({ geographies }) =>
                              geographies.map((geo) => {
                                const [x, y] = geoCentroid(geo);
                                const namaGeo = geo.properties.Propinsi;
                                return (
                                  <Marker key={geo.rsmKey} coordinates={[x, y]}>
                                    <text
                                      textAnchor="middle"
                                      alignmentBaseline="middle"
                                      fontSize={15}
                                      fill="#111"
                                      style={{
                                        cursor: "pointer",
                                        fontWeight: "bold",
                                        userSelect: "none",
                                        backgroundColor:
                                          "rgba(255,255,255,0.7)",
                                      }}
                                      onClick={() => handleProvinceClick(geo)} // event click provinsi name
                                      onMouseEnter={(e) =>
                                        (e.target.style.fill = "#111")
                                      }
                                      onMouseLeave={(e) =>
                                        (e.target.style.fill = "#111")
                                      }
                                    >
                                      {namaGeo}
                                    </text>
                                  </Marker>
                                );
                              })
                            }
                          </Geographies>
                        </>
                      )}
                    </ZoomableGroup>
                  </ComposableMap>
                  <div className="container">
                    <div className="d-flex align-items-center">
                      {/* Nilai min di kiri */}
                      <span className="text-sm text-gray-700">
                        {rangeValue.min}
                      </span>
                      {/* Bar gradasi di tengah */}
                      <div
                        className="mx-1"
                        style={{
                          width: "250px",
                          height: "14px",
                          background:
                            "linear-gradient(to right, #bbdbe8ff, #0e67a1ff)",
                          borderRadius: "1px",
                          border: "1px solid #ccc",
                        }}
                      ></div>

                      {/* Nilai max di kanan */}
                      <span className="text-sm text-gray-700">
                        {rangeValue.max}
                      </span>
                    </div>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col md={5}>
            <Card>
              <Card.Header className="text-center">
                <h6>
                  {selectedProvinsi
                    ? `Data Revitalisasi di Provinsi ${selectedProvinsi.nama_wilayah}`
                    : "Nasional"}
                </h6>
              </Card.Header>
              <Card.Body className="p-1">
                <Row>
                  <div className="d-flex py-3">
                    <Col md={6} className="mt-2">
                      <div className="head-nasional px-1 rounded">
                        <p className="m-0 p-0 text-muted">
                          Total Revitalisasi Sekolah
                        </p>
                        <p className="isi">
                          {formatNumber(summary?.totalSekolah || 0)}
                        </p>
                      </div>
                      <div className="head-nasional px-1">
                        <p className="m-0 p-0 text-muted">
                          Revitalisasi Sekolah PAUD
                        </p>
                        <p className="isi">
                          {formatNumber(summary?.paud?.jumlah || 0)}
                        </p>
                      </div>
                      <div className="head-nasional px-1">
                        <p className="m-0 p-0 text-muted">
                          Revitalisasi Sekolah SD
                        </p>
                        <p className="isi">
                          {formatNumber(summary?.sd?.jumlah || 0)}
                        </p>
                      </div>
                      <div className="head-nasional px-1">
                        <p className="m-0 p-0 text-muted">
                          Revitalisasi Sekolah SMP
                        </p>
                        <p className="isi">
                          {formatNumber(summary?.smp?.jumlah || 0)}
                        </p>
                      </div>
                      <div className="head-nasional px-1">
                        <p className="m-0 p-0 text-muted">
                          Revitalisasi Sekolah SMA
                        </p>
                        <p className="isi">
                          {formatNumber(summary?.sma?.jumlah || 0)}
                        </p>
                      </div>
                    </Col>

                    <Col md={6} className="mt-2">
                      <div className="head-nasional px-1">
                        <p className="m-0 p-0 text-muted">
                          Total Anggaran Revitalisasi
                        </p>
                        <p className="isi">
                          {formatRupiah(summary?.totalAnggaran || 0)}
                        </p>
                      </div>
                      <div className="head-nasional px-1">
                        <p className="m-0 p-0 text-muted">
                          Anggaran Revitalisasi Sekolah PAUD
                        </p>
                        <p className="isi">
                          {formatRupiah(summary?.paud?.anggaran || 0)}
                        </p>
                      </div>
                      <div className="head-nasional px-1">
                        <p className="m-0 p-0 text-muted">
                          Anggaran Revitalisasi Sekolah SD
                        </p>
                        <p className="isi">
                          {formatRupiah(summary?.sd?.anggaran || 0)}
                        </p>
                      </div>
                      <div className="head-nasional px-1">
                        <p className="m-0 p-0 text-muted">
                          Anggaran Revitalisasi Sekolah SMP
                        </p>
                        <p className="isi">
                          {formatRupiah(summary?.smp?.anggaran || 0)}
                        </p>
                      </div>
                      <div className="head-nasional px-1">
                        <p className="m-0 p-0 text-muted">
                          Anggaran Revitalisasi Sekolah SMA
                        </p>
                        <p className="isi">
                          {formatRupiah(summary?.sma?.anggaran || 0)}
                        </p>
                      </div>
                    </Col>
                  </div>
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
                <h6>
                  {selectedProvinsi
                    ? `Tabel Revitalisasi Sekolah Provinsi ${selectedProvinsi.nama_wilayah}`
                    : "Tabel Revitalisasi Sekolah Berdasarkan Provinsi"}
                </h6>
              </Card.Header>
              <Card.Body className="p-0">
                {/* <div style={{ overflowX: "auto" }}> */}
                <div style={{ maxHeight: "457px", overflowY: "auto" }}>
                  <Table bordered responsive className="table-prov">
                    <thead className="table-secondary">
                      <tr>
                        <th className="text-muted {selectedProvinsi ? 'text-danger' : ''}">
                          {selectedProvinsi ? `Kab/Kota` : "Provinsi"}
                        </th>
                        <th className="text-muted">Bentuk Pendidikan</th>
                        <th className="text-muted">
                          Banyak Sekolah
                          <br /> Akan di Revitalisasi
                        </th>
                        <th
                          className="text-muted"
                          style={{ width: "200px", textAlign: "right" }}
                        >
                          Anggaran
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {(selectedProvinsi
                        ? withTotalKabupaten
                        : withTotalProvinsi
                      ).map((item, i) => (
                        <tr key={i}>
                          <td
                            onClick={() =>
                              selectedProvinsi && setSelectedKabupaten(item)
                            }
                            className={
                              selectedProvinsi ? "text-danger" : "text-dark"
                            }
                            style={{
                              cursor: selectedProvinsi ? "pointer" : "default",
                            }}
                          >
                            {item.nama_wilayah}
                          </td>
                          <td className="p-0 m-0">
                            <div className="row-item">PAUD</div>
                            <div className="row-item">SD</div>
                            <div className="row-item">SMP</div>
                            <div className="row-item">SMA</div>
                          </td>

                          <td
                            className="p-0 m-0"
                            style={{ textAlign: "right" }}
                          >
                            <div className="row-item">{item.totalRefPaud}</div>
                            <div className="row-item">{item.totalRefSd}</div>
                            <div className="row-item">{item.totalRefSmp}</div>
                            <div className="row-item">{item.totalRefSma}</div>
                          </td>

                          <td
                            className="p-0 m-0"
                            style={{ textAlign: "right", width: "200px" }}
                          >
                            <div className="row-item">
                              {formatRupiah(item.totalAnggaranPaud)}
                            </div>
                            <div className="row-item">
                              {formatRupiah(item.totalAnggaranSd)}
                            </div>
                            <div className="row-item">
                              {formatRupiah(item.totalAnggaranSmp)}
                            </div>
                            <div className="row-item">
                              {formatRupiah(item.totalAnggaranSma)}
                            </div>
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
                <h6>
                  Anggaran Revitalisasi Sekolah Berdasarkan Bentuk Pendidikan
                </h6>
              </Card.Header>
              <Card.Body className="d-flex justify-content-center align-items-center">
                <Row>
                  <Col md={6}>
                    <>
                      <ChartDonut withTotalProvinsi={dataJenjang} />
                    </>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </div>

      {/* 🔹 Tampilkan ComboChart hanya kalau kabupaten dipilih */}
      {selectedKabupaten && (
        <div className="mt-2">
          <Row>
            <Col md="4">
              <Card className="p-4">
                <div className="text-center">
                  Jumlah Revitalisasi Sekolah per Jenjang <br /> (
                  {selectedKabupaten.nama_wilayah})
                </div>
                <div style={{ height: "220px" }}>
                  <Chart
                    className="pt-3"
                    type="bar"
                    data={jmlRefSekolahPerJenjang}
                    options={optionsJmlRefSekolahPerJenjang}
                  />
                </div>
                <div className="text-center text-muted title-namakab">
                  Jenjang Pendidikan
                </div>
              </Card>
            </Col>
            <Col md="4">
              <Card className="py-4 px-1">
                <div className="text-center">
                  Total Anggaran Revitalisasi per Jenjang
                  <br /> ({selectedKabupaten.nama_wilayah})
                </div>
                <div style={{ height: "220px" }}>
                  <Chart
                    className="pt-3"
                    type="bar"
                    data={totalAnggaranPerjenjang}
                    options={optionsTotalAnggaranPerjenjang}
                  />
                </div>
                <div className="text-center text-muted title-namakab">
                  Jenjang Pendidikan
                </div>
              </Card>
            </Col>
            <Col md="4">
              <Card className="py-4 px-1">
                <div className="text-center">
                  Revitalisasi Sekolah dan Anggaran per Jenjang
                  <br /> ({selectedKabupaten.nama_wilayah})
                </div>
                <div style={{ height: "220px" }}>
                  <Chart
                    className="pt-3"
                    type="bar"
                    data={refSekolahAnggaran}
                    options={optionsRefSekolahAnggaran}
                  />
                </div>
                <div className="text-center text-muted title-namakab">
                  Jenjang Pendidikan
                </div>
              </Card>
            </Col>
          </Row>
        </div>
      )}

      <div className="combo_chart mt-3 mb-5">
        <Card>
          <Card.Header className="text-center">
            <h6>
              {selectedProvinsi
                ? `Banyaknya Jumlah Revitalisasi Sekolah Berdasarkan Anggaran Revitalisasi di Seluruh Kab/Kota di ${selectedProvinsi.nama_wilayah}`
                : `Banyak Revitalisasi Sekolah Berdasarkan Anggaran Revitalisasi
              Berdasarkan Provinsi`}
            </h6>
          </Card.Header>
          <Card.Body>
            <Row>
              <Col>
                <ComboChart selectedProvinsi={selectedProvinsi} />
              </Col>
            </Row>
          </Card.Body>
        </Card>
      </div>
    </>
  );
}

export default Map;
