import React, { useState, useEffect } from 'react';
import { Download, Plus, Trash2, Calendar } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card } from '../ui/Card';
import { InvoiceData } from '../../types';

export const InvoiceGenerator: React.FC = () => {
  const [invoiceData, setInvoiceData] = useState<InvoiceData>({
    invoiceNumber: '',
    date: new Date().toISOString().split('T')[0],
    dueDate: '',
    from: {
      name: '',
      email: '',
      address: '',
      phone: '',
    },
    to: {
      name: '',
      email: '',
      address: '',
    },
    items: [],
    subtotal: 0,
    tax: 0,
    total: 0,
    notes: '',
  });

  // Auto-generate invoice number
  useEffect(() => {
    if (!invoiceData.invoiceNumber) {
      const invoiceNum = `INV-${Date.now().toString().slice(-6)}`;
      setInvoiceData(prev => ({ ...prev, invoiceNumber: invoiceNum }));
    }
  }, []);

  // Auto-calculate due date (30 days from invoice date)
  useEffect(() => {
    if (invoiceData.date && !invoiceData.dueDate) {
      const dueDate = new Date(invoiceData.date);
      dueDate.setDate(dueDate.getDate() + 30);
      setInvoiceData(prev => ({ ...prev, dueDate: dueDate.toISOString().split('T')[0] }));
    }
  }, [invoiceData.date]);

  // Calculate totals
  useEffect(() => {
    const subtotal = invoiceData.items.reduce((sum, item) => sum + item.amount, 0);
    const tax = subtotal * 0.1; // 10% tax
    const total = subtotal + tax;
    
    setInvoiceData(prev => ({
      ...prev,
      subtotal,
      tax,
      total,
    }));
  }, [invoiceData.items]);

  const addItem = () => {
    const newItem = {
      id: crypto.randomUUID(),
      description: '',
      quantity: 1,
      rate: 0,
      amount: 0,
    };
    
    setInvoiceData({
      ...invoiceData,
      items: [...invoiceData.items, newItem],
    });
  };

  const updateItem = (id: string, field: string, value: any) => {
    setInvoiceData({
      ...invoiceData,
      items: invoiceData.items.map(item => {
        if (item.id === id) {
          const updatedItem = { ...item, [field]: value };
          if (field === 'quantity' || field === 'rate') {
            updatedItem.amount = updatedItem.quantity * updatedItem.rate;
          }
          return updatedItem;
        }
        return item;
      }),
    });
  };

  const removeItem = (id: string) => {
    setInvoiceData({
      ...invoiceData,
      items: invoiceData.items.filter(item => item.id !== id),
    });
  };

  const exportInvoice = () => {
    const invoiceHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Invoice ${invoiceData.invoiceNumber}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 40px; color: #333; }
          .invoice-header { display: flex; justify-content: space-between; align-items: start; margin-bottom: 40px; }
          .invoice-title { font-size: 36px; font-weight: bold; color: #14b8a6; }
          .invoice-number { font-size: 18px; color: #666; margin-top: 10px; }
          .addresses { display: flex; justify-content: space-between; margin-bottom: 40px; }
          .address-block { width: 45%; }
          .address-title { font-weight: bold; color: #14b8a6; margin-bottom: 10px; }
          .items-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
          .items-table th, .items-table td { padding: 12px; text-align: left; border-bottom: 1px solid #eee; }
          .items-table th { background: #f8f9fa; font-weight: bold; color: #14b8a6; }
          .items-table .amount { text-align: right; }
          .totals { width: 300px; margin-left: auto; }
          .total-row { display: flex; justify-content: space-between; padding: 8px 0; }
          .total-row.final { font-weight: bold; font-size: 18px; border-top: 2px solid #14b8a6; padding-top: 12px; color: #14b8a6; }
          .notes { margin-top: 40px; padding: 20px; background: #f8f9fa; border-radius: 8px; }
          .notes-title { font-weight: bold; margin-bottom: 10px; }
        </style>
      </head>
      <body>
        <div class="invoice-header">
          <div>
            <div class="invoice-title">INVOICE</div>
            <div class="invoice-number">#${invoiceData.invoiceNumber}</div>
          </div>
          <div style="text-align: right;">
            <div><strong>Date:</strong> ${new Date(invoiceData.date).toLocaleDateString()}</div>
            <div><strong>Due Date:</strong> ${new Date(invoiceData.dueDate).toLocaleDateString()}</div>
          </div>
        </div>

        <div class="addresses">
          <div class="address-block">
            <div class="address-title">From:</div>
            <div><strong>${invoiceData.from.name}</strong></div>
            <div>${invoiceData.from.email}</div>
            <div>${invoiceData.from.phone}</div>
            <div>${invoiceData.from.address}</div>
          </div>
          <div class="address-block">
            <div class="address-title">To:</div>
            <div><strong>${invoiceData.to.name}</strong></div>
            <div>${invoiceData.to.email}</div>
            <div>${invoiceData.to.address}</div>
          </div>
        </div>

        <table class="items-table">
          <thead>
            <tr>
              <th>Description</th>
              <th>Qty</th>
              <th>Rate</th>
              <th class="amount">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${invoiceData.items.map(item => `
              <tr>
                <td>${item.description}</td>
                <td>${item.quantity}</td>
                <td>$${item.rate.toFixed(2)}</td>
                <td class="amount">$${item.amount.toFixed(2)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="totals">
          <div class="total-row">
            <span>Subtotal:</span>
            <span>$${invoiceData.subtotal.toFixed(2)}</span>
          </div>
          <div class="total-row">
            <span>Tax (10%):</span>
            <span>$${invoiceData.tax.toFixed(2)}</span>
          </div>
          <div class="total-row final">
            <span>Total:</span>
            <span>$${invoiceData.total.toFixed(2)}</span>
          </div>
        </div>

        ${invoiceData.notes ? `
        <div class="notes">
          <div class="notes-title">Notes:</div>
          <div>${invoiceData.notes}</div>
        </div>
        ` : ''}
      </body>
      </html>
    `;

    const blob = new Blob([invoiceHTML], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Invoice-${invoiceData.invoiceNumber}.html`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Invoice Generator</h2>
        <Button onClick={exportInvoice}>
          <Download size={16} className="mr-2" />
          Export Invoice
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form */}
        <div className="space-y-6">
          {/* Invoice Details */}
          <Card padding="md">
            <div className="flex items-center space-x-2 mb-4">
              <Calendar size={20} className="text-turquoise-500" />
              <h3 className="font-semibold text-slate-900 dark:text-slate-100">Invoice Details</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Invoice Number"
                value={invoiceData.invoiceNumber}
                onChange={(e) => setInvoiceData({ ...invoiceData, invoiceNumber: e.target.value })}
              />
              <Input
                label="Invoice Date"
                type="date"
                value={invoiceData.date}
                onChange={(e) => setInvoiceData({ ...invoiceData, date: e.target.value })}
              />
              <Input
                label="Due Date"
                type="date"
                value={invoiceData.dueDate}
                onChange={(e) => setInvoiceData({ ...invoiceData, dueDate: e.target.value })}
              />
            </div>
          </Card>

          {/* From Address */}
          <Card padding="md">
            <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">From (Your Details)</h3>
            <div className="space-y-4">
              <Input
                label="Name/Company"
                value={invoiceData.from.name}
                onChange={(e) => setInvoiceData({
                  ...invoiceData,
                  from: { ...invoiceData.from, name: e.target.value }
                })}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Email"
                  type="email"
                  value={invoiceData.from.email}
                  onChange={(e) => setInvoiceData({
                    ...invoiceData,
                    from: { ...invoiceData.from, email: e.target.value }
                  })}
                />
                <Input
                  label="Phone"
                  value={invoiceData.from.phone}
                  onChange={(e) => setInvoiceData({
                    ...invoiceData,
                    from: { ...invoiceData.from, phone: e.target.value }
                  })}
                />
              </div>
              <div className="space-y-1">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Address
                </label>
                <textarea
                  value={invoiceData.from.address}
                  onChange={(e) => setInvoiceData({
                    ...invoiceData,
                    from: { ...invoiceData.from, address: e.target.value }
                  })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-turquoise-500 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-100"
                  rows={3}
                  placeholder="Your business address"
                />
              </div>
            </div>
          </Card>

          {/* To Address */}
          <Card padding="md">
            <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">Bill To (Client Details)</h3>
            <div className="space-y-4">
              <Input
                label="Client Name/Company"
                value={invoiceData.to.name}
                onChange={(e) => setInvoiceData({
                  ...invoiceData,
                  to: { ...invoiceData.to, name: e.target.value }
                })}
              />
              <Input
                label="Email"
                type="email"
                value={invoiceData.to.email}
                onChange={(e) => setInvoiceData({
                  ...invoiceData,
                  to: { ...invoiceData.to, email: e.target.value }
                })}
              />
              <div className="space-y-1">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Address
                </label>
                <textarea
                  value={invoiceData.to.address}
                  onChange={(e) => setInvoiceData({
                    ...invoiceData,
                    to: { ...invoiceData.to, address: e.target.value }
                  })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-turquoise-500 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-100"
                  rows={3}
                  placeholder="Client address"
                />
              </div>
            </div>
          </Card>

          {/* Items */}
          <Card padding="md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-900 dark:text-slate-100">Items</h3>
              <Button variant="outline" size="sm" onClick={addItem}>
                <Plus size={16} className="mr-2" />
                Add Item
              </Button>
            </div>
            <div className="space-y-4">
              {invoiceData.items.map((item) => (
                <div key={item.id} className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg">
                  <div className="flex justify-between items-start mb-3">
                    <h4 className="font-medium text-slate-900 dark:text-slate-100">Item</h4>
                    <Button variant="ghost" size="sm" onClick={() => removeItem(item.id)}>
                      <Trash2 size={16} />
                    </Button>
                  </div>
                  <div className="space-y-3">
                    <Input
                      label="Description"
                      value={item.description}
                      onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                      placeholder="Item description"
                    />
                    <div className="grid grid-cols-3 gap-3">
                      <Input
                        label="Quantity"
                        type="number"
                        value={item.quantity}
                        onChange={(e) => updateItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                      />
                      <Input
                        label="Rate ($)"
                        type="number"
                        step="0.01"
                        value={item.rate}
                        onChange={(e) => updateItem(item.id, 'rate', parseFloat(e.target.value) || 0)}
                      />
                      <Input
                        label="Amount ($)"
                        value={item.amount.toFixed(2)}
                        readOnly
                        className="bg-slate-50 dark:bg-slate-800"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Notes */}
          <Card padding="md">
            <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">Notes</h3>
            <textarea
              value={invoiceData.notes}
              onChange={(e) => setInvoiceData({ ...invoiceData, notes: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-turquoise-500 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-100"
              rows={3}
              placeholder="Payment terms, thank you note, etc..."
            />
          </Card>
        </div>

        {/* Preview */}
        <div className="sticky top-6">
          <Card padding="md">
            <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">Preview</h3>
            <div className="bg-white dark:bg-slate-800 p-6 rounded-lg border border-slate-200 dark:border-slate-700 text-sm max-h-[800px] overflow-y-auto">
              {/* Header */}
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h1 className="text-3xl font-bold text-turquoise-600 dark:text-turquoise-400">INVOICE</h1>
                  <div className="text-slate-600 dark:text-slate-400 mt-2">#{invoiceData.invoiceNumber}</div>
                </div>
                <div className="text-right text-slate-700 dark:text-slate-300">
                  <div><strong>Date:</strong> {new Date(invoiceData.date).toLocaleDateString()}</div>
                  <div><strong>Due Date:</strong> {new Date(invoiceData.dueDate).toLocaleDateString()}</div>
                </div>
              </div>

              {/* Addresses */}
              <div className="grid grid-cols-2 gap-8 mb-8">
                <div>
                  <div className="font-semibold text-turquoise-600 dark:text-turquoise-400 mb-2">From:</div>
                  <div className="text-slate-700 dark:text-slate-300">
                    <div className="font-semibold">{invoiceData.from.name || 'Your Name'}</div>
                    <div>{invoiceData.from.email}</div>
                    <div>{invoiceData.from.phone}</div>
                    <div className="whitespace-pre-line">{invoiceData.from.address}</div>
                  </div>
                </div>
                <div>
                  <div className="font-semibold text-turquoise-600 dark:text-turquoise-400 mb-2">To:</div>
                  <div className="text-slate-700 dark:text-slate-300">
                    <div className="font-semibold">{invoiceData.to.name || 'Client Name'}</div>
                    <div>{invoiceData.to.email}</div>
                    <div className="whitespace-pre-line">{invoiceData.to.address}</div>
                  </div>
                </div>
              </div>

              {/* Items Table */}
              <div className="mb-6">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-700">
                      <th className="text-left p-3 font-semibold text-turquoise-600 dark:text-turquoise-400">Description</th>
                      <th className="text-center p-3 font-semibold text-turquoise-600 dark:text-turquoise-400">Qty</th>
                      <th className="text-right p-3 font-semibold text-turquoise-600 dark:text-turquoise-400">Rate</th>
                      <th className="text-right p-3 font-semibold text-turquoise-600 dark:text-turquoise-400">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoiceData.items.map((item) => (
                      <tr key={item.id} className="border-b border-slate-200 dark:border-slate-700">
                        <td className="p-3 text-slate-700 dark:text-slate-300">{item.description || 'Item description'}</td>
                        <td className="p-3 text-center text-slate-700 dark:text-slate-300">{item.quantity}</td>
                        <td className="p-3 text-right text-slate-700 dark:text-slate-300">${item.rate.toFixed(2)}</td>
                        <td className="p-3 text-right text-slate-700 dark:text-slate-300">${item.amount.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totals */}
              <div className="flex justify-end">
                <div className="w-64">
                  <div className="flex justify-between py-2 text-slate-700 dark:text-slate-300">
                    <span>Subtotal:</span>
                    <span>${invoiceData.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between py-2 text-slate-700 dark:text-slate-300">
                    <span>Tax (10%):</span>
                    <span>${invoiceData.tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between py-3 border-t-2 border-turquoise-500 font-bold text-lg text-turquoise-600 dark:text-turquoise-400">
                    <span>Total:</span>
                    <span>${invoiceData.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {invoiceData.notes && (
                <div className="mt-8 p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
                  <div className="font-semibold text-slate-900 dark:text-slate-100 mb-2">Notes:</div>
                  <div className="text-slate-700 dark:text-slate-300 whitespace-pre-line">{invoiceData.notes}</div>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};