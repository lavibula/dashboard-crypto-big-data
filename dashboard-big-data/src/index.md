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
          x: { 
      label: "Date", 
      tickFormat: d => d.toLocaleDateString(),
      tickPadding: 1,  // Tăng khoảng cách giữa các tick và nhãn
    },
      y: { 
        label: "Close Price (USD)",
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
// Gọi lại API mỗi 30 giây
setInterval(() => {
  const selectedCrypto = document.querySelector('input[name="crypto"]:checked').value;
  fetchData(selectedCrypto);
  fetchData1(selectedCrypto);  
}, 10000);  

```

<div class="hero">
  <h1>Real-time Cryptocurrency Analytics</h1>
  <h2>Welcome to our project! All copyrights belong to Group 14.</h2>
</div>

<!-- Cards with big numbers -->
<div class="card">
  <span id="update-time"></span>
</div>

<div class="grid grid-cols-4">
  <div class="card">
    <h2>Price </h2>
    <span class="big" id="price-us"></span>
  </div>
  <div class="card">
    <h2>Market Cap </h2>
    <span class="big" id="market-cap-ru"></span>
  </div>
  <div class="card">
    <h2>24H Volume </h2>
    <span class="big" id="volume-cn"></span>
  </div>
  <div class="card">
    <h2>24H Change</h2>
    <span class="big" id="change-other">0.00%</span> 
  </div>



</div>


<div>
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




<script>
const cryptoMap = {
  BTC: "bitcoin",
  ETH: "ethereum",
  LTC: "litecoin",
  ADA: "cardano",
  XRP: "ripple",
  USDT: "tether",
  DOGE: "dogecoin",
  XLM: "stellar",
  NEAR: "near",
  ATOM: "cosmos",
  USDC: "usd-coin",
  DOT: "polkadot",
  TRX: "tron",
  LINK: "chainlink",
  SOL: "solana",
  SHIB: "shiba-inu",
  MATIC: "matic-network"
};
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

async function fetchData1(crypto) {
  try {
    const cryptoFullName = cryptoMap[crypto] || crypto;
    const response = await fetch(`http://localhost:3000/api/price?crypto=${cryptoFullName}`);
    const data = await response.json();

    console.log(data);  // Kiểm tra dữ liệu trả về

    const cryptoData = data[0]; // Lấy đối tượng đầu tiên trong mảng

    // Cập nhật các phần tử HTML với dữ liệu đã được định dạng
    document.getElementById('price-us').innerText = cryptoData && cryptoData.price ? formatNumber(cryptoData.price) : "N/A";
    document.getElementById('market-cap-ru').innerText = cryptoData && cryptoData.market_cap ? formatNumber(cryptoData.market_cap) : "N/A";
    document.getElementById('volume-cn').innerText = cryptoData && cryptoData.volume_24h ? formatNumber(cryptoData.volume_24h) : "N/A";
    update24HChange(cryptoData.change_24h.toFixed(2));

    // Cập nhật thời gian cập nhật
  const updateTime = cryptoData && cryptoData.updated_at ? 
    new Date(cryptoData.updated_at).toLocaleString('en-US', {
      timeZone: 'Asia/Ho_Chi_Minh',
      hour12: false, // 24h format
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    })
    : "N/A"; // Kiểm tra và chuyển đổi timestamp về thời gian thực ở Việt Nam

  document.getElementById('update-time').innerText = `Last Updated: ${updateTime}`; // Hiển thị thời gian


  } catch (error) {
    console.error("Lỗi khi lấy dữ liệu:", error);
  }
}

// Hàm xử lý khi người dùng chọn đồng tiền điện tử
document.querySelectorAll('input[name="crypto"]').forEach((input) => {
  input.addEventListener("change", (event) => {
    const selectedCrypto = event.target.value;
    fetchData1(selectedCrypto); // Gọi hàm fetchData khi thay đổi lựa chọn
  });
});

// Gọi hàm fetchData khi trang tải để hiển thị dữ liệu mặc định (BTC)
// Thêm kiểm tra xem có giá trị mặc định hay không
window.onload = () => {
  const selectedCrypto = document.querySelector('input[name="crypto"]:checked');
  if (selectedCrypto) {
    fetchData1(selectedCrypto.value);  // Gọi hàm fetchData khi có sự kiện trang tải
  }
};

// Hàm thay đổi màu sắc và nội dung của 24H Change
function update24HChange(value) {
  const changeElement = document.getElementById("change-other");

  // Cập nhật giá trị hiển thị
  changeElement.textContent = value + "%";

  // Xóa các lớp cũ trước khi thêm lớp mới
  changeElement.classList.remove("change-negative", "change-positive");

  // Kiểm tra xem giá trị là âm hay dương để thay đổi màu sắc
  if (value < 0) {
    changeElement.classList.add("change-negative"); // Màu đỏ cho giá trị âm
  } else if (value > 0) {
    changeElement.classList.add("change-positive"); // Màu xanh cho giá trị dương
  }
}

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


</style>

