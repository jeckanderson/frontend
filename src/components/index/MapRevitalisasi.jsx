import React, { useEffect, useState } from "react";
import "leaflet/dist/leaflet.css";
import "./Map.css";
import ChartDonut from "../charts/ChartDonut";
import { Card, Row, Col, ListGroup, Container, Table } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import { formatRupiah } from "../../helper/formatRupiah";
import { ComboChart } from "../charts/ComboCharts";
import { hitungSummary } from "../../helper/hitungSummary";
import { getChartData } from "../charts/getChartData";
import { totalAnggaranPerJenjang } from "../../utils/totalAnggaranPerJenjang";
import { jmlRefPerJenjang } from "../../utils/jmlRefPerJenjang";
import { getColor } from "../../utils/getColor";
import { Chart } from "react-chartjs-2";
import useRevitalisasiData from "../../hooks/useRevitalisasiData";

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
  const [withTotalKabupaten, setWithTotalKabupaten] = useState([]);
  const {
    provinsi,
    kabupaten,
    withTotalProvinsi,
    rangeValue,
    totalSemua,
    totalPaud,
    totalSd,
    totalSmp,
    totalSma,
    totalAnggaranRef,
    anggaranPaud,
    anggaranSD,
    anggaranSMP,
    anggaranSMA,
  } = useRevitalisasiData();

  const [geoData, setGeoData] = useState(null);

  const [selectedProvinsi, setSelectedProvinsi] = useState(null);
  const [kabupatenData, setKabupatenData] = useState([]);

  const [summary, setSummary] = useState(null);
  const [dataJenjang, setJenjang] = useState(null);
  const [selectedKabupaten, setSelectedKabupaten] = useState(null);

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
      <div className="mt-3">
        <Row>
          <Col md={7} className="mb-3">
            <h5>Revitalisasi Sarana Belajar Mengajar</h5>
            <div className="bg-white rounded box-shadow pb-1">
              <div className="text-center py-3">
                <h6>Persebaran Program Revitalisasi Sekolah Nasional</h6>
              </div>
              <div>
                <div className="pb-2">
                  <ComposableMap
                    projection="geoMercator"
                    projectionConfig={{
                      scale: 1950,
                      center: [118, -2.5],
                    }}
                    style={{ width: "100%", height: "270px" }}
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
                                            ? // ? "#0d5c90ff"  warna biru saat dipilih
                                              "#2198C7"
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
              </div>
            </div>
          </Col>

          <Col md={5}>
            <h5 style={{ minHeight: "24px" }}>
              {selectedProvinsi ? (
                <div className="text-center">
                  Data Revitalisasi di Provinsi{" "}
                </div>
              ) : (
                ""
              )}
            </h5>
            <div className="bg-white rounded box-shadow mb-2">
              <div className="text-center py-3">
                <h6>
                  {selectedProvinsi ? (
                    <div>
                      <span className="text-danger">
                        {selectedProvinsi.nama_wilayah}
                      </span>
                    </div>
                  ) : (
                    <div>Nasional</div>
                  )}
                </h6>
              </div>

              <Row>
                <div className="d-flex rounded">
                  <Col md={6}>
                    <div className="head-nasional mb-2 px-1 ">
                      <div className="pb-2">
                        <div className="text-muted">
                          Total Revitalisasi Sekolah
                        </div>
                        <div className="isi">
                          {formatNumber(summary?.totalSekolah || 0)}
                        </div>
                      </div>
                    </div>
                    <div className="head-nasional mb-2 px-1">
                      <div className="pb-2">
                        <div className="text-muted">
                          Revitalisasi Sekolah PAUD
                        </div>
                        <div className="isi">
                          {formatNumber(summary?.paud?.jumlah || 0)}
                        </div>
                      </div>
                    </div>
                    <div className="head-nasional mb-2 px-1">
                      <div className="pb-2">
                        <div className="text-muted">
                          Revitalisasi Sekolah SD
                        </div>
                        <div className="isi">
                          {formatNumber(summary?.sd?.jumlah || 0)}
                        </div>
                      </div>
                    </div>
                    <div className="head-nasional mb-2 px-1">
                      <div className="pb-2">
                        <div className="text-muted">
                          Revitalisasi Sekolah SMP
                        </div>
                        <div className="isi">
                          {formatNumber(summary?.smp?.jumlah || 0)}
                        </div>
                      </div>
                    </div>
                    <div className="head-nasional mb-2 px-1">
                      <div className="pb-2">
                        <div className="text-muted">
                          Revitalisasi Sekolah SMA
                        </div>
                        <div className="isi">
                          {formatNumber(summary?.sma?.jumlah || 0)}
                        </div>
                      </div>
                    </div>
                  </Col>

                  <Col md={6}>
                    <div className="head-nasional mb-2 px-1">
                      <div className="pb-2">
                        <div className="text-muted">
                          Total Anggaran Revitalisasi
                        </div>
                        <div className="isi">
                          {formatRupiah(summary?.totalAnggaran || 0)}
                        </div>
                      </div>
                    </div>
                    <div className="head-nasional mb-2 px-1">
                      <div className="pb-2">
                        <div className="text-muted">
                          Anggaran Revitalisasi Sekolah PAUD
                        </div>
                        <div className="isi">
                          {formatRupiah(summary?.paud?.anggaran || 0)}
                        </div>
                      </div>
                    </div>
                    <div className="head-nasional mb-2 px-1">
                      <div className="pb-2">
                        <div className="text-muted">
                          Anggaran Revitalisasi Sekolah SD
                        </div>
                        <div className="isi">
                          {formatRupiah(summary?.sd?.anggaran || 0)}
                        </div>
                      </div>
                    </div>
                    <div className="head-nasional mb-2 px-1">
                      <div className="pb-2">
                        <div className="text-muted">
                          Anggaran Revitalisasi Sekolah SMP
                        </div>
                        <div className="isi">
                          {formatRupiah(summary?.smp?.anggaran || 0)}
                        </div>
                      </div>
                    </div>
                    <div className="head-nasional mb-2 px-1">
                      <div className="pb-2">
                        <div className="text-muted">
                          Anggaran Revitalisasi Sekolah SMA
                        </div>
                        <div className="isi">
                          {formatRupiah(summary?.sma?.anggaran || 0)}
                        </div>
                      </div>
                    </div>
                  </Col>
                </div>
              </Row>
            </div>
            {/* <Card>
              <Card.Header className="text-center">
                <h6>
                  {selectedProvinsi ? (
                    <div>
                      Data Revitalisasi di Provinsi{" "}
                      <span className="text-danger">
                        {selectedProvinsi.nama_wilayah}
                      </span>
                    </div>
                  ) : (
                    "Nasional"
                  )}
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
            </Card> */}
          </Col>
        </Row>
      </div>

      <div className="mt-2 mb-3">
        <Row>
          <Col md={7}>
            <div className="bg-white rounded box-shadow mb-3">
              <div className="text-center py-2">
                <h6>
                  {selectedProvinsi ? (
                    <div className="text-danger">
                      Tabel Revitalisasi Sekolah Provinsi{" "}
                      {selectedProvinsi.nama_wilayah}
                    </div>
                  ) : (
                    "Tabel Revitalisasi Sekolah Berdasarkan Provinsi"
                  )}
                </h6>
              </div>

              {/* <div style={{ overflowX: "auto" }}> */}
              <div style={{ maxHeight: "425px", overflowY: "auto" }}>
                <Table bordered responsive className="table-prov">
                  <thead className="table-secondary">
                    <tr>
                      <th className="text-muted {selectedProvinsi ? 'text-danger' : ''}">
                        {selectedProvinsi ? (
                          <div className="text-danger">Kab/Kota</div>
                        ) : (
                          "Provinsi"
                        )}
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

                        <td className="p-0 m-0" style={{ textAlign: "right" }}>
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
            </div>
          </Col>

          <Col md={5}>
            <div className="bg-white rounded box-shadow pb-1">
              <div className="text-center py-2">
                <h6>
                  Anggaran Revitalisasi Sekolah Berdasarkan Bentuk Pendidikan
                </h6>
              </div>
              <div className="d-flex justify-content-center align-items-center">
                <ChartDonut withTotalProvinsi={dataJenjang} />
              </div>
            </div>
          </Col>
        </Row>
      </div>

      {/*  Tampilkan ComboChart hanya kalau kabupaten dipilih */}
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

      <div className="combo_chart mt-2 mb-5">
        <div className="bg-white rounded box-shadow pb-1">
          <div className="text-center py-3">
            <h6>
              {selectedProvinsi ? (
                <div className="text-danger">
                  Banyaknya Jumlah Revitalisasi Sekolah Berdasarkan Anggaran
                  Revitalisasi di Seluruh Kab/Kota di Provinsi{" "}
                  {selectedProvinsi.nama_wilayah}
                </div>
              ) : (
                `Banyak Revitalisasi Sekolah Berdasarkan Anggaran Revitalisasi
              Berdasarkan Provinsi`
              )}
            </h6>
          </div>

          <Row>
            <Col>
              <ComboChart selectedProvinsi={selectedProvinsi} />
            </Col>
          </Row>
        </div>
      </div>
    </>
  );
}

export default Map;
