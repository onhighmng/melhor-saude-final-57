'use client';

import React from 'react';
import {
  BarChart,
  LinearYAxis,
  LinearYAxisTickSeries,
  LinearYAxisTickLabel,
  LinearXAxis,
  LinearXAxisTickSeries,
  BarSeries,
  Bar,
  GridlineSeries,
  Gridline,
} from 'reaviz';
import { motion } from 'framer-motion';

// Data Definitions and Validation
interface ChartCategoryData {
  key: string;
  data: number | null;
}

const categoryDataRaw: ChartCategoryData[] = [
  { key: 'Saúde Mental', data: 145 },
  { key: 'Bem-Estar Físico', data: 98 },
  { key: 'Assist. Financeira', data: 123 },
  { key: 'Assist. Jurídica', data: 87 },
];

// Validate and prepare chart data
const validatedCategoryData = categoryDataRaw.map(item => ({
  ...item,
  data: (typeof item.data === 'number' && !isNaN(item.data)) ? item.data : 0,
}));

const chartColors = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6'];

interface MetricItem {
  id: string;
  iconSvg: JSX.Element;
  label: string;
  value: string;
  trendIconSvg: JSX.Element;
  delay: number;
}

const metrics: MetricItem[] = [
  {
    id: 'totalViews',
    iconSvg: (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M10 3.33337C5.83333 3.33337 2.275 6.07504 1 10C2.275 13.925 5.83333 16.6667 10 16.6667C14.1667 16.6667 17.725 13.925 19 10C17.725 6.07504 14.1667 3.33337 10 3.33337ZM10 14.1667C7.70833 14.1667 5.83333 12.2917 5.83333 10C5.83333 7.70837 7.70833 5.83337 10 5.83337C12.2917 5.83337 14.1667 7.70837 14.1667 10C14.1667 12.2917 12.2917 14.1667 10 14.1667ZM10 7.50004C8.61667 7.50004 7.5 8.61671 7.5 10C7.5 11.3834 8.61667 12.5 10 12.5C11.3833 12.5 12.5 11.3834 12.5 10C12.5 8.61671 11.3833 7.50004 10 7.50004Z" fill="#3B82F6" />
      </svg>
    ),
    label: 'Total de Visualizações',
    value: '453',
    trendIconSvg: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="28" height="28" rx="14" fill="#40E5D1" fillOpacity="0.4" />
        <path d="M18.4987 15.3889L13.9987 19.8334M13.9987 19.8334L9.49866 15.3889M13.9987 19.8334V8.16671" stroke="#40E5D1" strokeWidth="2" strokeLinecap="square" />
      </svg>
    ),
    delay: 0,
  },
  {
    id: 'avgEngagement',
    iconSvg: (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M10 1.66663C5.40511 1.66663 1.66675 5.40499 1.66675 9.99996C1.66675 14.5949 5.40511 18.3333 10.0001 18.3333C14.5951 18.3333 18.3334 14.5949 18.3334 9.99996C18.3334 5.40499 14.5951 1.66663 10 1.66663ZM10 2.91663C13.9195 2.91663 17.0834 6.08054 17.0834 9.99996C17.0834 13.9194 13.9195 17.0833 10 17.0833C6.08066 17.0833 2.91675 13.9194 2.91675 9.99996C2.91675 6.08054 6.08066 2.91663 10 2.91663ZM6.66675 7.08329C6.20651 7.08329 5.83341 7.45639 5.83341 7.91663C5.83341 8.37687 6.20651 8.74996 6.66675 8.74996C7.12699 8.74996 7.50008 8.37687 7.50008 7.91663C7.50008 7.45639 7.12699 7.08329 6.66675 7.08329ZM13.3334 7.08329C12.8732 7.08329 12.5001 7.45639 12.5001 7.91663C12.5001 8.37687 12.8732 8.74996 13.3334 8.74996C13.7937 8.74996 14.1667 8.37687 14.1667 7.91663C14.1667 7.45639 13.7937 7.08329 13.3334 7.08329ZM5.83341 11.25C5.60309 11.25 5.41675 11.4363 5.41675 11.6666C5.41675 13.9704 7.27957 15.8333 9.58341 15.8333H10.4167C12.7206 15.8333 14.5834 13.9704 14.5834 11.6666C14.5834 11.4363 14.3971 11.25 14.1667 11.25H5.83341Z" fill="#10B981" />
      </svg>
    ),
    label: 'Taxa de Engajamento',
    value: '68%',
    trendIconSvg: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="28" height="28" rx="14" fill="#40E5D1" fillOpacity="0.4" />
        <path d="M18.4987 15.3889L13.9987 19.8334M13.9987 19.8334L9.49866 15.3889M13.9987 19.8334V8.16671" stroke="#40E5D1" strokeWidth="2" strokeLinecap="square" />
      </svg>
    ),
    delay: 0.05,
  },
  {
    id: 'mostViewed',
    iconSvg: (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M10 2.5L12.245 7.08333L17.5 7.83333L13.75 11.4583L14.49 16.6667L10 14.2917L5.51 16.6667L6.25 11.4583L2.5 7.83333L7.755 7.08333L10 2.5Z" fill="#F59E0B" />
      </svg>
    ),
    label: 'Pilar Mais Visualizado',
    value: 'Mental',
    trendIconSvg: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="28" height="28" rx="14" fill="#40E5D1" fillOpacity="0.4" />
        <path d="M18.4987 15.3889L13.9987 19.8334M13.9987 19.8334L9.49866 15.3889M13.9987 19.8334V8.16671" stroke="#40E5D1" strokeWidth="2" strokeLinecap="square" />
      </svg>
    ),
    delay: 0.1,
  },
];

