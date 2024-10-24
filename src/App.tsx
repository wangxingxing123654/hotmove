import { useState, useEffect, useRef } from 'react';
import GroupedTable from './grouptable';
import { Button } from '@/components/ui/button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import './App.css';

function App() {
  const [dataSource, setDataSource] = useState([]);
  const [originalDataSource, setOriginalDataSource] = useState([]);
  const [hot, setHot] = useState([]);
  const [count, setCount] = useState(0);
  const hasFetchedData = useRef(false);

  const goToWeb = (stock) => {
    const stockCode = stock.code;
    const url = `https://quote.eastmoney.com/changes/stocks/${stockCode}.html`;
    const cls_url = `https://www.cls.cn/stock?code=${stockCode}`;

    const openFirstUrl = () => {
      window.open(url, '_blank');
    };

    const openSecondUrl = () => {
      window.open(cls_url, '_blank');
    };

    setTimeout(openFirstUrl, 1000);
    setTimeout(openSecondUrl, 3000);
  };

  const resetDataSource = () => {
    setDataSource(originalDataSource);
  };

  const sortDataSource = (key) => {
    const sortedData = [...originalDataSource].sort((a, b) => {
      const num = Number(b[key] - a[key]);
      return num || 0;
    });
    setDataSource(sortedData);
  };

  const sortFunctions = {
    多空差值: () => sortDataSource('difference'),
    万手大单买入次数: () => sortDataSource('largeOrderCount'),
    大笔买入次数: () => sortDataSource('bigBuyCount'),
    火箭发射次数: () => sortDataSource('rocketLaunchCount'),
    '火箭发射次数+大笔买入次数': () => sortDataSource('combinedCount'),
  };

  const fetchHotData = async () => {
    try {
      const response = await fetch('https://zlala.top/api/hot');
      if (!response.ok) {
        throw new Error('Network response was not ok.');
      }
      const data = await response.json();
      setHot(data);
    } catch (error) {
      console.error(
        'There has been a problem with your fetch operation:',
        error
      );
    } finally {
      hasFetchedData.current = false;
    }
  };

  const manualUpdateRank = async () => {
    window.open('https://guba.eastmoney.com/rank/', '_blank');
  };

  const manualUpdate = () => {
    setCount((prev) => prev + 1);
  };

  const patchOpenWeb = () => {
    const codesPerBatch = 5;
    const totalBatches = Math.ceil(hot.length / codesPerBatch);

    const openNextBatch = (batch) => {
      if (batch >= totalBatches) return;

      const start = batch * codesPerBatch;
      const end = Math.min(start + codesPerBatch, hot.length);
      const openedWindows = [];

      for (let i = start; i < end; i++) {
        const stock = hot[i];
        const stockCode = stock.code;
        const url = `https://quote.eastmoney.com/changes/stocks/${stockCode}.html`;
        openedWindows.push(window.open(url, '_blank'));
      }

      setTimeout(() => {
        openedWindows.forEach((win) => {
          if (win) {
            win.close();
          }
        });
        openNextBatch(batch + 1);
      }, 5000);
    };

    openNextBatch(0);
  };

  const fetchHotMoveData = async () => {
    try {
      const response = await fetch('https://zlala.top/api/hotmove');
      if (!response.ok) {
        throw new Error('Network response was not ok.');
      }
      const data = await response.json();
      const sortedDataSource = hot.map((hotItem) => {
        const foundStock = data.find((item) => item.id === hotItem.code);
        return foundStock
          ? {
              ...foundStock,
              code: hotItem.code,
              name: hotItem.name,
              percent: hotItem.percent,
            }
          : {
              code: hotItem.code,
              name: hotItem.name,
              percent: hotItem.percent,
            };
      });
      setDataSource(sortedDataSource);
      setOriginalDataSource(sortedDataSource);
    } catch (error) {
      console.error(
        'There has been a problem with your fetch operation:',
        error
      );
    } finally {
      hasFetchedData.current = false;
    }
  };

  useEffect(() => {
    if (!dataSource || dataSource.length === 0) {
      fetchHotData();
    }
  }, [dataSource]);

  useEffect(() => {
    fetchHotMoveData();
  }, [hot, count]);

  const StockDetail = ({ details }) => {
    return <GroupedTable data={details} />;
  };

  const StockInfo = ({ stock }) => {
    const multiDetails =
      stock.detail?.filter((detail) => detail.direction === 1) ?? [];
    const shortDetails =
      stock.detail?.filter((detail) => detail.direction === -1) ?? [];
    const { bearishVolume, bullishVolume } = stock;

    const calculateTotalListLength = (data) => {
      let totalLength = 0;
      data.forEach((group) => {
        if (Array.isArray(group.list)) {
          totalLength += group.list.length;
        }
      });
      return totalLength;
    };

    return (
      <div className="space-y-4">
        <div className="flex gap-4 overflow-x-auto pb-4">
          {multiDetails.length > 0 && (
            <Card className="min-w-[300px]">
              <CardHeader>
                <CardTitle>
                  多单异动分布 {bullishVolume}(
                  {calculateTotalListLength(multiDetails)})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <StockDetail details={multiDetails} />
              </CardContent>
            </Card>
          )}

          {shortDetails.length > 0 && (
            <Card className="min-w-[300px]">
              <CardHeader>
                <CardTitle>
                  空单异动分布 {bearishVolume}(
                  {calculateTotalListLength(shortDetails)})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <StockDetail details={shortDetails} />
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="App">
      <div className="stock">
        {dataSource &&
          dataSource.length > 0 &&
          dataSource.map((stock, index) => (
            <Accordion type="single" collapsible key={`${stock.code}_${index}`}>
              <AccordionItem value={stock.code}>
                <AccordionTrigger className="px-4">
                  <div className="text-left">
                    <div>
                      {stock.name} {stock.code}
                    </div>
                    <div>涨跌幅: {stock?.percent?.toFixed(2)}</div>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      <div>
                        大笔买入次数:{' '}
                        <span
                          className={`px-2 py-1 rounded ${
                            stock.bigBuyCount > 3
                              ? 'bg-red-500'
                              : 'bg-green-500'
                          } text-white`}
                        >
                          {stock.bigBuyCount}
                        </span>
                      </div>
                      <div>
                        火箭发射次数:{' '}
                        <span
                          className={`px-2 py-1 rounded ${
                            stock.rocketLaunchCount > 0
                              ? 'bg-red-500'
                              : 'bg-green-500'
                          } text-white`}
                        >
                          {stock.rocketLaunchCount}
                        </span>
                      </div>
                      <div>
                        万手单成交次数:{' '}
                        <span
                          className={`px-2 py-1 rounded ${
                            stock.largeOrderCount > 0
                              ? 'bg-red-500'
                              : 'bg-green-500'
                          } text-white`}
                        >
                          {stock.largeOrderCount}
                        </span>
                      </div>
                      <div>大笔买入+火箭发射次数: {stock.combinedCount}</div>
                      <div>大多单量: {stock.bullishVolume ?? 0}</div>
                      <div>大空单量: {stock.bearishVolume ?? 0}</div>
                      <div>
                        多空差值:{' '}
                        <span
                          className={`px-2 py-1 rounded ${
                            stock.difference > 0 ? 'bg-red-500' : 'bg-green-500'
                          } text-white`}
                        >
                          {stock.difference}
                        </span>
                      </div>
                    </div>
                    <Button
                      className="mt-4"
                      onClick={(e) => {
                        e.stopPropagation();
                        goToWeb(stock);
                      }}
                    >
                      去网站看看
                    </Button>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4">
                  <StockInfo stock={stock} />
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          ))}
      </div>

      <div className="floating-ball">
        排序
        <div className="button-list">
          <button onClick={manualUpdateRank}>获取最新排行榜数据</button>
          <button onClick={manualUpdate}>获取最新异动数据</button>
          <button onClick={patchOpenWeb}>批量发送异动数据</button>
          <Separator className="my-2" />
          {Object.entries(sortFunctions).map(([label, fn]) => (
            <button key={label} onClick={fn}>
              按{label}排序
            </button>
          ))}
          <button onClick={resetDataSource}>恢复原始顺序</button>
        </div>
      </div>
    </div>
  );
}

export default App;
