// ECharts 通用配置：统一配色与坐标轴风格（与设计系统一致）
export const C = {
  brand: '#4a9e6e',
  brandDark: '#3a8559',
  blue: '#5b8fd6',
  orange: '#e8935a',
  gold: '#e0a85a',
  purple: '#9b7ec4',
  muted: '#829189',
  ink: '#2b3a32',
  line: '#e6ede7',
}

const AXIS_LABEL = { fontSize: 10, color: C.muted }
const AXIS_LINE = { lineStyle: { color: C.line } }
const SPLIT_LINE = { lineStyle: { color: '#eef2ee' } }

/** 环形图（预算 / 分类占比），中心可显示两行文字 */
export function donutOption({ data, centerTitle = '', centerValue = '' }) {
  return {
    tooltip: {
      trigger: 'item',
      formatter: (p) => `${p.name}：¥${Number(p.value).toLocaleString()}（${p.percent}%）`,
    },
    series: [
      {
        type: 'pie',
        radius: ['58%', '80%'],
        center: ['50%', '50%'],
        avoidLabelOverlap: false,
        label: {
          show: !!(centerTitle || centerValue),
          position: 'center',
          formatter: `{v|${centerValue}}\n{t|${centerTitle}}`,
          rich: {
            v: { fontSize: 16, fontWeight: 'bold', color: C.ink, lineHeight: 22 },
            t: { fontSize: 11, color: C.muted, lineHeight: 16 },
          },
        },
        emphasis: { scale: false },
        data: data.map((d) => ({
          value: d.value,
          name: d.name,
          itemStyle: { color: d.color },
        })),
      },
    ],
  }
}

/** 平滑面积折线图（月度趋势） */
export function lineOption({ labels, values, name = '花费' }) {
  return {
    grid: { left: 44, right: 14, top: 18, bottom: 24 },
    tooltip: { trigger: 'axis' },
    xAxis: { type: 'category', data: labels, axisLine: AXIS_LINE, axisTick: { show: false }, axisLabel: AXIS_LABEL },
    yAxis: { type: 'value', splitLine: SPLIT_LINE, axisLabel: AXIS_LABEL },
    series: [
      {
        name,
        type: 'line',
        smooth: true,
        data: values,
        lineStyle: { color: C.brand, width: 2.5 },
        itemStyle: { color: C.brand },
        symbol: 'circle',
        symbolSize: 6,
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(74,158,110,0.25)' },
              { offset: 1, color: 'rgba(74,158,110,0)' },
            ],
          },
        },
      },
    ],
  }
}

/** 柱状图（年度对比 / 月度花费），可叠加一条折线（双轴） */
export function comboOption({ labels, bars, line, barName = '花费', lineName = '次数' }) {
  const series = [
    {
      name: barName,
      type: 'bar',
      data: bars,
      barMaxWidth: 18,
      itemStyle: { color: C.blue, borderRadius: [6, 6, 0, 0] },
    },
  ]
  const legend = { data: [barName], bottom: 0, itemWidth: 12, itemHeight: 8, textStyle: { fontSize: 10, color: C.muted } }
  if (line) {
    series[0].yAxisIndex = 0
    series.push({
      name: lineName,
      type: 'line',
      data: line,
      yAxisIndex: 1,
      smooth: true,
      lineStyle: { color: C.brand, width: 2 },
      itemStyle: { color: C.brand },
      symbol: 'circle',
      symbolSize: 5,
    })
    legend.data.push(lineName)
  }
  return {
    grid: { left: 44, right: line ? 40 : 14, top: 18, bottom: 30 },
    tooltip: { trigger: 'axis' },
    legend,
    xAxis: { type: 'category', data: labels, axisLine: AXIS_LINE, axisTick: { show: false }, axisLabel: AXIS_LABEL },
    yAxis: [
      { type: 'value', splitLine: SPLIT_LINE, axisLabel: AXIS_LABEL },
      ...(line ? [{ type: 'value', splitLine: { show: false }, axisLabel: AXIS_LABEL }] : []),
    ],
    series,
  }
}

/** 地理散点（足迹地图） */
export function geoScatterOption({ points }) {
  return {
    tooltip: {
      trigger: 'item',
      formatter: (p) => `${p.name} · 到访 ${p.value[2]} 次`,
    },
    geo: {
      map: 'china',
      roam: false,
      zoom: 1.15,
      layoutCenter: ['50%', '52%'],
      layoutSize: '95%',
      itemStyle: { areaColor: '#e7f0e9', borderColor: '#ffffff', borderWidth: 1 },
      emphasis: { label: { show: false }, itemStyle: { areaColor: '#d8e8dc' } },
      select: { disabled: true },
    },
    series: [
      {
        name: '足迹',
        type: 'effectScatter',
        coordinateSystem: 'geo',
        data: points.map((p) => ({ name: p.name, value: [...p.coord, p.count] })),
        symbolSize: (val) => 8 + Math.min(val[2], 6) * 2.5,
        rippleEffect: { brushType: 'stroke', scale: 2.6 },
        itemStyle: { color: C.brand, shadowBlur: 6, shadowColor: 'rgba(74,158,110,0.5)' },
        label: {
          show: true,
          formatter: '{b}',
          position: 'right',
          fontSize: 10,
          color: '#4a5a52',
        },
        zlevel: 2,
      },
    ],
  }
}
