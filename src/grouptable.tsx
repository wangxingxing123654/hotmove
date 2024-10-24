import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const ChangesDefind = {

    1: { name: "顶级买单", color: "price_up", direction: 1, pair: 2, id: 1, type: 'sl' },

    2: { name: "顶级卖单", color: "price_down", direction: -1, pair: 1, id: 2, type: 'sl' },

    4: { name: "封涨停板", color: "price_up", direction: 1, pair: 8, id: 4, type: 'price' },

    8: { name: "封跌停板", color: "price_down", direction: -1, pair: 4, id: 8, type: 'price' },

    16: { name: "打开涨停板", color: "price_down", direction: -1, pair: 32, id: 16, type: 'price' },

    32: { name: "打开跌停板", color: "price_up", direction: 1, pair: 16, id: 32, type: 'price' },

    64: { name: "有大买盘", color: "price_up", direction: 1, pair: 128, id: 64, type: 'sl' },

    128: { name: "有大卖盘", color: "price_down", direction: -1, pair: 64, id: 128, type: 'sl' },

    256: { name: "机构买单", color: "price_up", direction: 1, pair: 512, id: 256, type: 'sl' },

    512: { name: "机构卖单", color: "price_down", direction: -1, pair: 256, id: 512, type: 'sl' },

    8193: { name: "大笔买入", color: "price_up", direction: 1, pair: 8194, id: 8193, type: 'sl' },

    8194: { name: "大笔卖出", color: "price_down", direction: -1, pair: 8193, id: 8194, type: 'sl' },

    8195: { name: "拖拉机买", color: "price_up", direction: 1, pair: 8196, id: 8195, type: 'sl' },

    8196: { name: "拖拉机卖", color: "price_down", direction: -1, pair: 8195, id: 8196, type: 'sl' },

    8201: { name: "火箭发射", color: "price_up", direction: 1, pair: 8204, id: 8201, type: 'change' },

    8202: { name: "快速反弹", color: "price_up", direction: 1, pair: 8203, id: 8202, type: 'change' },

    8203: { name: "高台跳水", color: "price_down", direction: -1, pair: 8202, id: 8203, type: 'change' },

    8204: { name: "加速下跌", color: "price_down", direction: -1, pair: 8201, id: 8204, type: 'change' },

    8205: { name: "买入撤单", color: "price_down", direction: -1, pair: 8026, id: 8205, type: 'sl' },

    8206: { name: "卖出撤单", color: "price_up", direction: 1, pair: 8205, id: 8206, type: 'sl' },

    8207: { name: "竞价上涨", color: "price_up", direction: 1, pair: 8208, id: 8207, type: 'change' },

    8208: { name: "竞价下跌", color: "price_down", direction: -1, pair: 8207, id: 8208, type: 'change' },

    8209: { name: "高开5日线", color: "price_up", direction: 1, pair: 8210, id: 8209, type: 'change' },

    8210: { name: "低开5日线", color: "price_down", direction: -1, pair: 8209, id: 8210, type: 'change' },

    8211: { name: "向上缺口", color: "price_up", direction: 1, pair: 8212, id: 8211, type: 'change' },

    8212: { name: "向下缺口", color: "price_down", direction: -1, pair: 8211, id: 8212, type: 'change' },

    8213: { name: "60日新高", color: "price_up", direction: 1, pair: 8214, id: 8213, type: 'price' },

    8214: { name: "60日新低", color: "price_down", direction: -1, pair: 8213, id: 8214, type: 'price' },

    8215: { name: "60日大幅上涨", color: "price_up", direction: 1, pair: 8216, id: 8215, type: 'change' },

    8216: { name: "60日大幅下跌", color: "price_down", direction: -1, pair: 8215, id: 8216, type: 'change' }

}

const formatTime = (timeStamp: number) => {
  const hours = Math.floor(timeStamp / 10000);
  const minutes = Math.floor((timeStamp % 10000) / 100);
  const seconds = timeStamp % 100;
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

const parseData = (data) => {
  return data.map((group) => ({
    key: group.change_id,
    change_id: group.change_id,
    name: ChangesDefind[group.change_id]?.name || '未知',
    colorClass: ChangesDefind[group.change_id]?.color || '',
    sum: group.sum,
    times: group.times,
    bigBuyCount: group.list.filter(item => item.change_id === 8193).length,
    rocketLaunchCount: group.list.filter(item => item.change_id === 8201).length,
    combinedCount: group.list.filter(item => [8193, 8201].includes(item.change_id)).length,
    largeOrderCount: group.list.filter(item => item.cjl >= 10000).length,
    details: group.list.map((item) => ({
      key: item.change_id,
      time: item.time,
      info: item.info,
      price: item.price,
      zdf: item.zdf,
      cjl: item.cjl,
    })),
  }));
};

const GroupedTable = ({ data }) => {
  const parsedData = parseData(data);

  return (
    <div className="space-y-4">
      {parsedData.map((record) => (
        <div key={record.key} className="rounded-lg border">
          <div className="p-4 bg-muted">
            <div className={`text-lg font-semibold ${record.colorClass}`}>
              {record.name}
            </div>
            <div className="text-sm text-muted-foreground">
              Sum: {record.sum} | Times: {record.times}
            </div>
          </div>
          
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Time</TableHead>
                <TableHead>Info</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>ZDF</TableHead>
                <TableHead>成交量</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {record.details.map((detail, idx) => (
                <TableRow key={`${detail.key}-${idx}`}>
                  <TableCell>{formatTime(detail.time)}</TableCell>
                  <TableCell>{detail.info}</TableCell>
                  <TableCell>{detail.price}</TableCell>
                  <TableCell>{detail.zdf}</TableCell>
                  <TableCell>
                    <span className={
                      detail.cjl > 10000
                        ? "text-red-500"
                        : detail.cjl >= 5000
                        ? "text-purple-500"
                        : ""
                    }>
                      {detail.cjl}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ))}
    </div>
  );
};

export default GroupedTable;