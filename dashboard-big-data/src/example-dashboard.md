---
toc: false
sidebar: false
title: Indicators
---

```js
let processedData = []; 
let currentColor = "#ffa37b"; 

// Hàm lấy dữ liệu từ API dựa trên loại cryptocurrency
async function fetchData(crypto) {
  try {
    const endpoint = `http://localhost:3000/api/${crypto}_pre?crypto=BTC`;
    const response = await fetch(endpoint);
    const data = await response.json();

    console.log(data);  // Kiểm tra dữ liệu trả về từ API

    processedData = data.map(row => ({
      x: new Date(row.DATE), // Chuyển đổi date thành kiểu Date
      y: row.key           // Sử dụng giá trị 'close' để vẽ biểu đồ
    }));
                      
    // Sau khi dữ liệu được xử lý, gọi hàm để vẽ biểu đồ
    drawCharts();

  } catch (error) {
    console.error("Lỗi khi tải dữ liệu từ API:", error);
  }
}
async function fetchIndicatorTable(indicator) {
  let url = "";
  switch (indicator) {
    case "MACD":
      url = "http://localhost:3000/api/macd_table";
      break;
    case "RSI":
      url = "http://localhost:3000/api/rsi_table";
      break;
    case "SMA":
      url = "http://localhost:3000/api/sma_table";
      break;
    case "EMA":
      url = "http://localhost:3000/api/ema_table";
      break;
  }

  try {
    const response = await fetch(url);
    const data = await response.json();
    renderTable(data, indicator);
  } catch (error) {
    console.error("Lỗi khi tải dữ liệu bảng:", error);
  }
}

function renderTable(data, indicator) {
  const headerRow = document.getElementById("table-header");
  const body = document.getElementById("table-body");

  headerRow.innerHTML = ""; // Xóa tiêu đề cũ
  body.innerHTML = ""; // Xóa dữ liệu cũ

  // Tạo tiêu đề bảng
  let headers = ["BASE"];
  if (indicator === "MACD") headers.push("MACD");
  else if (indicator === "RSI") headers.push("rsi");
  else if (indicator === "SMA")
    headers.push("SMA_5", "SMA_10", "SMA_20", "SMA_50", "SMA_100", "SMA_200");
  else if (indicator === "EMA")
    headers.push("ema5", "ema10", "ema20", "ema50", "ema100", "ema200");

  headers.forEach(header => {
    const th = document.createElement("th");
    th.innerText = header;
    headerRow.appendChild(th);
  });

  // Tạo dữ liệu bảng
  data.forEach(row => {
    const tr = document.createElement("tr");
    headers.forEach(header => {
      const td = document.createElement("td");
      td.innerText = row[header] || "-"; // Hiển thị "-" nếu không có dữ liệu
      tr.appendChild(td);
    });
    body.appendChild(tr);
  });
}

