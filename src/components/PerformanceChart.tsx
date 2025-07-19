import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { Trade } from './TradingJournal';

interface PerformanceChartProps {
  trades: Trade[];
}

export const PerformanceChart: React.FC<PerformanceChartProps> = ({ trades }) => {
  // Create cumulative P&L data
  const cumulativePnLData = trades
    .sort((a, b) => new Date(a.exitDate!).getTime() - new Date(b.exitDate!).getTime())
    .reduce((acc, trade, index) => {
      const cumulative = index === 0 ? trade.pnl! : acc[index - 1].cumulative + trade.pnl!;
      acc.push({
        date: trade.exitDate!,
        pnl: trade.pnl!,
        cumulative: cumulative,
        trade: trade.symbol,
      });
      return acc;
    }, [] as any[]);

  // Monthly P&L data
  const monthlyData = trades.reduce((acc, trade) => {
    if (!trade.exitDate || !trade.pnl) return acc;
    
    const date = new Date(trade.exitDate);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    
    if (!acc[monthKey]) {
      acc[monthKey] = { month: monthKey, pnl: 0, trades: 0 };
    }
    
    acc[monthKey].pnl += trade.pnl;
    acc[monthKey].trades += 1;
    
    return acc;
  }, {} as Record<string, any>);

  const monthlyChartData = Object.values(monthlyData).sort((a: any, b: any) => a.month.localeCompare(b.month));

  // Win/Loss pie chart data
  const winningTrades = trades.filter(trade => trade.pnl && trade.pnl > 0);
  const losingTrades = trades.filter(trade => trade.pnl && trade.pnl < 0);
  
  const pieData = [
    { name: 'Winning Trades', value: winningTrades.length, color: 'hsl(var(--profit))' },
    { name: 'Losing Trades', value: losingTrades.length, color: 'hsl(var(--loss))' },
  ];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border rounded-lg p-3 shadow-lg">
          <p className="text-sm text-muted-foreground mb-1">{formatDate(label)}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm font-medium">
              <span style={{ color: entry.color }}>
                {entry.dataKey === 'cumulative' ? 'Total: ' : 'Trade: '}
                {formatCurrency(entry.value)}
              </span>
            </p>
          ))}
          {payload[0]?.payload?.trade && (
            <p className="text-sm text-muted-foreground">
              {payload[0].payload.trade}
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  if (trades.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Performance Chart</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            No closed trades to display
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cumulative P&L Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Cumulative P&L</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={cumulativePnLData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="date" 
                tickFormatter={formatDate}
                stroke="hsl(var(--muted-foreground))"
              />
              <YAxis 
                tickFormatter={formatCurrency}
                stroke="hsl(var(--muted-foreground))"
              />
              <Tooltip content={<CustomTooltip />} />
              <Line 
                type="monotone" 
                dataKey="cumulative" 
                stroke="hsl(var(--chart-primary))" 
                strokeWidth={2}
                dot={{ fill: 'hsl(var(--chart-primary))', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, fill: 'hsl(var(--chart-primary))' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Monthly P&L Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={monthlyChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="month" 
                  stroke="hsl(var(--muted-foreground))"
                />
                <YAxis 
                  tickFormatter={formatCurrency}
                  stroke="hsl(var(--muted-foreground))"
                />
                <Tooltip 
                  formatter={(value: number) => [formatCurrency(value), 'P&L']}
                  labelFormatter={(label) => `Month: ${label}`}
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
                <Bar 
                  dataKey="pnl" 
                  fill="hsl(var(--chart-primary))"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Win/Loss Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Win Rate Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={2}
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number) => [value, 'Trades']}
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};