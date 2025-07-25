import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, TrendingUp, TrendingDown, Target, DollarSign, Download, Upload } from 'lucide-react';
import { AddTradeForm } from './AddTradeForm';
import { TradesList } from './TradesList';
import { PerformanceChart } from './PerformanceChart';

export interface Trade {
  id: string;
  symbol: string;
  action: 'buy' | 'sell';
  quantity: number;
  entryPrice: number;
  exitPrice: number;
  entryDate: string;
  exitDate: string;
  pnl: number;
  strategy?: string;
  notes?: string;
}

const sampleTrades: Trade[] = [
  {
    id: '1',
    symbol: 'AAPL',
    action: 'buy',
    quantity: 100,
    entryPrice: 150.25,
    exitPrice: 155.50,
    entryDate: '2024-01-15',
    exitDate: '2024-01-18',
    pnl: 525,
    strategy: 'Swing Trading',
    notes: 'Strong earnings expected, bought on pullback'
  },
  {
    id: '2',
    symbol: 'TSLA',
    action: 'buy',
    quantity: 50,
    entryPrice: 200.00,
    exitPrice: 195.75,
    entryDate: '2024-01-20',
    exitDate: '2024-01-22',
    pnl: -212.50,
    strategy: 'Momentum',
    notes: 'Stopped out on market weakness'
  },
  {
    id: '3',
    symbol: 'MSFT',
    action: 'buy',
    quantity: 75,
    entryPrice: 380.50,
    exitPrice: 385.75,
    entryDate: '2024-01-25',
    exitDate: '2024-01-28',
    pnl: 393.75,
    strategy: 'Long Term',
    notes: 'Strong cloud growth prospects'
  },
  {
    id: '4',
    symbol: 'NVDA',
    action: 'buy',
    quantity: 25,
    entryPrice: 720.00,
    exitPrice: 745.50,
    entryDate: '2024-02-01',
    exitDate: '2024-02-05',
    pnl: 637.50,
    strategy: 'AI Play',
    notes: 'AI momentum trade'
  }
];