// Lắng nghe sự kiện khi chọn indicator
document.querySelectorAll('input[name="crypto"]').forEach(input => {
  input.addEventListener("change", event => {
    const selectedIndicator = event.target.value;
    fetchIndicatorTable(selectedIndicator);
  });
});
// Hàm vẽ biểu đồ
function drawCharts() {
  const chartContainer = document.getElementById("chart-container");

  if (chartContainer) {
    // Lấy kích thước mới của container mỗi khi vẽ lại
    const chartWidth = chartContainer.clientWidth;
    const chartHeight = chartContainer.clientHeight;

    const chart1 = Plot.plot({
      width: chartWidth,  // Set the width dynamically based on the container
      height: chartHeight, // Set the height dynamically based on the container
          x: { 
      label: "Date", 
      tickFormat: d => d.toLocaleDateString(),
      tickPadding: 1,  // Tăng khoảng cách giữa các tick và nhãn
    },
      y: { 
        label: "Value",
        domain: [Math.min(...processedData.map(d => d.y)), Math.max(...processedData.map(d => d.y))],
        tickPadding: 2,  
        tickSize: 1,  
        offset: 30,  
        tickFormat: d => {
          if (d >= 10000) {
            return (d / 1000).toFixed(0) + 'k'; // Ví dụ 100000 -> 100k
          }
          else if (d < 10000 & d >= 1000) {
            return d.toFixed(0); // Ví dụ 100000 -> 100k
          }
          return d.toFixed(2); 
        }
      },
      marks: [
        Plot.line(processedData, {x:'x', y:'y', stroke: currentColor}),
        Plot.areaY(processedData, { x: "x", y: "y", fill: currentColor, fillOpacity: 0.1 }),  
        Plot.ruleY([0]) // Vẽ đường y=0 để tham chiếu
      ],
    });

    // Xóa biểu đồ cũ trước khi gắn biểu đồ mới
    chartContainer.innerHTML = "";
    chartContainer.appendChild(chart1);
  }
}
let smaData = {}; // Lưu dữ liệu SMA
let activeSMA = new Set(); // Set chứa các SMA đang hiển thị
async function fetchSMAData() {
  const response = await fetch("http://localhost:3000/api/sma_pre?crypto=BTC");
  const data = await response.json();
  
  smaData = {
    SMA_5: data.map(d => ({ x: new Date(d.DATE), y: d.SMA_5 })),
    SMA_10: data.map(d => ({ x: new Date(d.DATE), y: d.SMA_10 })),
    SMA_20: data.map(d => ({ x: new Date(d.DATE), y: d.SMA_20 })),
    SMA_50: data.map(d => ({ x: new Date(d.DATE), y: d.SMA_50 })),
    SMA_100: data.map(d => ({ x: new Date(d.DATE), y: d.SMA_100 })),
    SMA_200: data.map(d => ({ x: new Date(d.DATE), y: d.SMA_200 }))
  };

  renderChart_SMA();
}
const smaColors = {
  SMA_5: "#ff6384",   // Màu cho SMA 5
  SMA_10: "#36a2eb",  // Màu cho SMA 10
  SMA_20: "#cc65fe",  // Màu cho SMA 20
  SMA_50: "#ffce56",  // Màu cho SMA 50
  SMA_100: "#4bc0c0", // Màu cho SMA 100
  SMA_200: "#9966ff"  // Màu cho SMA 200
};
function renderChart_SMA() {
  
  const marks = [];
  // Duyệt qua các SMA được chọn và thêm vào marks
  activeSMA.forEach(smaKey => {
    if (smaData[smaKey]) {
      const color = smaColors[smaKey] || "steelblue";
      marks.push(Plot.line(smaData[smaKey], { x: "x", y: "y", stroke: color, label: smaKey }));
    }
  });

  const chart = Plot.plot({
    width: 1300,
    height: 400,
    x: { label: "Date" },
    y: { label: "Value" },
    marks
  });

  document.getElementById("chart-container").innerHTML = "";
  document.getElementById("chart-container").appendChild(chart);
}
// Thêm sự kiện lắng nghe khi thay đổi kích thước của cửa sổ
let emaData = {}; // Lưu dữ liệu SMA
let activeEMA = new Set(); // Set chứa các SMA đang hiển thị
async function fetchEMAData() {
  const response = await fetch("http://localhost:3000/api/ema_pre?crypto=BTC");
  const data = await response.json();
  
  emaData = {
    EMA_5: data.map(d => ({ x: new Date(d.DATE), y: d.ema5 })),
    EMA_10: data.map(d => ({ x: new Date(d.DATE), y: d.ema10 })),
    EMA_20: data.map(d => ({ x: new Date(d.DATE), y: d.ema20 })),
    EMA_50: data.map(d => ({ x: new Date(d.DATE), y: d.ema50 })),
    EMA_100: data.map(d => ({ x: new Date(d.DATE), y: d.ema100 })),
    EMA_200: data.map(d => ({ x: new Date(d.DATE), y: d.ema200 })),
    EMA_13: data.map(d => ({ x: new Date(d.DATE), y: d.ema13 })),
    EMA_12: data.map(d => ({ x: new Date(d.DATE), y: d.ema12 })),
    EMA_26: data.map(d => ({ x: new Date(d.DATE), y: d.ema26 })),
  };

  renderChart_EMA();
}
const emaColors = {
  EMA_5: "#ff6384",   // Màu cho SMA 5
  EMA_10: "#36a2eb",  // Màu cho SMA 10
  EMA_20: "#cc65fe",  // Màu cho SMA 20
  EMA_50: "#ffce56",  // Màu cho SMA 50
  EMA_100: "#4bc0c0", // Màu cho SMA 100
  EMA_200: "#9966ff" , // Màu cho SMA 200
  EMA_13:"#6A93E6",
  EMA_12:"#E6735E",
  EMA_26:"#74C79F"
};
function renderChart_EMA() {
  
  const marks = [];
  // Duyệt qua các SMA được chọn và thêm vào marks
  activeEMA.forEach(emaKey => {
    if (emaData[emaKey]) {
      const color = emaColors[emaKey] || "steelblue";
      marks.push(Plot.line(emaData[emaKey], { x: "x", y: "y", stroke: color, label: emaKey }));
    }
  });

  const chart = Plot.plot({
    width: 1300,
    height: 400,
    x: { label: "Date" },
    y: { label: "Value" },
    marks
  });

  document.getElementById("chart-container").innerHTML = "";
  document.getElementById("chart-container").appendChild(chart);
}
window.addEventListener('resize', () => {
  drawCharts();  // Vẽ lại biểu đồ khi kích thước cửa sổ thay đổi
});
document.getElementById("SMA").addEventListener("change", () => {
  document.getElementById("sma-options").style.display = "flex";
  fetchSMAData();
  activeSMA.clear(); // Xóa các SMA đã chọn trước đó
  activeSMA.add("SMA_5"); // Thêm SMA_5 vào danh sách active
  document.querySelector('input[value="SMA_5"]').checked = true; // Tích chọn SMA_5
  document.querySelector('label input[value="SMA_5"]').parentNode.style.color = smaColors["SMA_5"];
});
// Xử lý khi chọn/bỏ chọn các checkbox SMA
document.querySelectorAll("#sma-options input[type='checkbox']").forEach(checkbox => {
  checkbox.addEventListener("change", event => {
    const label = event.target.parentNode; // Nhãn của checkbox
    const color = smaColors[event.target.value] || "black"; // Lấy màu từ smaColors
    if (event.target.checked) {
      activeSMA.add(event.target.value);
      label.style.color = color;
    } else {
      activeSMA.delete(event.target.value);
      label.style.color = "";
    }
    renderChart_SMA();
  });
});
document.getElementById("EMA").addEventListener("change", () => {
  document.getElementById("ema-options").style.display = "flex";
  console.log(typeof fetchEMAData);
  fetchEMAData();
  activeEMA.clear(); // Xóa các SMA đã chọn trước đó
  activeEMA.add("EMA_5"); // Thêm SMA_5 vào danh sách active
  document.querySelector('input[value="EMA_5"]').checked = true; // Tích chọn SMA_5
  document.querySelector('label input[value="EMA_5"]').parentNode.style.color = emaColors["EMA_5"];
});
// Xử lý khi chọn/bỏ chọn các checkbox SMA
document.querySelectorAll("#ema-options input[type='checkbox']").forEach(checkbox => {
  checkbox.addEventListener("change", event => {
    const label = event.target.parentNode; // Nhãn của checkbox
    const color = emaColors[event.target.value] || "black"; // Lấy màu từ smaColors
    if (event.target.checked) {
      activeEMA.add(event.target.value);
      label.style.color = color;
    } else {
      activeEMA.delete(event.target.value);
      label.style.color = "";
    }
    renderChart_EMA();
  });
});
// Gọi fetchData để bắt đầu xử lý với crypto mặc định là "BTC"
document.querySelectorAll('input[type="radio"]').forEach(radio => {
  radio.addEventListener('change', (event) => {
    const selectedCrypto = event.target.value;  // Lấy giá trị của cryptocurrency đã chọn
    console.log("Selected Crypto:", selectedCrypto);

    // Thay đổi màu đường tùy thuộc vào lựa chọn của người dùng
    switch (selectedCrypto) {
      case 'macd':
        currentColor = "#ffa37b"; 
        break;
      case 'rsi':
        currentColor = "#ff63a0"; 
        break;
      case 'sma':
        currentColor = "#ffd684"; 
        break;
      case 'ema':
        currentColor = "#c2cf67"; 
        break;
      default:
        currentColor = "#ffd684"; 
    }
    // Gọi fetchData với cryptocurrency đã chọn
    if (selectedCrypto === "SMA") {
      document.getElementById("sma-options").style.display = "flex"; // Hiện thanh chọn SMA
      document.getElementById("ema-options").style.display = "none"; // Ẩn thanh EMA
      fetchSMAData()
    } else if (selectedCrypto === "EMA") {
      document.getElementById("ema-options").style.display = "flex"; // Hiện thanh chọn EMA
      document.getElementById("sma-options").style.display = "none"; // Ẩn thanh SMA
      console.log(typeof fetchEMAData);
      fetchEMAData()
    } else {
      document.getElementById("sma-options").style.display = "none"; // Ẩn thanh SMA
      document.getElementById("ema-options").style.display = "none"; // Ẩn thanh EMA
      fetchData(selectedCrypto);
    }
  });
});