interface ResourceUsageCardProps {
  // Props can be added here for customization
}

function ResourceUsageCard({}: ResourceUsageCardProps): JSX.Element {
  return (
    <div className="flex flex-col pt-4 pb-4 bg-white dark:bg-gray-800 rounded-3xl shadow-lg w-full max-w-[500px] overflow-hidden transition-colors duration-300">
      <h3 className="text-3xl text-left p-7 pt-6 pb-8 font-bold text-foreground">
        Uso de Recursos por Pilar
      </h3>
      <div className="flex-grow px-4 h-[200px]">
        <BarChart
          id="horizontal-resource-usage-chart"
          height={200}
          data={validatedCategoryData}
          yAxis={
            <LinearYAxis
              type="category"
              tickSeries={
                <LinearYAxisTickSeries
                  label={
                    <LinearYAxisTickLabel
                      format={(text: string) => (text.length > 12 ? `${text.slice(0, 12)}...` : text)}
                      fill="#9A9AAF"
                    />
                  }
                />
              }
            />
          }
          xAxis={
            <LinearXAxis
              type="value"
              axisLine={null}
              tickSeries={
                <LinearXAxisTickSeries
                  label={null}
                  line={null}
                  tickSize={10}
                />
              }
            />
          }
          series={
            <BarSeries
              layout="horizontal"
              bar={
                <Bar
                  glow={{
                    blur: 20,
                    opacity: 0.5,
                  }}
                  gradient={null}
                />
              }
              colorScheme={chartColors}
              padding={0.2}
            />
          }
          gridlines={
            <GridlineSeries
              line={<Gridline strokeColor="#7E7E8F75" />}
            />
          }
        />
      </div>
      <div className="flex flex-col pl-8 pr-8 pt-8 font-mono divide-y divide-border">
        {metrics.map(metric => (
          <motion.div
            key={metric.id}
            initial={{
              opacity: 0,
              y: 20,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              delay: metric.delay,
            }}
            className="flex w-full pb-4 pt-4 items-center gap-2"
          >
            <div className="flex flex-row gap-2 items-center text-base w-1/2 text-muted-foreground">
              {metric.iconSvg}
              <span className="truncate" title={metric.label}>
                {metric.label}
              </span>
            </div>
            <div className="flex gap-2 w-1/2 justify-end items-center">
              <span className="font-semibold text-xl text-foreground">{metric.value}</span>
              {metric.trendIconSvg}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export default ResourceUsageCard;