export const TradingJournal: React.FC = () => {
  const [trades, setTrades] = useState<Trade[]>(sampleTrades);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingTrade, setEditingTrade] = useState<Trade | null>(null);

  const addTrade = (newTrade: Omit<Trade, 'id'>) => {
    const trade: Trade = {
      ...newTrade,
      id: Date.now().toString(),
    };
    setTrades([trade, ...trades]);
    setShowAddForm(false);
  };

  const updateTrade = (updatedTrade: Omit<Trade, 'id'>) => {
    if (editingTrade) {
      setTrades(trades.map(trade => 
        trade.id === editingTrade.id 
          ? { ...updatedTrade, id: editingTrade.id }
          : trade
      ));
      setEditingTrade(null);
    }
  };

  const deleteTrade = (tradeId: string) => {
    setTrades(trades.filter(trade => trade.id !== tradeId));
  };

  const exportTrades = () => {
    const dataStr = JSON.stringify(trades, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `trading-journal-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const importTrades = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importedTrades = JSON.parse(e.target?.result as string);
          if (Array.isArray(importedTrades)) {
            setTrades(importedTrades);
          } else {
            alert('Invalid JSON format');
          }
        } catch (error) {
          alert('Error reading file');
        }
      };
      reader.readAsText(file);
    }
    // Reset input
    event.target.value = '';
  };

  const totalPnL = trades.reduce((sum, trade) => sum + trade.pnl, 0);
  const winningTrades = trades.filter(trade => trade.pnl > 0);
  const losingTrades = trades.filter(trade => trade.pnl < 0);
  const winRate = trades.length > 0 ? (winningTrades.length / trades.length) * 100 : 0;
  const avgWin = winningTrades.length > 0 ? winningTrades.reduce((sum, trade) => sum + trade.pnl, 0) / winningTrades.length : 0;
  const avgLoss = losingTrades.length > 0 ? losingTrades.reduce((sum, trade) => sum + trade.pnl, 0) / losingTrades.length : 0;

  return (
    <div className="min-h-screen bg-background p-6 animate-fade-in">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center animate-slide-up">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Trading Journal</h1>
            <p className="text-muted-foreground">Track and analyze your trading performance</p>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="file"
              accept=".json"
              onChange={importTrades}
              className="hidden"
              id="import-file"
            />
            <Button
              variant="outline"
              onClick={() => document.getElementById('import-file')?.click()}
              className="flex items-center gap-2 hover-lift transition-normal"
            >
              <Upload className="h-4 w-4" />
              Import
            </Button>
            <Button
              variant="outline"
              onClick={exportTrades}
              className="flex items-center gap-2 hover-lift transition-normal"
            >
              <Download className="h-4 w-4" />
              Export
            </Button>
            <Button onClick={() => setShowAddForm(true)} className="flex items-center gap-2 hover-lift transition-normal">
              <Plus className="h-4 w-4" />
              Add Trade
            </Button>
          </div>
        </div>

        {/* Performance Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 stagger-animation">
          <Card className="hover-lift animate-scale-in transition-normal" style={{"--i": 0} as React.CSSProperties}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total P&L</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold transition-normal ${totalPnL >= 0 ? 'text-profit' : 'text-loss'}`}>
                ${totalPnL.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground">
                {trades.length} trades completed
              </p>
            </CardContent>
          </Card>

          <Card className="hover-lift animate-scale-in transition-normal" style={{"--i": 1} as React.CSSProperties}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Win Rate</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground transition-normal">
                {winRate.toFixed(1)}%
              </div>
              <p className="text-xs text-muted-foreground">
                {winningTrades.length}W / {losingTrades.length}L
              </p>
            </CardContent>
          </Card>

          <Card className="hover-lift animate-scale-in transition-normal" style={{"--i": 2} as React.CSSProperties}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Win</CardTitle>
              <TrendingUp className="h-4 w-4 text-profit" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-profit transition-normal">
                ${avgWin.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground">
                Per winning trade
              </p>
            </CardContent>
          </Card>

          <Card className="hover-lift animate-scale-in transition-normal" style={{"--i": 3} as React.CSSProperties}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Loss</CardTitle>
              <TrendingDown className="h-4 w-4 text-loss" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-loss transition-normal">
                ${avgLoss.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground">
                Per losing trade
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="trades" className="space-y-4 animate-slide-up">
          <TabsList className="transition-normal">
            <TabsTrigger value="trades" className="transition-fast">Trades</TabsTrigger>
            <TabsTrigger value="analytics" className="transition-fast">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="trades" className="space-y-4 animate-fade-in">
            <TradesList 
              trades={trades} 
              onEditTrade={setEditingTrade}
              onDeleteTrade={deleteTrade}
            />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4 animate-fade-in">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <PerformanceChart trades={trades} />
              <Card className="hover-lift transition-normal">
                <CardHeader>
                  <CardTitle>Strategy Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Array.from(new Set(trades.map(t => t.strategy).filter(Boolean))).map(strategy => {
                      const strategyTrades = trades.filter(t => t.strategy === strategy);
                      const strategyPnL = strategyTrades.reduce((sum, trade) => sum + trade.pnl, 0);
                      const strategyWinRate = strategyTrades.length > 0 ? 
                        (strategyTrades.filter(t => t.pnl > 0).length / strategyTrades.length) * 100 : 0;
                      
                      return (
                        <div key={strategy} className="flex items-center justify-between p-3 border rounded-lg hover-scale transition-normal">
                          <div>
                            <Badge variant="outline">{strategy}</Badge>
                            <p className="text-sm text-muted-foreground mt-1">
                              {strategyTrades.length} trades • {strategyWinRate.toFixed(1)}% win rate
                            </p>
                          </div>
                          <div className={`text-lg font-semibold transition-normal ${strategyPnL >= 0 ? 'text-profit' : 'text-loss'}`}>
                            ${strategyPnL.toFixed(2)}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Add Trade Modal */}
        {showAddForm && (
          <AddTradeForm 
            onSubmit={addTrade}
            onCancel={() => setShowAddForm(false)}
          />
        )}

        {/* Edit Trade Modal */}
        {editingTrade && (
          <AddTradeForm 
            trade={editingTrade}
            onSubmit={updateTrade}
            onCancel={() => setEditingTrade(null)}
            isEditing
          />
        )}
      </div>
    </div>
  );
};