// Bắt đầu với cryptocurrency mặc định "BTC"
document.addEventListener('DOMContentLoaded', () => {
  fetchData('macd');
  fetchIndicatorTable('MACD');

  
});

fetchData('macd');
fetchIndicatorTable('MACD');
 

```


<div>
  <div class="crypto-options">
    <div>
      <input type="radio" id="MACD" name="crypto" value="MACD" checked>
      <label for="MACD">MACD</label>
    </div>
    <div>
      <input type="radio" id="RSI" name="crypto" value="RSI">
      <label for="RSI">RSI</label>
    </div>
    <div>
      <input type="radio" id="SMA" name="crypto" value="SMA" >
      <label for="SMA">SMA</label>
    </div>
    <div>
      <input type="radio" id="EMA" name="crypto" value="EMA">
      <label for="EMA">EMA</label>
    </div>
  </div>
</div>
<!-- Checkbox cho SMA -->
  <div class="sma-options" id="sma-options">
    <label><input type="checkbox" value="SMA_5"> SMA 5</label>
    <label><input type="checkbox" value="SMA_10"> SMA 10</label>
    <label><input type="checkbox" value="SMA_20"> SMA 20</label>
    <label><input type="checkbox" value="SMA_50"> SMA 50</label>
    <label><input type="checkbox" value="SMA_100"> SMA 100</label>
    <label><input type="checkbox" value="SMA_200"> SMA 200</label>
  </div>
  <div class="ema-options" id="ema-options">
    <label><input type="checkbox" value="EMA_5"> EMA 5</label>
    <label><input type="checkbox" value="EMA_10"> EMA 10</label>
    <label><input type="checkbox" value="EMA_20"> EMA 20</label>
    <label><input type="checkbox" value="EMA_50"> EMA 50</label>
    <label><input type="checkbox" value="EMA_100"> EMA 100</label>
    <label><input type="checkbox" value="EMA_200"> EMA 200</label>
    <label><input type="checkbox" value="EMA_13"> EMA 13</label>
    <label><input type="checkbox" value="EMA_12"> EMA 12</label>
    <label><input type="checkbox" value="EMA_26"> EMA 26</label>
  </div>
<div id="indicator-table" style="margin-top: 20px;">
  <h3>Present Indicator Data</h3>
  <table border="1" id="data-table" style="width: 100%; text-align: center;">
    <thead>
      <tr id="table-header"></tr>
    </thead>
    <tbody id="table-body"></tbody>
  </table>
</div>
<h3>Historical Bitcoin Data</h3>
<style>
  /* Apply a custom font to the crypto-options */
  .crypto-options label {
    font-family: 'Arial', sans-serif;  /* Example font, you can change this to any other font */
  }
</style>




<script>

function formatNumber(num) {
  if (num >= 1e9) {
    return (num / 1e9).toFixed(2) + 'B'; // Tỷ
  } else if (num >= 1e6) {
    return (num / 1e6).toFixed(2) + 'M'; // Triệu
  } else if (num >= 1e3) {
    return (num / 1e3).toFixed(2) + 'K'; // Nghìn
  } else {
    return num.toLocaleString("en-US"); // Không cần thay đổi nếu nhỏ hơn nghìn
  }
}


// Hàm xử lý khi người dùng chọn đồng tiền điện tử
document.querySelectorAll('input[name="crypto"]').forEach((input) => {
  input.addEventListener("change", (event) => {
    const selectedCrypto = event.target.value;
    fetchData(selectedCrypto); // Gọi hàm fetchData khi thay đổi lựa chọn
  });
});
document.getElementById("EMA").addEventListener("change", () => {
  document.getElementById("ema-options").style.display = "flex";
  console.log(typeof fetchEMAData);
  fetchEMAData();
});



</script>

<!-- Chart container -->
<div class="card">
  <div id="chart-container" style="width: 100%; height: 500px;"></div>
</div>


---
<link href="https://fonts.googleapis.com/css2?family=League+Spartan:wght@400;700&display=swap" rel="stylesheet">

<style>

.hero {
  display: flex;
  flex-direction: column;
  align-items: center;
  font-family: var(--sans-serif);
  margin: 4rem 0 8rem;
  text-wrap: balance;
  text-align: center;
}

.hero h1 {
  margin: 1rem 0;
  padding: 1rem 0;
  max-width: none;
  font-size: 14vw;
  font-weight: 900;
  line-height: 1;
  background: linear-gradient(30deg, var(--theme-foreground-focus), currentColor);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero h2 {
  margin: 0;
  max-width: 34em;
  font-size: 20px;
  font-style: initial;
  font-weight: 500;
  line-height: 1.5;
  color: var(--theme-foreground-muted);
}

@media (min-width: 640px) {
  .hero h1 {
    font-size: 90px;
  }
}
.crypto-options {
  display: flex; /* Sử dụng flexbox để sắp xếp các radio button theo chiều ngang */
  gap: 20px; /* Khoảng cách giữa các radio button */
  align-items: center; /* Căn giữa các phần tử dọc theo trục ngang */
}

.crypto-options div {
  display: flex;
  align-items: center; /* Đảm bảo nhãn và radio button được căn giữa */
}

.crypto-options label {
  margin-left: 5px; /* Thêm khoảng cách giữa radio button và nhãn */
}

  .crypto-options label {
    font-family: 'Roboto', sans-serif;
  }

/* Màu sắc cho giá trị âm */
.change-negative {
  color: #EE7674;
}

/* Màu sắc cho giá trị dương */
.change-positive {
  color: #4CB963;
}
   .sma-options {
      display: none; /* Ẩn thanh SMA ban đầu */
    }
   .ema-options {
      display: none; /* Ẩn thanh SMA ban đầu */
    }
#data-table th {
  text-align: center; /* Căn giữa nội dung trong headers */
  vertical-align: middle; /* Căn giữa theo chiều dọc */
  font-weight: bold; /* Làm đậm chữ trong headers */
  background-color: #000000; /* Tùy chọn: Thêm màu nền nhẹ cho headers */
}

</style>
