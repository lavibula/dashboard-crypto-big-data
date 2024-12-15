---
# toc: false
# sidebar: false
---

```js
// Định nghĩa tỷ lệ cho chiều rộng và chiều cao
// const aspectRatio = 5 / 2;  // Tỷ lệ chiều rộng bằng 1.5 lần chiều cao
const showGrid = true;  // Biến điều khiển việc hiển thị lưới (true/false)

const colors = {
  positiveColor: "#226f54",  // Màu xanh lá cây cho giá trị dương
  negativeColor: "#da2c38",  // Màu đỏ cho giá trị âm
};

let processedData = []; 

// Hàm lấy dữ liệu từ API dựa trên loại cryptocurrency
async function fetchData(crypto) {
  try {
    const endpoint = `http://localhost:3001/api/bullbear?crypto=${crypto}`;
    const response = await fetch(endpoint);
    const data = await response.json();

    console.log(data);  // Kiểm tra dữ liệu trả về từ API

    processedData = data.map(row => {
      const ema13 = row.ema13;  // EMA(13) value
      const high = row.high;    // High value
      const low = row.low;      // Low value

      return {
        x: new Date(row.date),  // Chuyển đổi date thành kiểu Date
        y: ema13,               // Sử dụng giá trị 'close' để vẽ biểu đồ
        y2: low,
        y3: high,
        bullPower: high - ema13, // Bull Power = High - EMA(13)
        bearPower: low - ema13   // Bear Power = Low - EMA(13)
      };
    });

    // Sau khi dữ liệu được xử lý, gọi hàm để vẽ biểu đồ
    drawCharts();

  } catch (error) {
    console.error("Lỗi khi tải dữ liệu từ API:", error);
  }
}

// Hàm vẽ biểu đồ chung
function drawChart(title, dataKey, chartContainer, chartType = "lineWithBar") {
  const chartWidth = chartContainer.clientWidth;  // Lấy chiều rộng của container
  const chartHeight = chartContainer.clientHeight;      // Chiều cao theo tỷ lệ

  let marks;
  if (chartType === "lineWithBar") {
    // Biểu đồ kết hợp đường và thanh
    marks = [
      Plot.barY(processedData, {
        x: "x",
        y1: "y2",  
        y2: "y3",  
        fill: colors.positiveColor,
      }),
      Plot.line(processedData, { x: "x", y: dataKey, stroke: colors.negativeColor }),
      Plot.ruleY([0])
    ];
  } else if (chartType === "bar") {
    // Biểu đồ thanh
    marks = [
      Plot.barY(processedData, {
        x: "x",
        y: dataKey,
        fill: d => d[dataKey] >= 0 ? colors.positiveColor : colors.negativeColor,
      }),
      Plot.ruleY([0])
    ];
  }

  const chart = Plot.plot({
    title: title,
    width: chartWidth,  
    height: chartHeight, 
    marginBottom: 50,
    x: { 
      label: "Date", 
      tickFormat: d => d.toLocaleDateString(),
      tickPadding: 1,  
      tickCount: 6,   
    //   ticks: 10,
    //   tickRotate: -20, 
      labelOffset: 40,
    //   ticks: processedData.filter(d => new Date(d.x).getDate() % 4 === 0).map(d => new Date(d.x)),
    ticks: processedData
    .filter((_, index) => index % Math.floor(processedData.length / 10) === 0) // Chỉ giữ 10 tick cách đều
    .slice(0, 15) // Đảm bảo không vượt quá 10 tick
    .map(d => new Date(d.x)),
      grid: showGrid,  // Hiển thị lưới cho trục X nếu showGrid là true
    },
    y: { 
      label: title,
      domain: [Math.min(...processedData.map(d => d[dataKey])) - Math.max(...processedData.map(d => d[dataKey])) / 10, 
              Math.max(...processedData.map(d => d[dataKey])) + Math.max(...processedData.map(d => d[dataKey])) / 10],
      labelAngle: -45, 
      tickFormat: d => {
        if (d >= 10000) {
          return (d / 1000).toFixed(0) + 'k'; 
        } else if (d < 10000 & d >= 1000) {
          return d.toFixed(0); 
        }
        return d.toFixed(2); 
      },
      grid: showGrid,  // Hiển thị lưới cho trục Y nếu showGrid là true
    },
    marks: marks, // Dùng mảng `marks` đã định nghĩa ở trên
  });

  // Render chart vào container tương ứng
  chartContainer.innerHTML = "";
  chartContainer.appendChild(chart);
}

// Hàm vẽ tất cả các biểu đồ
function drawCharts() {
  const emaChartContainer = document.getElementById("ema-chart-container");
  const bullChartContainer = document.getElementById("bull-chart-container");
  const bearChartContainer = document.getElementById("bear-chart-container");

  // Vẽ biểu đồ EMA, Bull Power và Bear Power
  if (emaChartContainer && bullChartContainer && bearChartContainer) {
    drawChart("EMA13", "y", emaChartContainer, "lineWithBar");     // EMA: kết hợp đường và thanh
    drawChart("Bull Power", "bullPower", bullChartContainer, "bar");  // Bull Power: biểu đồ thanh
    drawChart("Bear Power", "bearPower", bearChartContainer, "bar");  // Bear Power: biểu đồ thanh
  }
}

fetchData('BTC');



```

<div class="chart-wrapper" style="display: flex; flex-direction: column; gap: 0.2rem;">
  <div>Bull Bear chart for Bitcoin</div>
  <div id="ema-chart-container" class="chart-container"></div>
  <div id="bear-chart-container" class="chart-container"></div>
  <div id="bull-chart-container" class="chart-container"></div>
</div>  

<style>
.chart-container {
  width: 100%; /* Độ rộng đầy đủ của container */
  aspect-ratio: 7 / 2; /* Tỷ lệ chiều rộng và chiều cao */
  margin-top: 0; /* Loại bỏ khoảng cách */
  margin-bottom: 0;
}
</style>




