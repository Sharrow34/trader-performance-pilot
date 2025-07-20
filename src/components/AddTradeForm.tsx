import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { X, Plus } from 'lucide-react';
import { Trade } from './TradingJournal';

interface AddTradeFormProps {
  onSubmit: (trade: Omit<Trade, 'id'>) => void;
  onCancel: () => void;
  trade?: Trade;
  isEditing?: boolean;
}

export const AddTradeForm: React.FC<AddTradeFormProps> = ({ onSubmit, onCancel, trade, isEditing = false }) => {
  const [formData, setFormData] = useState({
    symbol: trade?.symbol || '',
    action: trade?.action || 'buy' as 'buy' | 'sell',
    quantity: trade?.quantity?.toString() || '',
    entryPrice: trade?.entryPrice?.toString() || '',
    exitPrice: trade?.exitPrice?.toString() || '',
    entryDate: trade?.entryDate || '',
    exitDate: trade?.exitDate || '',
    strategy: trade?.strategy || '',
    notes: trade?.notes || '',
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const trade: Omit<Trade, 'id'> = {
      symbol: formData.symbol.toUpperCase(),
      action: formData.action,
      quantity: parseInt(formData.quantity),
      entryPrice: parseFloat(formData.entryPrice),
      exitPrice: parseFloat(formData.exitPrice),
      entryDate: formData.entryDate,
      exitDate: formData.exitDate,
      strategy: formData.strategy || undefined,
      notes: formData.notes || undefined,
      pnl: 0
    };

    // Calculate P&L
    if (trade.action === 'buy') {
      trade.pnl = (trade.exitPrice - trade.entryPrice) * trade.quantity;
    } else {
      trade.pnl = (trade.entryPrice - trade.exitPrice) * trade.quantity;
    }

    onSubmit(trade);
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-scale-in transition-normal hover-lift">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{isEditing ? 'Edit Trade' : 'Add New Trade'}</CardTitle>
            <Button variant="ghost" size="sm" onClick={onCancel}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="symbol">Symbol</Label>
                <Input
                  id="symbol"
                  value={formData.symbol}
                  onChange={(e) => handleInputChange('symbol', e.target.value)}
                  placeholder="AAPL"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="action">Action</Label>
                <Select value={formData.action} onValueChange={(value) => handleInputChange('action', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="buy">Buy</SelectItem>
                    <SelectItem value="sell">Sell</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity</Label>
                <Input
                  id="quantity"
                  type="number"
                  value={formData.quantity}
                  onChange={(e) => handleInputChange('quantity', e.target.value)}
                  placeholder="100"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="entryPrice">Entry Price</Label>
                <Input
                  id="entryPrice"
                  type="number"
                  step="0.01"
                  value={formData.entryPrice}
                  onChange={(e) => handleInputChange('entryPrice', e.target.value)}
                  placeholder="150.25"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="entryDate">Entry Date</Label>
                <Input
                  id="entryDate"
                  type="date"
                  value={formData.entryDate}
                  onChange={(e) => handleInputChange('entryDate', e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="exitPrice">Exit Price</Label>
                <Input
                  id="exitPrice"
                  type="number"
                  step="0.01"
                  value={formData.exitPrice}
                  onChange={(e) => handleInputChange('exitPrice', e.target.value)}
                  placeholder="155.50"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="exitDate">Exit Date</Label>
              <Input
                id="exitDate"
                type="date"
                value={formData.exitDate}
                onChange={(e) => handleInputChange('exitDate', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="strategy">Strategy</Label>
              <Input
                id="strategy"
                value={formData.strategy}
                onChange={(e) => handleInputChange('strategy', e.target.value)}
                placeholder="Swing Trading, Day Trade, etc."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="Trade rationale, market conditions, lessons learned..."
                rows={3}
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit" className="flex-1">
                {isEditing ? 'Update Trade' : 'Add Trade'}
              </Button>
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};