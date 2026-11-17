import React, { useState } from 'react';
import { Trash2 } from 'lucide-react';
import {
  deleteLeadAdmin,
  deleteVisitRequestAdmin,
  updateLeadAdmin,
  updateVisitRequestAdmin,
} from '../../services/firestoreService';
import type { LeadItem, LeadStatus, VisitRequestItem, VisitStatus } from '../../types/domain';

interface AdminLeadsTabProps {
  leads: LeadItem[];
  visits: VisitRequestItem[];
  onReload: () => Promise<void>;
}

export const AdminLeadsTab: React.FC<AdminLeadsTabProps> = ({ leads, visits, onReload }) => {
  const [subTab, setSubTab] = useState<'leads' | 'visits'>('leads');
  const [notesDraft, setNotesDraft] = useState<Record<string, string>>({});

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-editorial text-3xl font-semibold text-[#0B1B32]">Leads e Visitas</h2>
          <p className="text-xs text-[#0B1B32]/65">
            Acompanhe contatos recebidos, origem UTM e agendamentos de visita.
          </p>
        </div>

        <div className="flex items-center gap-1 rounded-lg bg-[#EFEAE2] p-1">
          <button
            type="button"
            onClick={() => setSubTab('leads')}
            className={`rounded-md px-3.5 py-1.5 text-xs font-semibold cursor-pointer ${
              subTab === 'leads' ? 'bg-white text-[#0B1B32] shadow-sm' : 'text-[#0B1B32]/70'
            }`}
          >
            Leads ({leads.length})
          </button>
          <button
            type="button"
            onClick={() => setSubTab('visits')}
            className={`rounded-md px-3.5 py-1.5 text-xs font-semibold cursor-pointer ${
              subTab === 'visits' ? 'bg-white text-[#0B1B32] shadow-sm' : 'text-[#0B1B32]/70'
            }`}
          >
            Visitas ({visits.length})
          </button>
        </div>
      </div>

      {subTab === 'leads' ? (
        <div className="space-y-4">
          {leads.length === 0 ? (
            <div className="rounded-xl border border-[#0B1B32]/12 bg-white p-8 text-center text-sm text-[#0B1B32]/65">
              Nenhum lead registrado ainda.
            </div>
          ) : (
            leads.map((lead) => (
              <div key={lead.id} className="rounded-xl border border-[#0B1B32]/12 bg-white p-5 space-y-3">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h4 className="font-editorial text-2xl font-semibold text-[#0B1B32]">{lead.name}</h4>
                    <p className="text-xs text-[#0B1B32]/70 tabular-nums">
                      {lead.phone} {lead.email ? `· ${lead.email}` : ''}
                    </p>
                    <p className="mt-1 text-xs text-[#9E712E]">
                      Interesse: {lead.propertyTitle || 'Geral'} · Origem: {lead.source || '/'}
                      {lead.utmSource ? ` · UTM: ${lead.utmSource}/${lead.utmCampaign || '-'}` : ''}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <select
                      value={lead.status}
                      onChange={async (e) => {
                        await updateLeadAdmin(lead.id, e.target.value as LeadStatus, notesDraft[lead.id] ?? lead.notes ?? '');
                        await onReload();
                      }}
                      className="rounded-lg border border-[#0B1B32]/18 px-3 py-1.5 text-xs font-semibold"
                    >
                      <option value="Novo">Novo</option>
                      <option value="Em atendimento">Em atendimento</option>
                      <option value="Visitado">Visitado</option>
                      <option value="Arquivado">Arquivado</option>
                    </select>
                    <button
                      type="button"
                      onClick={async () => {
                        await deleteLeadAdmin(lead.id);
                        await onReload();
                      }}
                      className="rounded-lg border border-red-200 p-2 text-red-700 hover:bg-red-50 cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {lead.message && (
                  <p className="rounded-lg bg-[#FAF8F5] p-3 text-xs text-[#0B1B32]/80">{lead.message}</p>
                )}

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={notesDraft[lead.id] ?? lead.notes ?? ''}
                    onChange={(e) => setNotesDraft({ ...notesDraft, [lead.id]: e.target.value })}
                    placeholder="Observações internas do atendimento..."
                    className="flex-1 rounded-lg border border-[#0B1B32]/15 px-3 py-1.5 text-xs"
                  />
                  <button
                    type="button"
                    onClick={async () => {
                      await updateLeadAdmin(lead.id, lead.status, notesDraft[lead.id] ?? lead.notes ?? '');
                      await onReload();
                    }}
                    className="rounded-lg bg-[#0B1B32] px-3.5 py-1.5 text-xs font-semibold text-white cursor-pointer"
                  >
                    Salvar nota
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {visits.length === 0 ? (
            <div className="rounded-xl border border-[#0B1B32]/12 bg-white p-8 text-center text-sm text-[#0B1B32]/65">
              Nenhuma solicitação de visita registrada ainda.
            </div>
          ) : (
            visits.map((v) => (
              <div key={v.id} className="rounded-xl border border-[#0B1B32]/12 bg-white p-5 space-y-3">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h4 className="font-editorial text-2xl font-semibold text-[#0B1B32]">{v.name}</h4>
                    <p className="text-xs text-[#0B1B32]/70 tabular-nums">
                      {v.phone} {v.email ? `· ${v.email}` : ''}
                    </p>
                    <p className="mt-1 text-xs text-[#9E712E] tabular-nums">
                      Imóvel: {v.propertyTitle || 'A definir'} · Data: {v.preferredDate || 'A combinar'} · Horário: {v.preferredTime || 'A combinar'}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <select
                      value={v.status}
                      onChange={async (e) => {
                        await updateVisitRequestAdmin(
                          v.id,
                          e.target.value as VisitStatus,
                          notesDraft[v.id] ?? v.notes ?? '',
                          v.preferredDate,
                          v.preferredTime
                        );
                        await onReload();
                      }}
                      className="rounded-lg border border-[#0B1B32]/18 px-3 py-1.5 text-xs font-semibold"
                    >
                      <option value="Pendente">Pendente</option>
                      <option value="Confirmada">Confirmada</option>
                      <option value="Realizada">Realizada</option>
                      <option value="Cancelada">Cancelada</option>
                    </select>
                    <button
                      type="button"
                      onClick={async () => {
                        await deleteVisitRequestAdmin(v.id);
                        await onReload();
                      }}
                      className="rounded-lg border border-red-200 p-2 text-red-700 hover:bg-red-50 cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {v.message && (
                  <p className="rounded-lg bg-[#FAF8F5] p-3 text-xs text-[#0B1B32]/80">{v.message}</p>
                )}

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={notesDraft[v.id] ?? v.notes ?? ''}
                    onChange={(e) => setNotesDraft({ ...notesDraft, [v.id]: e.target.value })}
                    placeholder="Observações da visita..."
                    className="flex-1 rounded-lg border border-[#0B1B32]/15 px-3 py-1.5 text-xs"
                  />
                  <button
                    type="button"
                    onClick={async () => {
                      await updateVisitRequestAdmin(
                        v.id,
                        v.status,
                        notesDraft[v.id] ?? v.notes ?? '',
                        v.preferredDate,
                        v.preferredTime
                      );
                      await onReload();
                    }}
                    className="rounded-lg bg-[#0B1B32] px-3.5 py-1.5 text-xs font-semibold text-white cursor-pointer"
                  >
                    Salvar nota
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
