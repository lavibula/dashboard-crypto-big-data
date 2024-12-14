---
toc: false
sidebar: false
---

```js
let processedData = []; 
let currentColor = "#ffa37b"; 

// Hàm lấy dữ liệu từ API dựa trên loại cryptocurrency
async function fetchData(crypto) {
  try {
    const endpoint = `http://localhost:3000/api/data?crypto=${crypto}`;
    const response = await fetch(endpoint);
    const data = await response.json();

    console.log(data);  // Kiểm tra dữ liệu trả về từ API

    processedData = data.map(row => ({
      x: new Date(row.date), // Chuyển đổi date thành kiểu Date
      y: row.close           // Sử dụng giá trị 'close' để vẽ biểu đồ
    }));

    // Sau khi dữ liệu được xử lý, gọi hàm để vẽ biểu đồ
    drawCharts();

  } catch (error) {
    console.error("Lỗi khi tải dữ liệu từ API:", error);
  }
}

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
      x: { label: "Date", tickFormat: d => d.toLocaleDateString() },
      y: { 
        label: "Close Price (USD)",
        domain: [Math.min(...processedData.map(d => d.y)), Math.max(...processedData.map(d => d.y))],
        tickPadding: 2,  // Thêm khoảng cách giữa các tick và nhãn
        tickSize: 1,  // Kích thước các tick trên trục y
        offset: 30,  // Dịch các nhãn của trục y sang phải một chút để tránh bị che khuất
        tickFormat: d => {
          // Kiểm tra nếu giá trị lớn hơn 1000 và chuyển đổi sang định dạng rút gọn
          if (d >= 10000) {
            return (d / 1000).toFixed(0) + 'k'; // Ví dụ 100000 -> 100k
          }
          else if (d < 10000 & d >= 1000) {
            return d.toFixed(0); // Ví dụ 100000 -> 100k
          }
          return d.toFixed(2); // Đối với các giá trị nhỏ hơn 1000, giữ nguyên định dạng
        }
      },
      marks: [
        Plot.line(processedData, { x: "x", y: "y", stroke: currentColor }),  // Đặt màu của đường (line)
        Plot.ruleY([0]) // Vẽ đường y=0 để tham chiếu
      ],
    });

    // Xóa biểu đồ cũ trước khi gắn biểu đồ mới
    chartContainer.innerHTML = "";
    chartContainer.appendChild(chart1);
  }
}

// Thêm sự kiện lắng nghe khi thay đổi kích thước của cửa sổ
window.addEventListener('resize', () => {
  drawCharts();  // Vẽ lại biểu đồ khi kích thước cửa sổ thay đổi
});


// Gọi fetchData để bắt đầu xử lý với crypto mặc định là "BTC"
document.querySelectorAll('input[type="radio"]').forEach(radio => {
  radio.addEventListener('change', (event) => {
    const selectedCrypto = event.target.value;  // Lấy giá trị của cryptocurrency đã chọn
    console.log("Selected Crypto:", selectedCrypto);

    // Thay đổi màu đường tùy thuộc vào lựa chọn của người dùng
    switch (selectedCrypto) {
      case 'BTC':
        currentColor = "#ffa37b"; 
        break;
      case 'ETH':
        currentColor = "#ff63a0"; 
        break;
      case 'USDT':
        currentColor = "#ffd684"; 
        break;
      case 'ADA':
        currentColor = "#c2cf67"; 
        break;
      case 'DOGE':
        currentColor = "#58a1d9"; 
        break;
      case 'MATIC':
        currentColor = "#00a0b0"; 
        break;
      default:
        currentColor = "#ffa37b"; 
    }

    // Gọi fetchData với cryptocurrency đã chọn
    fetchData(selectedCrypto);
  });
});

// Bắt đầu với cryptocurrency mặc định "BTC"
document.addEventListener('DOMContentLoaded', () => {
  fetchData('BTC');
});

fetchData('BTC');


```

<div class="hero">
  <h1>Real-time Cryptocurrency Analytics</h1>
  <h2>Welcome to our project! All copyrights belong to Group 14.</h2>
</div>

<!-- Cards with big numbers -->

<div class="grid grid-cols-4">
  <div class="card">
    <h2>Price 🇺🇸</h2>
    <span class="big">${launches.filter((d) => d.stateId === "US").length.toLocaleString("en-US")}</span>
  </div>
  <div class="card">
    <h2>Market Cap 🇷🇺 </h2>
    <span class="big">${launches.filter((d) => d.stateId === "SU" || d.stateId === "RU").length.toLocaleString("en-US")}</span>
  </div>
  <div class="card">
    <h2>24H Volume 🇨🇳</h2>
    <span class="big">${launches.filter((d) => d.stateId === "CN").length.toLocaleString("en-US")}</span>
  </div>
  <div class="card">
    <h2>24H Change</h2>
    <span class="big">${launches.filter((d) => d.stateId !== "US" && d.stateId !== "SU" && d.stateId !== "RU" && d.stateId !== "CN").length.toLocaleString("en-US")}</span>
  </div>
</div>

<!-- Dropdown for Selecting Cryptocurrency -->
<!-- <div>
  <label for="crypto-select">Select Cryptocurrency: </label>
  <select id="crypto-select">
    <option value="BTC">BTC</option>
    <option value="ETH">ETH</option>
    <option value="USDT">USDT</option>
    <option value="XRP">XRP</option>
    <option value="ADA">ADA</option>
    <option value="DOGE">DOGE</option>
    <option value="MATIC">MATIC</option>
  </select>
</div> -->

<div>
  <label>Select Cryptocurrency: </label>
  <div class="crypto-options">
    <div>
      <input type="radio" id="BTC" name="crypto" value="BTC" checked>
      <label for="BTC">BTC</label>
    </div>
    <div>
      <input type="radio" id="ETH" name="crypto" value="ETH">
      <label for="ETH">ETH</label>
    </div>
    <div>
      <input type="radio" id="USDT" name="crypto" value="USDT">
      <label for="USDT">USDT</label>
    </div>
    <div>
      <input type="radio" id="ADA" name="crypto" value="ADA">
      <label for="ADA">ADA</label>
    </div>
    <div>
      <input type="radio" id="DOGE" name="crypto" value="DOGE">
      <label for="DOGE">DOGE</label>
    </div>
    <div>
      <input type="radio" id="MATIC" name="crypto" value="MATIC">
      <label for="MATIC">MATIC</label>
    </div>
  </div>
</div>

<style>
  /* Apply a custom font to the crypto-options */
  .crypto-options label {
    font-family: 'Arial', sans-serif;  /* Example font, you can change this to any other font */
  }
</style>




<!-- Chart container -->
<div class="card">
  <div id="chart-container" style="width: 100%; height: 500px;"></div>
</div>


---
<link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap" rel="stylesheet">

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

</style>

