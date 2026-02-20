'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { Template } from '@/lib/types';

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const response = await fetch('/api/templates');
      if (!response.ok) throw new Error('Failed to fetch templates');
      const data = await response.json();
      setTemplates(data);
    } catch (error) {
      showToast('Klaida užkraunant šablonus', 'error');
      console.error(error);
    }
  };

  const handleSave = async () => {
    if (!selectedTemplate) return;

    setIsSaving(true);
    try {
      const response = await fetch(`/api/templates/${selectedTemplate.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: selectedTemplate.content,
          description: selectedTemplate.description,
        }),
      });

      if (!response.ok) throw new Error('Failed to save template');

      showToast('Šablonas išsaugotas', 'success');
      setIsEditing(false);
      fetchTemplates();
    } catch (error) {
      showToast('Klaida išsaugant šabloną', 'error');
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="bg-gradient-to-r from-blue-950 to-blue-900 text-white py-8 px-4 sm:px-6 lg:px-8 mb-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">Dokumentų Šablonai</h1>
              <p className="text-sm text-cyan-300 mt-1">
                Redaguokite pasiūlymų, sutarčių ir aktų šablonus
              </p>
            </div>
            <a href="/new-offer">
              <Button variant="ghost" className="text-white hover:bg-blue-800">← Atgal į pasiūlymus</Button>
            </a>
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="grid grid-cols-12 gap-6">
          {/* Templates List */}
          <div className="col-span-3 bg-white rounded-lg shadow p-4">
            <h2 className="text-lg font-semibold mb-4">Šablonai</h2>
            <div className="space-y-2">
              {templates.map((template) => (
                <button
                  key={template.id}
                  onClick={() => {
                    setSelectedTemplate(template);
                    setIsEditing(false);
                  }}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    selectedTemplate?.id === template.id
                      ? 'bg-cyan-50 border-2 border-cyan-500'
                      : 'bg-zinc-50 hover:bg-zinc-100 border-2 border-transparent'
                  }`}
                >
                  <div className="font-medium text-sm">{template.name}</div>
                  <div className="text-xs text-zinc-500 mt-1">{template.type}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Template Editor */}
          <div className="col-span-9 bg-white rounded-lg shadow p-6">
            {selectedTemplate ? (
              <>
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-zinc-900">{selectedTemplate.name}</h2>
                    <p className="text-sm text-zinc-500 mt-1">{selectedTemplate.description}</p>
                    <div className="mt-2">
                      <span className="inline-block px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                        {selectedTemplate.type}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {!isEditing ? (
                      <Button
                        variant="primary"
                        onClick={() => setIsEditing(true)}
                      >
                        ✏️ Redaguoti
                      </Button>
                    ) : (
                      <>
                        <Button
                          variant="secondary"
                          onClick={() => {
                            setIsEditing(false);
                            fetchTemplates();
                          }}
                        >
                          Atšaukti
                        </Button>
                        <Button
                          variant="primary"
                          onClick={handleSave}
                          disabled={isSaving}
                        >
                          {isSaving ? 'Saugoma...' : '💾 Išsaugoti'}
                        </Button>
                      </>
                    )}
                  </div>
                </div>

                {/* Description Editor */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-zinc-700 mb-2">
                    Aprašymas
                  </label>
                  <input
                    type="text"
                    value={selectedTemplate.description || ''}
                    onChange={(e) =>
                      setSelectedTemplate({
                        ...selectedTemplate,
                        description: e.target.value,
                      })
                    }
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-zinc-100"
                  />
                </div>

                {/* Content Editor */}
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-2">
                    Šablono turinys (HTML su kintamaisiais)
                  </label>
                  <div className="text-xs text-zinc-500 mb-2">
                    Kintamieji: {`{{offerNo}}, {{clientName}}, {{clientBirthDate}}, {{clientEmail}}, 
                    {{clientPhone}}, {{clientAddress}}, {{projectManagerName}}, {{paymentReference}}, 
                    {{warrantyYears}}, {{date}}, {{finalTotal}}, {{advancePayment}}, {{finalPayment}}, 
                    {{productsTable}}, {{signatureTable}}`}
                  </div>
                  <textarea
                    value={selectedTemplate.content}
                    onChange={(e) =>
                      setSelectedTemplate({
                        ...selectedTemplate,
                        content: e.target.value,
                      })
                    }
                    disabled={!isEditing}
                    className="w-full h-[500px] px-3 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-zinc-100 font-mono text-xs"
                  />
                </div>

                {/* Preview */}
                {!isEditing && (
                  <div className="mt-6">
                    <h3 className="text-sm font-medium text-zinc-700 mb-2">Peržiūra</h3>
                    <div className="border border-zinc-300 rounded-lg p-4 bg-white max-h-[400px] overflow-y-auto">
                      <div dangerouslySetInnerHTML={{ __html: selectedTemplate.content }} />
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center text-zinc-500 py-12">
                Pasirinkite šabloną iš kairės pusės
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
