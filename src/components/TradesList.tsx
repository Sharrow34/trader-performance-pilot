import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Filter, TrendingUp, TrendingDown, Edit, Trash2 } from 'lucide-react';
import { Trade } from './TradingJournal';

interface TradesListProps {
  trades: Trade[];
  onEditTrade: (trade: Trade) => void;
  onDeleteTrade: (tradeId: string) => void;
}

export const TradesList: React.FC<TradesListProps> = ({ trades, onEditTrade, onDeleteTrade }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [strategyFilter, setStrategyFilter] = useState<string>('all');

  const filteredTrades = trades.filter(trade => {
    const matchesSearch = trade.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (trade.notes?.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (trade.strategy?.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStrategy = strategyFilter === 'all' || trade.strategy === strategyFilter;
    
    return matchesSearch && matchesStrategy;
  });

  const uniqueStrategies = Array.from(new Set(trades.map(t => t.strategy).filter(Boolean)));

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const getActionBadgeVariant = (action: string) => {
    return action === 'buy' ? 'default' : 'secondary';
  };

  const getPnLColor = (pnl: number) => {
    return pnl >= 0 ? 'text-profit' : 'text-loss';
  };

  return (
    <Card className="animate-fade-in hover-lift transition-normal">
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Trade History
          </CardTitle>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search trades..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 w-full sm:w-64 transition-normal"
              />
            </div>
            <Select value={strategyFilter} onValueChange={setStrategyFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Strategy" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Strategies</SelectItem>
                {uniqueStrategies.map(strategy => (
                  <SelectItem key={strategy} value={strategy!}>
                    {strategy}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Symbol</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Entry Price</TableHead>
                <TableHead>Exit Price</TableHead>
                <TableHead>Entry Date</TableHead>
                <TableHead>Exit Date</TableHead>
                <TableHead>P&L</TableHead>
                <TableHead>Strategy</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTrades.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                    No trades found matching your criteria
                  </TableCell>
                </TableRow>
              ) : (
                filteredTrades.map((trade) => (
                  <TableRow key={trade.id} className="hover:bg-muted/50 transition-fast">
                    <TableCell className="font-medium">{trade.symbol}</TableCell>
                    <TableCell>
                      <Badge variant={getActionBadgeVariant(trade.action)}>
                        {trade.action.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell>{trade.quantity.toLocaleString()}</TableCell>
                    <TableCell>{formatCurrency(trade.entryPrice)}</TableCell>
                    <TableCell>{formatCurrency(trade.exitPrice)}</TableCell>
                    <TableCell>{formatDate(trade.entryDate)}</TableCell>
                    <TableCell>{formatDate(trade.exitDate)}</TableCell>
                    <TableCell className={getPnLColor(trade.pnl)}>
                      <div className="flex items-center gap-1">
                        {trade.pnl >= 0 ? (
                          <TrendingUp className="h-4 w-4" />
                        ) : (
                          <TrendingDown className="h-4 w-4" />
                        )}
                        {formatCurrency(trade.pnl)}
                      </div>
                    </TableCell>
                    <TableCell>
                      {trade.strategy && (
                        <Badge variant="outline">{trade.strategy}</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onEditTrade(trade)}
                          className="hover-scale transition-normal"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onDeleteTrade(trade.id)}
                          className="hover-scale transition-normal text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        
        {filteredTrades.length > 0 && (
          <div className="mt-4 text-sm text-muted-foreground">
            Showing {filteredTrades.length} of {trades.length} trades
          </div>
        )}
      </CardContent>
    </Card>
  );
};