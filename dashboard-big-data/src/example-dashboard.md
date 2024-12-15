
---
theme: dashboard
title: Example dashboard
toc: false
---

# Rocket launches 🚀

<!-- Load and transform the data -->

```js
const launches = FileAttachment("data/launches.csv").csv({typed: true});
```

<!-- A shared color scale for consistency, sorted by the number of launches -->

```js
const color = Plot.scale({
  color: {
    type: "categorical",
    domain: d3.groupSort(launches, (D) => -D.length, (d) => d.state).filter((d) => d !== "Other"),
    unknown: "var(--theme-foreground-muted)"
  }
});
```

<!-- Cards with big numbers -->

<div class="grid grid-cols-4">
  <div class="card">
    <h2>United States 🇺🇸</h2>
    <span class="big">${launches.filter((d) => d.stateId === "US").length.toLocaleString("en-US")}</span>
  </div>
  <div class="card">
    <h2>Russia 🇷🇺 <span class="muted">/ Soviet Union</span></h2>
    <span class="big">${launches.filter((d) => d.stateId === "SU" || d.stateId === "RU").length.toLocaleString("en-US")}</span>
  </div>
  <div class="card">
    <h2>China 🇨🇳</h2>
    <span class="big">${launches.filter((d) => d.stateId === "CN").length.toLocaleString("en-US")}</span>
  </div>
  <div class="card">
    <h2>Other</h2>
    <span class="big">${launches.filter((d) => d.stateId !== "US" && d.stateId !== "SU" && d.stateId !== "RU" && d.stateId !== "CN").length.toLocaleString("en-US")}</span>
  </div>
</div>

<!-- Plot of launch history -->

```js
function launchTimeline(data, {width} = {}) {
  return Plot.plot({
    title: "Launches over the years",
    width,
    height: 300,
    y: {grid: true, label: "Launches"},
    color: {...color, legend: true},
    marks: [
      Plot.rectY(data, Plot.binX({y: "count"}, {x: "date", fill: "state", interval: "year", tip: true})),
      Plot.ruleY([0])
    ]
  });
}
```

<div class="grid grid-cols-1">
  <div class="card">
    ${resize((width) => launchTimeline(launches, {width}))}
  </div>
</div>




<!-- Plot of launch vehicles -->

```js
function vehicleChart(data, {width}) {
  return Plot.plot({
    title: "Popular launch vehicles",
    width,
    height: 300,
    marginTop: 0,
    marginLeft: 50,
    x: {grid: true, label: "Launches"},
    y: {label: null},
    color: {...color, legend: true},
    marks: [
      Plot.rectX(data, Plot.groupY({x: "count"}, {y: "family", fill: "state", tip: true, sort: {y: "-x"}})),
      Plot.ruleX([0])
    ]
  });
}
```

<div class="grid grid-cols-1">
  <div class="card">
    ${resize((width) => vehicleChart(launches, {width}))}
  </div>
</div>

Data: Jonathan C. McDowell, [General Catalog of Artificial Space Objects](https://planet4589.org/space/gcat)


<!-- Plot of bar chart -->

```js

async function fetchData(crypto) {
  try {
    const dataResponse = await fetch(`http://localhost:3001/api/data?crypto=${crypto}`);
    const emaResponse = await fetch(`http://localhost:3001/api/ema_pre?crypto=${crypto}`);

    const data = await dataResponse.json();
    const emaData = await emaResponse.json();

    console.log(data);
    return data

    // Define processedData inside the function
    const processedData = data.map((row) => {
      const emaRow = emaData.find((ema) => ema.DATE === row.DATE);
      return {
        x: new Date(row.DATE),
        high: row.high,
        low: row.low,
        ema13: emaRow ? emaRow.ema13 : null,
      };
    });

    return processedData; // Return processed data
  } catch (error) {
    console.error("Error fetching data:", error);
  }
}

function vehicleChart2(launches, {width}) {
  return Plot.plot({
    title: "Launches over the years",
    width,
    height: 300,
    marks: [
      Plot.barY(, {
        x: "species",
        y: "body_mass_g",
        fill: "#55ac3e",
        tip: true
      }),
      Plot.ruleY([0])
    ]
  })
}


```


<div class="card">
  ${resize((width) => Plot.barX([9, 4, 8, 1, 11, 3, 4, 2, 7, 5]).plot({width}))}
</div>

<div class="card">
  ${resize((width) => vehicleChart2(launches, {width}))}
</div>

<div class="card">
  ${resize((width) => Plot.barY([9, 4, 8, 1, 11, 3, 4, 2, 7, 5]).plot({width}))}
</div>


<style>


</style>