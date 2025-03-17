import { useRef, useEffect, useMemo, useState, useLayoutEffect } from 'react';
import { useLoaderData } from 'react-router';
import * as d3 from 'd3';

export async function loader() {
  const response = await fetch('http://localhost:3000/data');
  const { data } = await response.json();

  return data.map(([date, value]: [string, number]) => [new Date(date), value]);
}

const formatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});

export default function HomePage() {
  const data = useLoaderData();
  const chartHeight = 800;
  const [chartWidth, setChartWidth] = useState(1200);

  useLayoutEffect(() => {
    const onResize = () => setChartWidth(window.innerWidth * 0.8);

    onResize();

    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const padding = 60;

  const gx = useRef<SVGGElement | null>(null);
  const gy = useRef<SVGGElement | null>(null);
  const graph = useRef(null);
  const tooltipRef = useRef(null);

  const xScale = useMemo(
    () =>
      d3
        .scaleTime()
        .domain([d3.min(data, ([d]) => d), d3.max(data, ([d]) => d)])
        .range([padding, chartWidth - padding]),
    [data, padding, chartWidth]
  );

  const yScale = useMemo(
    () =>
      d3
        .scaleLinear()
        .domain([0, d3.max(data, ([, d]) => d)])
        .range([chartHeight - padding, padding]),
    [data, padding]
  );

  useEffect(() => {
    if (gx.current) d3.select(gx.current).call(d3.axisBottom(xScale));
  }, [gx, xScale]);

  useEffect(() => {
    if (gy.current) d3.select(gy.current).call(d3.axisLeft(yScale));
  }, [gy, yScale]);

  useEffect(() => {
    const tooltip = d3.select(tooltipRef.current);
    const barWidth = (chartWidth - 2 * padding) / data.length;

    const bars: any = d3.select(graph.current).selectAll('rect').data(data);

    bars
      .enter()
      .append('rect')
      .merge(bars)
      .attr('x', ([d]: any) => xScale(d))
      .attr('y', ([, d]: any) => yScale(d))
      .attr('index', (d: unknown, i: number) => i)
      .attr('width', barWidth)
      .attr('height', ([, d]: any) => chartHeight - yScale(d) - padding)
      .on('mouseover.overlay', (event: MouseEvent) =>
        d3.select(event.target as Element).attr('fill', 'red')
      )
      .on('mouseout.overlay', (event: MouseEvent) =>
        d3.select(event.target as Element).attr('fill', 'black')
      )
      .on('mouseover.tooltip', () => tooltip.classed('hidden', false))
      .on('mousemove.tooltip', (event: MouseEvent) => {
        const target = event.target as Element;
        const index = target.getAttribute('index');
        const x = target.getAttribute('x');
        const y = target.getAttribute('y');

        if (!index || !x || !y) return;

        const [time, value] = data[index];
        const tooltipLabel = `${time.getFullYear()} Q${
          Math.floor(time.getMonth() / 3) + 1
        } - ${formatter.format(value)} Billion`;

        const tooltipY = +y;
        const tooltipX = +x + 4 * barWidth;

        tooltip
          .style('top', `calc(${tooltipY}px - 5em)`)
          .style('left', `${tooltipX}px`)
          .text(tooltipLabel);
      })
      .on('mouseout.tooltip', () => tooltip.classed('hidden', true));

    bars.exit().remove();
  }, [data, chartWidth, xScale, yScale]);

  return (
    <div className='flex justify-center h-screen relative'>
      <div
        ref={tooltipRef}
        className='absolute hidden p-4 bg-black/80 text-white z-2 border-2'
      />

      <svg
        height={chartHeight}
        width={chartWidth}
        style={{ position: 'relative' }}
      >
        <g ref={gx} transform={`translate(0, ${chartHeight - padding})`} />
        <g ref={gy} transform={`translate(${padding}, 0)`} />
        <g ref={graph} />
        <text
          x={-chartHeight / 4}
          y={(3 / 2) * padding}
          transform={`rotate(-90)`}
          textAnchor='middle'
        >
          Gross Domestic Product
        </text>
        <text x={(3 * chartWidth) / 7} y={chartHeight - padding / 4}>
          More information at http://www.bea.gov/national/pdf/nipaguid.pdf
        </text>
      </svg>
    </div>
  );
}
