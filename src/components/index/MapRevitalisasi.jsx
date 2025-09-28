import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, GeoJSON, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./Map.css";
import ChartDonut from "./ChartDonut";
import { Card, Row, Col, ListGroup, Container, Table } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import getApiBackend from "../../api/ApiBackend";
import { cleanNumber } from "../../helper/cleanNumber";
import { formatRupiah } from "../../helper/formatRupiah";
import { sumByField } from "../../helper/sumByField";
import { ComboChart } from "../../utils/ComboCharts";
import { hitungSummary } from "../../helper/hitungSummary";
import { getChartData } from "../../utils/getChartData";
import { totalAnggaranPerJenjang } from "../../utils/totalAnggaranPerJenjang";
import { jmlRefPerJenjang } from "../../utils/jmlRefPerJenjang";
import { ProgresBar } from "../../utils/ProgresBar";
import { Chart } from "react-chartjs-2";

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
  // Fungsi helper untuk format angka
  const formatNumber = (num) => num.toLocaleString("id-ID");
  const [geoData, setGeoData] = useState(null);
  const [provinsi, setProvinsi] = useState([]);
  const [provinsiData, setProvinsiData] = useState([]);
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
  const [dataKab, setDataKab] = useState(null);
  const [dataJenjang, setJenjang] = useState(null);
  const [selectedKabupaten, setSelectedKabupaten] = useState(null);
  // const [getChartData, setChartData] = useState(null);
  const { data, options } = getChartData(selectedKabupaten);

  // Ambil GeoJSON
  useEffect(() => {
    fetch("/indonesiav1.geojson")
      .then((res) => res.json())
      .then((data) => setGeoData(data))
      .catch((err) => console.error("Gagal fetch GeoJSON:", err));
  }, []);

  // Ambil data backend
  useEffect(() => {
    const fetchDataApi = async () => {
      try {
        const getDataRevitalisasi = await getApiBackend.getRevitalisasi();

        const provinsi = getDataRevitalisasi.filter(
          (item) => item.tingkat_label === "provinsi"
        );
        console.log("total berdasarkan provinsi", provinsi);
        setProvinsi(provinsi);

        const provinsiData = getDataRevitalisasi.filter(
          (item) => item.tingkat_label === "provinsi"
        );

        const provinsiWithTotals = provinsiData.map((prov) => {
          const kabupatenData = getDataRevitalisasi.filter(
            (item) =>
              item.tingkat_label === "kabupaten" &&
              item.kode_pro === prov.kode_pro
          );
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
        const kabupaten = getDataRevitalisasi.filter(
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
      } catch (err) {
        console.error("Maps => Gagal ambil data API:", err);
      }
    };

    fetchDataApi();
  }, []);

  // Style provinsi
  const geoStyle = {
    color: "#2543b1ff",
    weight: 1,
    fillColor: "#ccccccff",
    fillOpacity: 0.3,
  };

  const normalisasiNama = (name) =>
    name
      .toLowerCase()
      .replace("provinsi", "")
      .replace("daerah istimewa", "")
      .trim();

  // Pasang summary nasional saat data kabupaten sudah ada
  useEffect(() => {
    if (kabupaten.length > 0) {
      setSummary(hitungSummary(kabupaten)); // summary nasional
    }
  }, [kabupaten]);

  console.log("cek data", selectedKabupaten);

  // Hubungkan GeoJSON dengan API backend
  const onEachProvince = (feature, layer) => {
    const namaGeo = normalisasiNama(feature.properties.state);

    const prov = provinsi.find(
      (p) => normalisasiNama(p.nama_wilayah) === namaGeo
    );

    if (prov) {
      layer.bindTooltip(`Prov. ${prov.nama_wilayah}`, {
        permanent: true,
        direction: "center",
        className: "map-label",
      });

      // event klik*
      layer.on("click", () => {
        console.log("Provinsi di klik:", prov);
        setSelectedProvinsi(prov);

        const filterDataKab = kabupaten.filter(
          (k) => k.tingkat_label === "kabupaten" && k.kode_pro === prov.kode_pro
        );
        console.log("cek data kabupaten", filterDataKab);
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

        setProvinsiData(nasional);
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
      });
      // layer.on("click", () => {
      //   // console.log("Provinsi di klik:", prov);

      //   // filter semua kabupaten dalam provinsi ini
      //   const filterDataKab = kabupaten.filter(
      //     (k) => k.tingkat_label === "kabupaten" && k.kode_pro === prov.kode_pro
      //   );

      //   // console.log("Data kabupaten dari provinsi:", filterDataKab);

      //   // agregasi anggaran per jenjang
      //   const totalPaud = sumByField(filterDataKab, "anggaran_rev_paud");
      //   const totalSd = sumByField(filterDataKab, "anggaran_rev_sd");
      //   const totalSmp = sumByField(filterDataKab, "anggaran_rev_smp");
      //   const totalSma = sumByField(filterDataKab, "anggaran_rev_sma");

      //   // kirim ke state sebagai data provinsi yg sudah diolah
      //   setSelectedProvinsi({
      //     nama_wilayah: prov.nama_wilayah,
      //     anggaran_rev_paud: totalPaud,
      //     anggaran_rev_sd: totalSd,
      //     anggaran_rev_smp: totalSmp,
      //     anggaran_rev_sma: totalSma,
      //   });

      //   // hittung data summary
      //   setSummary(hitungSummary(filterDataKab));
      // });
    } else {
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
                  <MapContainer
                    center={[-2.5, 118]}
                    zoom={12}
                    minZoom={4}
                    maxZoom={10}
                    style={{ height: "320px", width: "100%" }}
                  >
                    <TileLayer
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      attribution="&copy; OpenStreetMap contributors"
                    />
                    {geoData && provinsiData.length > 0 && (
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
                  <div className="mx-2 mt-2">
                    <ProgresBar />
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
                  <Table bordered hover responsive className="table-prov">
                    <thead className="table-secondary">
                      <tr>
                        <th className="text-muted">
                          {selectedProvinsi ? `Kab/Kota` : "Provinsi"}
                        </th>
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
                <h6>
                  Anggaran Revitalisasi Sekolah Berdasarkan Bentuk Pendidikan
                </h6>
              </Card.Header>
              <Card.Body className="d-flex justify-content-center align-items-center">
                <Row>
                  <Col md={6}>
                    <>
                      <ChartDonut provinsiData={dataJenjang} />
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
                  Jumlah Revitalisasi Sekolah per Jenjang (
                  {selectedKabupaten.nama_wilayah})
                </div>
                <Chart
                  className="pt-3"
                  type="bar"
                  data={jmlRefPerJenjang(selectedKabupaten)}
                  // options={options}
                />
                <div className="text-center text-muted title-namakab">
                  Jenjang Pendidikan
                </div>
              </Card>
            </Col>
            <Col md="4">
              <Card className="p-4">
                <div className="text-center">
                  Total Anggaran Revitalisasi per Jenjang (
                  {selectedKabupaten.nama_wilayah})
                </div>
                <Chart
                  className="pt-3"
                  type="bar"
                  data={totalAnggaranPerJenjang(selectedKabupaten)}
                  // options={options}
                />
                <div className="text-center text-muted title-namakab">
                  Jenjang Pendidikan
                </div>
              </Card>
            </Col>
            <Col md="4">
              <Card className="p-4">
                <div className="text-center">
                  Revitalisasi Sekolah dan Anggaran per Jenjang (
                  {selectedKabupaten.nama_wilayah})
                </div>
                <div style={{ height: "230px" }}>
                  <Chart
                    className="pt-3"
                    type="bar"
                    data={data}
                    options={options}
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
