import React, { useState, useEffect } from 'react';
import { Download, Plus, Trash2, Calendar, Save, Eye, Copy, Settings, FileText, Image, Mail } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card } from '../ui/Card';
import { useAppStore } from '../../stores/useAppStore';
import { useToast } from '../../hooks/useToast';

interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
  taxable: boolean;
}

interface TaxRate {
  id: string;
  name: string;
  rate: number;
  enabled: boolean;
}

interface InvoiceData {
  invoiceNumber: string;
  date: string;
  dueDate: string;
  poNumber: string;
  from: {
    name: string;
    email: string;
    address: string;
    phone: string;
    website: string;
    logo?: string;
  };
  to: {
    name: string;
    email: string;
    address: string;
    phone: string;
  };
  items: InvoiceItem[];
  taxRates: TaxRate[];
  subtotal: number;
  totalTax: number;
  discount: number;
  discountType: 'percentage' | 'fixed';
  shipping: number;
  total: number;
  notes: string;
  terms: string;
  currency: string;
  template: 'modern' | 'classic' | 'minimal' | 'professional';
  paymentInstructions: string;
}

const CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
];

const DEFAULT_TAX_RATES: TaxRate[] = [
  { id: '1', name: 'Sales Tax', rate: 8.5, enabled: true },
  { id: '2', name: 'VAT', rate: 20, enabled: false },
  { id: '3', name: 'GST', rate: 10, enabled: false },
];

