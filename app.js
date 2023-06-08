const mysql = require('mysql');
const config = require('./config');
const pool = mysql.createPool(config);
const tf = require('@tensorflow/tfjs');
const tfnode = require('@tensorflow/tfjs-node');
const dfd = require('danfojs-node');

async function loadModel1(sensor1_adc, sensor2_adc, sensor3_adc, sensor4_adc, sensor5_adc, sensor6_adc) {
  const handler = tfnode.io.fileSystem('klasifikasi/adc_cnn/model.json');
  const model = await tf.loadLayersModel(handler);

  data = { sensor1_adc: [sensor1_adc], sensor2_adc: [sensor2_adc], sensor3_adc: [sensor3_adc], sensor4_adc: [sensor4_adc], sensor5_adc: [sensor5_adc], sensor6_adc: [sensor6_adc] };

  console.log('nilai sensor gas:');
  console.log(data);
  let df = new dfd.DataFrame(data);
  let tf_tensor = df.tensor;
  let reshapedInput = tf_tensor.reshape([tf_tensor.shape[0], tf_tensor.shape[1], 1]);

  // console.log(model.predict(1,1,1,1,1,1))
  // console.log(model.predict(tf_tensor).dataSync()[0])
  // console.log(model.predict(tf_tensor).dataSync()[1])
  // console.log(model.predict(tf_tensor).dataSync()[2])
  // console.log(model.predict(tf_tensor).dataSync()[3])

  /*

         0 => Gas
         1 => Alkohol
         2 => Asap
         3 => bersih
     */
  let pred = model.predict(reshapedInput).dataSync();
  console.log(`Nilai hasil prediksi : ${pred}`);
  if (model.predict(reshapedInput).dataSync()[0] >= 0.5) {
    const klasifikasi = 'Udara Bersih';
    console.log(klasifikasi);
    const insert = 'INSERT INTO hasil_klasifikasi (hasil) VALUES (?)';
    const values = [klasifikasi];
    pool.query(insert, values, (err, results) => {
      if (err) throw err;
      console.log(`Prediksi: ${klasifikasi}`);
    });
  }

  if (model.predict(reshapedInput).dataSync()[1] >= 0.5) {
    const klasifikasi = 'Alkohol';
    console.log(klasifikasi);
    const insert = 'INSERT INTO hasil_klasifikasi (hasil) VALUES (?)';
    const values = [klasifikasi];
    pool.query(insert, values, (err, results) => {
      if (err) throw err;
      console.log(`Prediksi: ${klasifikasi}`);
    });
  }

  if (model.predict(reshapedInput).dataSync()[2] >= 0.5) {
    const klasifikasi = 'Gas';
    console.log(klasifikasi);
    const insert = 'INSERT INTO hasil_klasifikasi (hasil) VALUES (?)';
    const values = [klasifikasi];
    pool.query(insert, values, (err, results) => {
      if (err) throw err;
      console.log(`Prediksi: ${klasifikasi}`);
    });
  }

  if (model.predict(reshapedInput).dataSync()[3] >= 0.5) {
    const klasifikasi = 'Asap';
    console.log(klasifikasi);
    const insert = 'INSERT INTO hasil_klasifikasi (hasil) VALUES (?)';
    const values = [klasifikasi];
    pool.query(insert, values, (err, results) => {
      if (err) throw err;
      console.log(`Prediksi: ${klasifikasi}`);
    });
  }
}

function ambilData() {
  pool.getConnection((err, connection) => {
    if (err) throw err;
    connection.query(`SELECT * FROM hasil_adc ORDER BY id DESC LIMIT 1`, (err, result) => {
      if (err) throw err;
      ambilNilai1(result);
    });
    connection.release();
  });
}

function ambilNilai1(result) {
  let arraySensor = [];
  for (let x = 1; x < 7; x++) {
    const data = [];
    for (let i in result) {
      data.push(result[i]['sensor' + x + '_adc']);
    }

    arraySensor[x - 1] = data[0];

    if (x == 6) {
      return loadModel1(arraySensor[0], arraySensor[1], arraySensor[2], arraySensor[3], arraySensor[4], arraySensor[5], arraySensor[6]);
    }
  }
}

function getId() {
  pool.getConnection(function (err, connection) {
    if (err) throw err; // not connected!

    // Use the connection
    connection.query('SELECT * FROM hasil_adc ORDER BY id DESC LIMIT 1', function (error, results, fields) {
      let data = 0;
      data = results[0]['id'];
      connection.release();

      // Handle error after the release.
      if (error) throw error;
      return test1(data);
    });
  });
}

// setInterval(function() {
//      getId2()
// },  1000) // per 1 detik

setInterval(function () {
  getId();
}, 1000); // per 1 detik

let id_prev = 0;
function test1(x) {
  let id_now = x;
  if (id_now > id_prev) {
    console.log(`id data baru : ${id_now}`);
    ambilData();
  }
  id_prev = id_now;
}
