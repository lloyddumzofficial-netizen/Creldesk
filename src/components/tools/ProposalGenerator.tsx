import React, { useState } from 'react';
import { Download, Plus, Trash2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card } from '../ui/Card';
import { ProposalData } from '../../types';

export const ProposalGenerator: React.FC = () => {
  const [proposalData, setProposalData] = useState<ProposalData>({
    clientName: '',
    projectTitle: '',
    projectDescription: '',
    scope: [],
    timeline: '',
    budget: 0,
    terms: '',
    deliverables: [],
  });

  const [newScopeItem, setNewScopeItem] = useState('');
  const [newDeliverable, setNewDeliverable] = useState('');

  const addScopeItem = () => {
    if (newScopeItem.trim()) {
      setProposalData({
        ...proposalData,
        scope: [...proposalData.scope, newScopeItem.trim()],
      });
      setNewScopeItem('');
    }
  };

  const removeScopeItem = (index: number) => {
    setProposalData({
      ...proposalData,
      scope: proposalData.scope.filter((_, i) => i !== index),
    });
  };

  const addDeliverable = () => {
    if (newDeliverable.trim()) {
      setProposalData({
        ...proposalData,
        deliverables: [...proposalData.deliverables, newDeliverable.trim()],
      });
      setNewDeliverable('');
    }
  };

  const removeDeliverable = (index: number) => {
    setProposalData({
      ...proposalData,
      deliverables: proposalData.deliverables.filter((_, i) => i !== index),
    });
  };

  const exportProposal = () => {
    const proposalHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Project Proposal - ${proposalData.projectTitle}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; color: #333; }
          .header { text-align: center; margin-bottom: 40px; border-bottom: 3px solid #14b8a6; padding-bottom: 20px; }
          .title { font-size: 28px; font-weight: bold; color: #14b8a6; margin-bottom: 10px; }
          .client { font-size: 18px; color: #666; }
          .section { margin-bottom: 30px; }
          .section-title { font-size: 20px; font-weight: bold; color: #14b8a6; margin-bottom: 15px; border-bottom: 1px solid #eee; padding-bottom: 5px; }
          .budget { font-size: 24px; font-weight: bold; color: #14b8a6; text-align: center; padding: 20px; background: #f8f9fa; border-radius: 8px; }
          ul { padding-left: 20px; }
          li { margin-bottom: 8px; }
          .terms { background: #f8f9fa; padding: 20px; border-radius: 8px; border-left: 4px solid #14b8a6; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="title">${proposalData.projectTitle || 'Project Proposal'}</div>
          <div class="client">Prepared for: ${proposalData.clientName || 'Client Name'}</div>
          <div style="margin-top: 10px; color: #666;">Date: ${new Date().toLocaleDateString()}</div>
        </div>

        <div class="section">
          <div class="section-title">Project Overview</div>
          <p>${proposalData.projectDescription || 'Project description will appear here.'}</p>
        </div>

        ${proposalData.scope.length > 0 ? `
        <div class="section">
          <div class="section-title">Scope of Work</div>
          <ul>
            ${proposalData.scope.map(item => `<li>${item}</li>`).join('')}
          </ul>
        </div>
        ` : ''}

        ${proposalData.deliverables.length > 0 ? `
        <div class="section">
          <div class="section-title">Deliverables</div>
          <ul>
            ${proposalData.deliverables.map(item => `<li>${item}</li>`).join('')}
          </ul>
        </div>
        ` : ''}

        ${proposalData.timeline ? `
        <div class="section">
          <div class="section-title">Timeline</div>
          <p>${proposalData.timeline}</p>
        </div>
        ` : ''}

        ${proposalData.budget > 0 ? `
        <div class="section">
          <div class="section-title">Investment</div>
          <div class="budget">$${proposalData.budget.toLocaleString()}</div>
        </div>
        ` : ''}

        ${proposalData.terms ? `
        <div class="section">
          <div class="section-title">Terms & Conditions</div>
          <div class="terms">${proposalData.terms}</div>
        </div>
        ` : ''}

        <div class="section" style="text-align: center; margin-top: 50px;">
          <p>Thank you for considering our proposal. We look forward to working with you!</p>
        </div>
      </body>
      </html>
    `;

    const blob = new Blob([proposalHTML], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${proposalData.projectTitle || 'Proposal'}.html`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Proposal Generator</h2>
        <Button onClick={exportProposal}>
          <Download size={16} className="mr-2" />
          Export Proposal
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form */}
        <div className="space-y-6 lg:max-h-[calc(100vh-200px)] lg:overflow-y-auto lg:pr-4">
          <Card padding="md">
            <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">Basic Information</h3>
            <div className="space-y-4">
              <Input
                label="Client Name"
                value={proposalData.clientName}
                onChange={(e) => setProposalData({ ...proposalData, clientName: e.target.value })}
                placeholder="Enter client name"
              />
              <Input
                label="Project Title"
                value={proposalData.projectTitle}
                onChange={(e) => setProposalData({ ...proposalData, projectTitle: e.target.value })}
                placeholder="Enter project title"
              />
              <div className="space-y-1">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Project Description
                </label>
                <textarea
                  value={proposalData.projectDescription}
                  onChange={(e) => setProposalData({ ...proposalData, projectDescription: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-turquoise-500 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-100"
                  rows={4}
                  placeholder="Describe the project overview and objectives..."
                />
              </div>
            </div>
          </Card>

          <Card padding="md">
            <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">Scope of Work</h3>
            <div className="flex space-x-2 mb-4">
              <Input
                value={newScopeItem}
                onChange={(e) => setNewScopeItem(e.target.value)}
                placeholder="Add scope item..."
                onKeyPress={(e) => e.key === 'Enter' && addScopeItem()}
              />
              <Button onClick={addScopeItem}>
                <Plus size={16} />
              </Button>
            </div>
            <div className="space-y-2">
              {proposalData.scope.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <span className="text-slate-900 dark:text-slate-100">{item}</span>
                  <Button variant="ghost" size="sm" onClick={() => removeScopeItem(index)}>
                    <Trash2 size={16} />
                  </Button>
                </div>
              ))}
            </div>
          </Card>

          <Card padding="md">
            <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">Deliverables</h3>
            <div className="flex space-x-2 mb-4">
              <Input
                value={newDeliverable}
                onChange={(e) => setNewDeliverable(e.target.value)}
                placeholder="Add deliverable..."
                onKeyPress={(e) => e.key === 'Enter' && addDeliverable()}
              />
              <Button onClick={addDeliverable}>
                <Plus size={16} />
              </Button>
            </div>
            <div className="space-y-2">
              {proposalData.deliverables.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <span className="text-slate-900 dark:text-slate-100">{item}</span>
                  <Button variant="ghost" size="sm" onClick={() => removeDeliverable(index)}>
                    <Trash2 size={16} />
                  </Button>
                </div>
              ))}
            </div>
          </Card>

          <Card padding="md">
            <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">Timeline & Budget</h3>
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Timeline
                </label>
                <textarea
                  value={proposalData.timeline}
                  onChange={(e) => setProposalData({ ...proposalData, timeline: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-turquoise-500 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-100"
                  rows={3}
                  placeholder="Describe the project timeline and milestones..."
                />
              </div>
              <Input
                label="Budget ($)"
                type="number"
                value={proposalData.budget}
                onChange={(e) => setProposalData({ ...proposalData, budget: parseFloat(e.target.value) || 0 })}
                placeholder="Enter project budget"
              />
            </div>
          </Card>

          <Card padding="md">
            <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">Terms & Conditions</h3>
            <textarea
              value={proposalData.terms}
              onChange={(e) => setProposalData({ ...proposalData, terms: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-turquoise-500 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-100"
              rows={4}
              placeholder="Enter terms and conditions, payment terms, etc..."
            />
          </Card>
        </div>

        {/* Preview */}
        <div className="lg:sticky lg:top-6 lg:h-fit">
          <Card padding="md">
            <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">Preview</h3>
            <div className="bg-white dark:bg-slate-800 p-6 rounded-lg border border-slate-200 dark:border-slate-700 text-sm max-h-[calc(100vh-300px)] overflow-y-auto">
              {/* Header */}
              <div className="text-center mb-6 border-b-2 border-turquoise-500 pb-4">
                <h1 className="text-2xl font-bold text-turquoise-600 dark:text-turquoise-400 mb-2">
                  {proposalData.projectTitle || 'Project Proposal'}
                </h1>
                <div className="text-slate-600 dark:text-slate-400">
                  Prepared for: {proposalData.clientName || 'Client Name'}
                </div>
                <div className="text-slate-500 dark:text-slate-500 text-xs mt-2">
                  Date: {new Date().toLocaleDateString()}
                </div>
              </div>

              {/* Project Overview */}
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-turquoise-600 dark:text-turquoise-400 border-b border-slate-200 dark:border-slate-700 pb-1 mb-3">
                  Project Overview
                </h2>
                <p className="text-slate-700 dark:text-slate-300">
                  {proposalData.projectDescription || 'Project description will appear here.'}
                </p>
              </div>

              {/* Scope */}
              {proposalData.scope.length > 0 && (
                <div className="mb-6">
                  <h2 className="text-lg font-semibold text-turquoise-600 dark:text-turquoise-400 border-b border-slate-200 dark:border-slate-700 pb-1 mb-3">
                    Scope of Work
                  </h2>
                  <ul className="list-disc list-inside space-y-1 text-slate-700 dark:text-slate-300">
                    {proposalData.scope.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Deliverables */}
              {proposalData.deliverables.length > 0 && (
                <div className="mb-6">
                  <h2 className="text-lg font-semibold text-turquoise-600 dark:text-turquoise-400 border-b border-slate-200 dark:border-slate-700 pb-1 mb-3">
                    Deliverables
                  </h2>
                  <ul className="list-disc list-inside space-y-1 text-slate-700 dark:text-slate-300">
                    {proposalData.deliverables.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Timeline */}
              {proposalData.timeline && (
                <div className="mb-6">
                  <h2 className="text-lg font-semibold text-turquoise-600 dark:text-turquoise-400 border-b border-slate-200 dark:border-slate-700 pb-1 mb-3">
                    Timeline
                  </h2>
                  <p className="text-slate-700 dark:text-slate-300">{proposalData.timeline}</p>
                </div>
              )}

              {/* Budget */}
              {proposalData.budget > 0 && (
                <div className="mb-6">
                  <h2 className="text-lg font-semibold text-turquoise-600 dark:text-turquoise-400 border-b border-slate-200 dark:border-slate-700 pb-1 mb-3">
                    Investment
                  </h2>
                  <div className="text-center p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
                    <div className="text-2xl font-bold text-turquoise-600 dark:text-turquoise-400">
                      ${proposalData.budget.toLocaleString()}
                    </div>
                  </div>
                </div>
              )}

              {/* Terms */}
              {proposalData.terms && (
                <div className="mb-6">
                  <h2 className="text-lg font-semibold text-turquoise-600 dark:text-turquoise-400 border-b border-slate-200 dark:border-slate-700 pb-1 mb-3">
                    Terms & Conditions
                  </h2>
                  <div className="p-4 bg-slate-50 dark:bg-slate-700 rounded-lg border-l-4 border-turquoise-500">
                    <p className="text-slate-700 dark:text-slate-300">{proposalData.terms}</p>
                  </div>
                </div>
              )}

              <div className="text-center mt-8 pt-6 border-t border-slate-200 dark:border-slate-700">
                <p className="text-slate-600 dark:text-slate-400">
                  Thank you for considering our proposal. We look forward to working with you!
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};