export const InvoiceGenerator: React.FC = () => {
  const [invoiceData, setInvoiceData] = useState<InvoiceData>({
    invoiceNumber: '',
    date: new Date().toISOString().split('T')[0],
    dueDate: '',
    poNumber: '',
    from: {
      name: '',
      email: '',
      address: '',
      phone: '',
      website: '',
    },
    to: {
      name: '',
      email: '',
      address: '',
      phone: '',
    },
    items: [],
    taxRates: DEFAULT_TAX_RATES,
    subtotal: 0,
    totalTax: 0,
    discount: 0,
    discountType: 'percentage',
    shipping: 0,
    total: 0,
    notes: '',
    terms: 'Payment is due within 30 days of invoice date. Late payments may incur a 1.5% monthly service charge.',
    currency: 'USD',
    template: 'modern',
    paymentInstructions: 'Please include invoice number with payment.',
  });

  const [showSettings, setShowSettings] = useState(false);
  const [savedInvoices, setSavedInvoices] = useState<InvoiceData[]>([]);
  const { saveProject } = useAppStore();
  const { toast } = useToast();

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
    
    // Calculate tax
    let totalTax = 0;
    invoiceData.taxRates.forEach(taxRate => {
      if (taxRate.enabled) {
        const taxableAmount = invoiceData.items
          .filter(item => item.taxable)
          .reduce((sum, item) => sum + item.amount, 0);
        totalTax += (taxableAmount * taxRate.rate) / 100;
      }
    });

    // Calculate discount
    let discountAmount = 0;
    if (invoiceData.discount > 0) {
      if (invoiceData.discountType === 'percentage') {
        discountAmount = (subtotal * invoiceData.discount) / 100;
      } else {
        discountAmount = invoiceData.discount;
      }
    }

    const total = subtotal - discountAmount + totalTax + invoiceData.shipping;
    
    setInvoiceData(prev => ({
      ...prev,
      subtotal,
      totalTax,
      total: Math.max(0, total),
    }));
  }, [invoiceData.items, invoiceData.taxRates, invoiceData.discount, invoiceData.discountType, invoiceData.shipping]);

  const getCurrencySymbol = () => {
    return CURRENCIES.find(c => c.code === invoiceData.currency)?.symbol || '$';
  };

  const addItem = () => {
    const newItem: InvoiceItem = {
      id: crypto.randomUUID(),
      description: '',
      quantity: 1,
      rate: 0,
      amount: 0,
      taxable: true,
    };
    
    setInvoiceData({
      ...invoiceData,
      items: [...invoiceData.items, newItem],
    });
  };

  const updateItem = (id: string, field: keyof InvoiceItem, value: any) => {
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

  const updateTaxRate = (id: string, field: keyof TaxRate, value: any) => {
    setInvoiceData({
      ...invoiceData,
      taxRates: invoiceData.taxRates.map(tax => 
        tax.id === id ? { ...tax, [field]: value } : tax
      ),
    });
  };

  const addTaxRate = () => {
    const newTax: TaxRate = {
      id: crypto.randomUUID(),
      name: 'Custom Tax',
      rate: 0,
      enabled: false,
    };
    setInvoiceData({
      ...invoiceData,
      taxRates: [...invoiceData.taxRates, newTax],
    });
  };

  const removeTaxRate = (id: string) => {
    setInvoiceData({
      ...invoiceData,
      taxRates: invoiceData.taxRates.filter(tax => tax.id !== id),
    });
  };

  const saveInvoice = async () => {
    try {
      await saveProject({
        name: `Invoice ${invoiceData.invoiceNumber}`,
        tool: 'invoice-generator',
        data: invoiceData,
      });
      
      setSavedInvoices(prev => [...prev, invoiceData]);
      toast.success('Invoice Saved', 'Your invoice has been saved successfully');
    } catch (error) {
      toast.error('Save Failed', 'Could not save invoice');
    }
  };

  const duplicateInvoice = () => {
    const newInvoiceNumber = `INV-${Date.now().toString().slice(-6)}`;
    const newDate = new Date().toISOString().split('T')[0];
    const newDueDate = new Date();
    newDueDate.setDate(newDueDate.getDate() + 30);
    
    setInvoiceData({
      ...invoiceData,
      invoiceNumber: newInvoiceNumber,
      date: newDate,
      dueDate: newDueDate.toISOString().split('T')[0],
    });
    
    toast.success('Invoice Duplicated', 'Created a copy with new invoice number');
  };

  const getTemplateStyles = () => {
    const styles = {
      modern: {
        primaryColor: '#14b8a6',
        secondaryColor: '#0d9488',
        fontFamily: 'Inter, system-ui, sans-serif',
        headerBg: 'linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)',
      },
      classic: {
        primaryColor: '#1f2937',
        secondaryColor: '#374151',
        fontFamily: 'Georgia, serif',
        headerBg: '#1f2937',
      },
      minimal: {
        primaryColor: '#000000',
        secondaryColor: '#6b7280',
        fontFamily: 'Helvetica, Arial, sans-serif',
        headerBg: '#ffffff',
      },
      professional: {
        primaryColor: '#1e40af',
        secondaryColor: '#3b82f6',
        fontFamily: 'system-ui, sans-serif',
        headerBg: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
      },
    };
    return styles[invoiceData.template];
  };

  const exportInvoice = (format: 'html' | 'pdf' | 'csv') => {
    const styles = getTemplateStyles();
    const currencySymbol = getCurrencySymbol();
    
    if (format === 'csv') {
      // Export as CSV
      const csvContent = [
        ['Invoice Number', invoiceData.invoiceNumber],
        ['Date', invoiceData.date],
        ['Due Date', invoiceData.dueDate],
        ['From', invoiceData.from.name],
        ['To', invoiceData.to.name],
        [''],
        ['Description', 'Quantity', 'Rate', 'Amount', 'Taxable'],
        ...invoiceData.items.map(item => [
          item.description,
          item.quantity.toString(),
          `${currencySymbol}${item.rate.toFixed(2)}`,
          `${currencySymbol}${item.amount.toFixed(2)}`,
          item.taxable ? 'Yes' : 'No'
        ]),
        [''],
        ['Subtotal', `${currencySymbol}${invoiceData.subtotal.toFixed(2)}`],
        ['Tax', `${currencySymbol}${invoiceData.totalTax.toFixed(2)}`],
        ['Total', `${currencySymbol}${invoiceData.total.toFixed(2)}`],
      ].map(row => row.join(',')).join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Invoice-${invoiceData.invoiceNumber}.csv`;
      link.click();
      URL.revokeObjectURL(url);
      return;
    }

    const invoiceHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Invoice ${invoiceData.invoiceNumber}</title>
        <meta charset="UTF-8">
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { 
            font-family: ${styles.fontFamily}; 
            line-height: 1.6; 
            color: #333; 
            background: #f8f9fa;
            padding: 40px 20px;
          }
          .invoice-container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            border-radius: 12px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
            overflow: hidden;
          }
          .invoice-header { 
            background: ${styles.headerBg};
            color: white;
            padding: 40px;
            position: relative;
          }
          .invoice-header::after {
            content: '';
            position: absolute;
            bottom: -10px;
            left: 0;
            right: 0;
            height: 20px;
            background: linear-gradient(45deg, transparent 50%, white 50%);
          }
          .header-content {
            display: flex;
            justify-content: space-between;
            align-items: start;
            flex-wrap: wrap;
            gap: 20px;
          }
          .invoice-title { 
            font-size: 48px; 
            font-weight: bold; 
            margin-bottom: 10px;
            text-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }
          .invoice-number { 
            font-size: 18px; 
            opacity: 0.9;
            background: rgba(255,255,255,0.2);
            padding: 8px 16px;
            border-radius: 20px;
            display: inline-block;
          }
          .invoice-dates {
            text-align: right;
            background: rgba(255,255,255,0.1);
            padding: 20px;
            border-radius: 8px;
            backdrop-filter: blur(10px);
          }
          .invoice-body { padding: 40px; }
          .addresses { 
            display: grid; 
            grid-template-columns: 1fr 1fr; 
            gap: 40px; 
            margin-bottom: 40px; 
          }
          .address-block {
            padding: 20px;
            border-radius: 8px;
            border: 2px solid #f1f5f9;
          }
          .address-title { 
            font-weight: bold; 
            color: ${styles.primaryColor}; 
            margin-bottom: 15px; 
            font-size: 16px;
            text-transform: uppercase;
            letter-spacing: 1px;
          }
          .address-content { line-height: 1.8; }
          .items-table { 
            width: 100%; 
            border-collapse: collapse; 
            margin-bottom: 30px; 
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0,0,0,0.05);
          }
          .items-table th { 
            background: ${styles.primaryColor}; 
            color: white; 
            padding: 16px; 
            text-align: left; 
            font-weight: 600;
            text-transform: uppercase;
            font-size: 12px;
            letter-spacing: 1px;
          }
          .items-table td { 
            padding: 16px; 
            border-bottom: 1px solid #f1f5f9; 
          }
          .items-table tr:hover { background: #f8fafc; }
          .items-table .amount { text-align: right; font-weight: 600; }
          .totals-section {
            display: flex;
            justify-content: flex-end;
            margin-bottom: 40px;
          }
          .totals { 
            min-width: 350px;
            background: #f8fafc;
            border-radius: 8px;
            padding: 20px;
          }
          .total-row { 
            display: flex; 
            justify-content: space-between; 
            padding: 12px 0; 
            border-bottom: 1px solid #e2e8f0;
          }
          .total-row:last-child { border-bottom: none; }
          .total-row.final { 
            font-weight: bold; 
            font-size: 20px; 
            background: ${styles.primaryColor};
            color: white;
            margin: 10px -20px -20px -20px;
            padding: 20px;
            border-radius: 0 0 8px 8px;
          }
          .notes-section {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 30px;
            margin-top: 40px;
          }
          .notes, .terms, .payment-instructions { 
            padding: 20px; 
            background: #f8fafc; 
            border-radius: 8px; 
            border-left: 4px solid ${styles.primaryColor};
          }
          .notes-title { 
            font-weight: bold; 
            margin-bottom: 10px; 
            color: ${styles.primaryColor};
            text-transform: uppercase;
            font-size: 14px;
            letter-spacing: 1px;
          }
          .footer {
            text-align: center;
            padding: 30px;
            background: #f8fafc;
            color: #64748b;
            font-size: 14px;
          }
          @media print {
            body { background: white; padding: 0; }
            .invoice-container { box-shadow: none; }
          }
          @media (max-width: 768px) {
            .header-content { flex-direction: column; }
            .addresses { grid-template-columns: 1fr; gap: 20px; }
            .notes-section { grid-template-columns: 1fr; }
            .invoice-title { font-size: 36px; }
          }
        </style>
      </head>
      <body>
        <div class="invoice-container">
          <div class="invoice-header">
            <div class="header-content">
              <div>
                <div class="invoice-title">INVOICE</div>
                <div class="invoice-number">#${invoiceData.invoiceNumber}</div>
                ${invoiceData.poNumber ? `<div style="margin-top: 10px; opacity: 0.8;">PO: ${invoiceData.poNumber}</div>` : ''}
              </div>
              <div class="invoice-dates">
                <div style="margin-bottom: 10px;"><strong>Date:</strong> ${new Date(invoiceData.date).toLocaleDateString()}</div>
                <div><strong>Due Date:</strong> ${new Date(invoiceData.dueDate).toLocaleDateString()}</div>
              </div>
            </div>
          </div>

          <div class="invoice-body">
            <div class="addresses">
              <div class="address-block">
                <div class="address-title">From</div>
                <div class="address-content">
                  <div style="font-weight: bold; font-size: 18px; margin-bottom: 8px;">${invoiceData.from.name || 'Your Company'}</div>
                  ${invoiceData.from.email ? `<div>${invoiceData.from.email}</div>` : ''}
                  ${invoiceData.from.phone ? `<div>${invoiceData.from.phone}</div>` : ''}
                  ${invoiceData.from.website ? `<div>${invoiceData.from.website}</div>` : ''}
                  ${invoiceData.from.address ? `<div style="margin-top: 8px;">${invoiceData.from.address.replace(/\n/g, '<br>')}</div>` : ''}
                </div>
              </div>
              <div class="address-block">
                <div class="address-title">Bill To</div>
                <div class="address-content">
                  <div style="font-weight: bold; font-size: 18px; margin-bottom: 8px;">${invoiceData.to.name || 'Client Name'}</div>
                  ${invoiceData.to.email ? `<div>${invoiceData.to.email}</div>` : ''}
                  ${invoiceData.to.phone ? `<div>${invoiceData.to.phone}</div>` : ''}
                  ${invoiceData.to.address ? `<div style="margin-top: 8px;">${invoiceData.to.address.replace(/\n/g, '<br>')}</div>` : ''}
                </div>
              </div>
            </div>

            <table class="items-table">
              <thead>
                <tr>
                  <th>Description</th>
                  <th style="width: 80px;">Qty</th>
                  <th style="width: 100px;">Rate</th>
                  <th style="width: 100px;">Amount</th>
                  <th style="width: 80px;">Tax</th>
                </tr>
              </thead>
              <tbody>
                ${invoiceData.items.map(item => `
                  <tr>
                    <td>${item.description || 'Item description'}</td>
                    <td style="text-align: center;">${item.quantity}</td>
                    <td class="amount">${currencySymbol}${item.rate.toFixed(2)}</td>
                    <td class="amount">${currencySymbol}${item.amount.toFixed(2)}</td>
                    <td style="text-align: center;">${item.taxable ? '✓' : '—'}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>

            <div class="totals-section">
              <div class="totals">
                <div class="total-row">
                  <span>Subtotal:</span>
                  <span>${currencySymbol}${invoiceData.subtotal.toFixed(2)}</span>
                </div>
                ${invoiceData.discount > 0 ? `
                  <div class="total-row">
                    <span>Discount ${invoiceData.discountType === 'percentage' ? `(${invoiceData.discount}%)` : ''}:</span>
                    <span>-${currencySymbol}${(invoiceData.discountType === 'percentage' ? (invoiceData.subtotal * invoiceData.discount / 100) : invoiceData.discount).toFixed(2)}</span>
                  </div>
                ` : ''}
                ${invoiceData.taxRates.filter(tax => tax.enabled).map(tax => `
                  <div class="total-row">
                    <span>${tax.name} (${tax.rate}%):</span>
                    <span>${currencySymbol}${((invoiceData.items.filter(item => item.taxable).reduce((sum, item) => sum + item.amount, 0) * tax.rate) / 100).toFixed(2)}</span>
                  </div>
                `).join('')}
                ${invoiceData.shipping > 0 ? `
                  <div class="total-row">
                    <span>Shipping:</span>
                    <span>${currencySymbol}${invoiceData.shipping.toFixed(2)}</span>
                  </div>
                ` : ''}
                <div class="total-row final">
                  <span>Total (${invoiceData.currency}):</span>
                  <span>${currencySymbol}${invoiceData.total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div class="notes-section">
              ${invoiceData.notes ? `
                <div class="notes">
                  <div class="notes-title">Notes</div>
                  <div>${invoiceData.notes.replace(/\n/g, '<br>')}</div>
                </div>
              ` : ''}
              
              ${invoiceData.terms ? `
                <div class="terms">
                  <div class="notes-title">Terms & Conditions</div>
                  <div>${invoiceData.terms.replace(/\n/g, '<br>')}</div>
                </div>
              ` : ''}
              
              ${invoiceData.paymentInstructions ? `
                <div class="payment-instructions">
                  <div class="notes-title">Payment Instructions</div>
                  <div>${invoiceData.paymentInstructions.replace(/\n/g, '<br>')}</div>
                </div>
              ` : ''}
            </div>
          </div>

          <div class="footer">
            <p>Thank you for your business!</p>
            <p style="margin-top: 10px; font-size: 12px;">Generated by Creldesk Invoice Generator</p>
          </div>
        </div>
      </body>
      </html>
    `;

    if (format === 'pdf') {
      // For PDF, we'll create an HTML file that can be printed to PDF
      const blob = new Blob([invoiceHTML], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const printWindow = window.open(url);
      if (printWindow) {
        printWindow.onload = () => {
          setTimeout(() => {
            printWindow.print();
          }, 500);
        };
      }
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } else {
      // HTML export
      const blob = new Blob([invoiceHTML], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Invoice-${invoiceData.invoiceNumber}.html`;
      link.click();
      URL.revokeObjectURL(url);
    }

    toast.success('Invoice Exported', `Invoice exported as ${format.toUpperCase()}`);
  };

  const sendInvoiceEmail = () => {
    const subject = `Invoice ${invoiceData.invoiceNumber}`;
    const body = `Dear ${invoiceData.to.name},

Please find attached invoice ${invoiceData.invoiceNumber} for ${getCurrencySymbol()}${invoiceData.total.toFixed(2)}.

Due Date: ${new Date(invoiceData.dueDate).toLocaleDateString()}

${invoiceData.paymentInstructions}

Best regards,
${invoiceData.from.name}`;

    const mailtoLink = `mailto:${invoiceData.to.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(mailtoLink);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Professional Invoice Generator</h2>
          <p className="text-slate-600 dark:text-slate-400">Create, customize, and export professional invoices</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" onClick={() => setShowSettings(!showSettings)}>
            <Settings size={16} className="mr-2" />
            Settings
          </Button>
          <Button variant="outline" onClick={saveInvoice}>
            <Save size={16} className="mr-2" />
            Save
          </Button>
          <Button variant="outline" onClick={duplicateInvoice}>
            <Copy size={16} className="mr-2" />
            Duplicate
          </Button>
          <div className="flex items-center">
            <Button onClick={() => exportInvoice('html')} className="rounded-r-none">
              <Download size={16} className="mr-2" />
              Export
            </Button>
            <div className="relative">
              <select
                onChange={(e) => exportInvoice(e.target.value as any)}
                className="appearance-none bg-primary-600 hover:bg-primary-700 text-white px-3 py-2 rounded-l-none rounded-r-lg border-l border-primary-700 focus:outline-none cursor-pointer"
                value=""
              >
                <option value="">Format</option>
                <option value="html">HTML</option>
                <option value="pdf">PDF</option>
                <option value="csv">CSV</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <Card padding="md">
          <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">Invoice Settings</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Currency
              </label>
              <select
                value={invoiceData.currency}
                onChange={(e) => setInvoiceData({ ...invoiceData, currency: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-100"
              >
                {CURRENCIES.map(currency => (
                  <option key={currency.code} value={currency.code}>
                    {currency.symbol} {currency.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Template
              </label>
              <select
                value={invoiceData.template}
                onChange={(e) => setInvoiceData({ ...invoiceData, template: e.target.value as any })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-100"
              >
                <option value="modern">Modern</option>
                <option value="classic">Classic</option>
                <option value="minimal">Minimal</option>
                <option value="professional">Professional</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Discount Type
              </label>
              <select
                value={invoiceData.discountType}
                onChange={(e) => setInvoiceData({ ...invoiceData, discountType: e.target.value as any })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-100"
              >
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed Amount</option>
              </select>
            </div>
          </div>
        </Card>
      )}
        {/* Template Preview */}
        <Card padding="md">
          <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">Template Preview</h3>
          <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
            <div 
              className="p-6 text-sm transform scale-75 origin-top-left"
              style={{ width: '133.33%', height: 'auto' }}
            >
              {renderInvoiceTemplate()}
            </div>
          </div>
          <div className="mt-3 text-center">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Preview of {settings.template.charAt(0).toUpperCase() + settings.template.slice(1)} template
            </p>
          </div>
        </Card>


      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Form */}
        <div className="space-y-6 xl:max-h-[calc(100vh-200px)] xl:overflow-y-auto xl:pr-4">
          {/* Invoice Details */}
          <Card padding="md">
            <div className="flex items-center space-x-2 mb-4">
              <Calendar size={20} className="text-primary-500" />
              <h3 className="font-semibold text-slate-900 dark:text-slate-100">Invoice Details</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Invoice Number"
                value={invoiceData.invoiceNumber}
                onChange={(e) => setInvoiceData({ ...invoiceData, invoiceNumber: e.target.value })}
              />
              <Input
                label="PO Number (Optional)"
                value={invoiceData.poNumber}
                onChange={(e) => setInvoiceData({ ...invoiceData, poNumber: e.target.value })}
                placeholder="Purchase Order Number"
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
                label="Company/Name"
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
              <Input
                label="Website (Optional)"
                value={invoiceData.from.website}
                onChange={(e) => setInvoiceData({
                  ...invoiceData,
                  from: { ...invoiceData.from, website: e.target.value }
                })}
                placeholder="https://yourwebsite.com"
              />
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
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-100"
                  rows={3}
                  placeholder="Your business address"
                />
              </div>
            </div>
          </Card>

          {/* To Address */}
          <Card padding="md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-900 dark:text-slate-100">Bill To (Client Details)</h3>
              {invoiceData.to.email && (
                <Button variant="outline" size="sm" onClick={sendInvoiceEmail}>
                  <Mail size={14} className="mr-2" />
                  Email
                </Button>
              )}
            </div>
            <div className="space-y-4">
              <Input
                label="Client Name/Company"
                value={invoiceData.to.name}
                onChange={(e) => setInvoiceData({
                  ...invoiceData,
                  to: { ...invoiceData.to, name: e.target.value }
                })}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Email"
                  type="email"
                  value={invoiceData.to.email}
                  onChange={(e) => setInvoiceData({
                    ...invoiceData,
                    to: { ...invoiceData.to, email: e.target.value }
                  })}
                />
                <Input
                  label="Phone (Optional)"
                  value={invoiceData.to.phone}
                  onChange={(e) => setInvoiceData({
                    ...invoiceData,
                    to: { ...invoiceData.to, phone: e.target.value }
                  })}
                />
              </div>
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
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-100"
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
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <Input
                        label="Quantity"
                        type="number"
                        value={item.quantity}
                        onChange={(e) => updateItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                      />
                      <Input
                        label={`Rate (${getCurrencySymbol()})`}
                        type="number"
                        step="0.01"
                        value={item.rate}
                        onChange={(e) => updateItem(item.id, 'rate', parseFloat(e.target.value) || 0)}
                      />
                      <Input
                        label={`Amount (${getCurrencySymbol()})`}
                        value={item.amount.toFixed(2)}
                        readOnly
                        className="bg-slate-50 dark:bg-slate-800"
                      />
                      <div className="space-y-1">
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                          Taxable
                        </label>
                        <label className="flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={item.taxable}
                            onChange={(e) => updateItem(item.id, 'taxable', e.target.checked)}
                            className="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500"
                          />
                          <span className="ml-2 text-sm text-slate-700 dark:text-slate-300">Tax applies</span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Tax Configuration */}
          <Card padding="md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-900 dark:text-slate-100">Tax Configuration</h3>
              <Button variant="outline" size="sm" onClick={addTaxRate}>
                <Plus size={16} className="mr-2" />
                Add Tax
              </Button>
            </div>
            <div className="space-y-3">
              {invoiceData.taxRates.map((tax) => (
                <div key={tax.id} className="flex items-center space-x-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <input
                    type="checkbox"
                    checked={tax.enabled}
                    onChange={(e) => updateTaxRate(tax.id, 'enabled', e.target.checked)}
                    className="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500"
                  />
                  <input
                    type="text"
                    value={tax.name}
                    onChange={(e) => updateTaxRate(tax.id, 'name', e.target.value)}
                    className="flex-1 px-3 py-1 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100"
                    placeholder="Tax name"
                  />
                  <input
                    type="number"
                    value={tax.rate}
                    onChange={(e) => updateTaxRate(tax.id, 'rate', parseFloat(e.target.value) || 0)}
                    className="w-20 px-3 py-1 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100"
                    placeholder="Rate"
                    step="0.01"
                  />
                  <span className="text-sm text-slate-500">%</span>
                  {invoiceData.taxRates.length > 1 && (
                    <Button variant="ghost" size="sm" onClick={() => removeTaxRate(tax.id)}>
                      <Trash2 size={14} />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </Card>

          {/* Additional Charges */}
          <Card padding="md">
            <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">Additional Charges</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label={`Discount ${invoiceData.discountType === 'percentage' ? '(%)' : `(${getCurrencySymbol()})`}`}
                type="number"
                step="0.01"
                value={invoiceData.discount}
                onChange={(e) => setInvoiceData({ ...invoiceData, discount: parseFloat(e.target.value) || 0 })}
              />
              <Input
                label={`Shipping (${getCurrencySymbol()})`}
                type="number"
                step="0.01"
                value={invoiceData.shipping}
                onChange={(e) => setInvoiceData({ ...invoiceData, shipping: parseFloat(e.target.value) || 0 })}
              />
            </div>
          </Card>

          {/* Notes and Terms */}
          <Card padding="md">
            <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">Additional Information</h3>
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Notes
                </label>
                <textarea
                  value={invoiceData.notes}
                  onChange={(e) => setInvoiceData({ ...invoiceData, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-100"
                  rows={3}
                  placeholder="Additional notes or comments..."
                />
              </div>
              
              <div className="space-y-1">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Terms & Conditions
                </label>
                <textarea
                  value={invoiceData.terms}
                  onChange={(e) => setInvoiceData({ ...invoiceData, terms: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-100"
                  rows={3}
                  placeholder="Payment terms, late fees, etc..."
                />
              </div>
              
              <div className="space-y-1">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Payment Instructions
                </label>
                <textarea
                  value={invoiceData.paymentInstructions}
                  onChange={(e) => setInvoiceData({ ...invoiceData, paymentInstructions: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-100"
                  rows={2}
                  placeholder="How clients should pay (bank details, payment methods, etc.)"
                />
              </div>
            </div>
          </Card>
        </div>

        {/* Preview */}
        <div className="xl:sticky xl:top-6 xl:h-fit">
          <Card padding="md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-900 dark:text-slate-100 flex items-center space-x-2">
                <Eye size={20} />
                <span>Live Preview</span>
              </h3>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                Template: {invoiceData.template}
              </div>
            </div>
            
            <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 text-sm max-h-[calc(100vh-300px)] overflow-y-auto">
              {/* Header */}
              <div className="bg-gradient-to-r from-primary-500 to-primary-600 text-white p-6 rounded-t-lg">
                <div className="flex justify-between items-start">
                  <div>
                    <h1 className="text-3xl font-bold mb-2">INVOICE</h1>
                    <div className="bg-white/20 px-3 py-1 rounded-full inline-block">
                      #{invoiceData.invoiceNumber}
                    </div>
                    {invoiceData.poNumber && (
                      <div className="mt-2 text-sm opacity-90">PO: {invoiceData.poNumber}</div>
                    )}
                  </div>
                  <div className="text-right bg-white/10 p-3 rounded-lg">
                    <div className="mb-1"><strong>Date:</strong> {new Date(invoiceData.date).toLocaleDateString()}</div>
                    <div><strong>Due:</strong> {new Date(invoiceData.dueDate).toLocaleDateString()}</div>
                  </div>
                </div>
              </div>

              <div className="p-6">
                {/* Addresses */}
                <div className="grid grid-cols-2 gap-6 mb-6">
                  <div className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg">
                    <div className="font-semibold text-primary-600 dark:text-primary-400 mb-2 text-xs uppercase tracking-wide">From</div>
                    <div className="text-slate-700 dark:text-slate-300">
                      <div className="font-semibold text-base mb-1">{invoiceData.from.name || 'Your Company'}</div>
                      {invoiceData.from.email && <div className="text-sm">{invoiceData.from.email}</div>}
                      {invoiceData.from.phone && <div className="text-sm">{invoiceData.from.phone}</div>}
                      {invoiceData.from.website && <div className="text-sm">{invoiceData.from.website}</div>}
                      {invoiceData.from.address && <div className="text-sm mt-2 whitespace-pre-line">{invoiceData.from.address}</div>}
                    </div>
                  </div>
                  <div className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg">
                    <div className="font-semibold text-primary-600 dark:text-primary-400 mb-2 text-xs uppercase tracking-wide">Bill To</div>
                    <div className="text-slate-700 dark:text-slate-300">
                      <div className="font-semibold text-base mb-1">{invoiceData.to.name || 'Client Name'}</div>
                      {invoiceData.to.email && <div className="text-sm">{invoiceData.to.email}</div>}
                      {invoiceData.to.phone && <div className="text-sm">{invoiceData.to.phone}</div>}
                      {invoiceData.to.address && <div className="text-sm mt-2 whitespace-pre-line">{invoiceData.to.address}</div>}
                    </div>
                  </div>
                </div>

                {/* Items Table */}
                <div className="mb-6 overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700">
                  <table className="w-full">
                    <thead className="bg-primary-500 text-white">
                      <tr>
                        <th className="text-left p-3 text-xs uppercase tracking-wide">Description</th>
                        <th className="text-center p-3 text-xs uppercase tracking-wide w-16">Qty</th>
                        <th className="text-right p-3 text-xs uppercase tracking-wide w-20">Rate</th>
                        <th className="text-right p-3 text-xs uppercase tracking-wide w-20">Amount</th>
                        <th className="text-center p-3 text-xs uppercase tracking-wide w-12">Tax</th>
                      </tr>
                    </thead>
                    <tbody>
                      {invoiceData.items.map((item, index) => (
                        <tr key={item.id} className={index % 2 === 0 ? 'bg-slate-50 dark:bg-slate-700' : ''}>
                          <td className="p-3 text-slate-700 dark:text-slate-300">{item.description || 'Item description'}</td>
                          <td className="p-3 text-center text-slate-700 dark:text-slate-300">{item.quantity}</td>
                          <td className="p-3 text-right text-slate-700 dark:text-slate-300">{getCurrencySymbol()}{item.rate.toFixed(2)}</td>
                          <td className="p-3 text-right font-semibold text-slate-700 dark:text-slate-300">{getCurrencySymbol()}{item.amount.toFixed(2)}</td>
                          <td className="p-3 text-center text-slate-700 dark:text-slate-300">{item.taxable ? '✓' : '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Totals */}
                <div className="flex justify-end mb-6">
                  <div className="w-80 bg-slate-50 dark:bg-slate-700 rounded-lg p-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-slate-700 dark:text-slate-300">
                        <span>Subtotal:</span>
                        <span>{getCurrencySymbol()}{invoiceData.subtotal.toFixed(2)}</span>
                      </div>
                      
                      {invoiceData.discount > 0 && (
                        <div className="flex justify-between text-slate-700 dark:text-slate-300">
                          <span>Discount {invoiceData.discountType === 'percentage' ? `(${invoiceData.discount}%)` : ''}:</span>
                          <span>-{getCurrencySymbol()}{(invoiceData.discountType === 'percentage' ? (invoiceData.subtotal * invoiceData.discount / 100) : invoiceData.discount).toFixed(2)}</span>
                        </div>
                      )}
                      
                      {invoiceData.taxRates.filter(tax => tax.enabled).map(tax => (
                        <div key={tax.id} className="flex justify-between text-slate-700 dark:text-slate-300">
                          <span>{tax.name} ({tax.rate}%):</span>
                          <span>{getCurrencySymbol()}{((invoiceData.items.filter(item => item.taxable).reduce((sum, item) => sum + item.amount, 0) * tax.rate) / 100).toFixed(2)}</span>
                        </div>
                      ))}
                      
                      {invoiceData.shipping > 0 && (
                        <div className="flex justify-between text-slate-700 dark:text-slate-300">
                          <span>Shipping:</span>
                          <span>{getCurrencySymbol()}{invoiceData.shipping.toFixed(2)}</span>
                        </div>
                      )}
                      
                      <div className="border-t border-slate-300 dark:border-slate-600 pt-2 mt-3">
                        <div className="flex justify-between font-bold text-lg text-primary-600 dark:text-primary-400">
                          <span>Total ({invoiceData.currency}):</span>
                          <span>{getCurrencySymbol()}{invoiceData.total.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Additional Information */}
                <div className="space-y-4">
                  {invoiceData.notes && (
                    <div className="p-4 bg-slate-50 dark:bg-slate-700 rounded-lg border-l-4 border-primary-500">
                      <div className="font-semibold text-primary-600 dark:text-primary-400 mb-2 text-xs uppercase tracking-wide">Notes</div>
                      <div className="text-slate-700 dark:text-slate-300 text-sm whitespace-pre-line">{invoiceData.notes}</div>
                    </div>
                  )}
                  
                  {invoiceData.terms && (
                    <div className="p-4 bg-slate-50 dark:bg-slate-700 rounded-lg border-l-4 border-primary-500">
                      <div className="font-semibold text-primary-600 dark:text-primary-400 mb-2 text-xs uppercase tracking-wide">Terms & Conditions</div>
                      <div className="text-slate-700 dark:text-slate-300 text-sm whitespace-pre-line">{invoiceData.terms}</div>
                    </div>
                  )}
                  
                  {invoiceData.paymentInstructions && (
                    <div className="p-4 bg-slate-50 dark:bg-slate-700 rounded-lg border-l-4 border-primary-500">
                      <div className="font-semibold text-primary-600 dark:text-primary-400 mb-2 text-xs uppercase tracking-wide">Payment Instructions</div>
                      <div className="text-slate-700 dark:text-slate-300 text-sm whitespace-pre-line">{invoiceData.paymentInstructions}</div>
                    </div>
                  )}
                </div>

                <div className="text-center mt-8 pt-6 border-t border-slate-200 dark:border-slate-700">
                  <p className="text-slate-600 dark:text-slate-400 text-sm">Thank you for your business!</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};