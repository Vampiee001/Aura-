import React, { useState } from 'react';
import { 
  Building2, 
  MapPin, 
  DollarSign, 
  Maximize2, 
  Users, 
  ShieldCheck, 
  Sparkles, 
  Layers, 
  ChevronRight,
  Download,
  CheckCircle2,
  Lock
} from 'lucide-react';
import { Property, Lead, UserRole } from '../types';

interface PropertyPortfolioProps {
  properties: Property[];
  leads: Lead[];
  onSelectPropertyToMatch: (property: Property) => void;
  currentRole: UserRole;
  searchFilter: string;
}

export const PropertyPortfolio: React.FC<PropertyPortfolioProps> = ({
  properties,
  leads,
  onSelectPropertyToMatch,
  currentRole,
  searchFilter
}) => {
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);

  const filteredProperties = properties.filter(p => {
    if (!searchFilter) return true;
    return p.title.toLowerCase().includes(searchFilter.toLowerCase()) ||
           p.city.toLowerCase().includes(searchFilter.toLowerCase()) ||
           p.category.toLowerCase().includes(searchFilter.toLowerCase());
  });

  return (
    <div className="space-y-6">
      
      {/* Portfolio Header */}
      <div className="bg-[#0d121c] border border-[#1e2638] rounded-xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-[#c5a059]/15 border border-[#c5a059]/30 text-[#e5c98a]">
              <Building2 className="w-4 h-4" />
            </span>
            <h2 className="font-serif-luxury text-lg font-bold text-slate-100">
              Luxury Property Assets &amp; Development Portfolio
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            High-value turnkey estates, commercial towers, and future development parcels matched with social prospect pipelines.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Total Portfolio Valuation:</span>
          <span className="text-base font-serif-luxury font-bold text-[#e5c98a]">$314,500,000+</span>
        </div>
      </div>

      {/* Property Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredProperties.map((prop) => {
          const matchedLeads = leads.filter(l => l.matchedPropertyId === prop.id);

          return (
            <div
              key={prop.id}
              className="bg-[#0d121c] border border-[#1e2638] hover:border-[#c5a059]/60 rounded-xl overflow-hidden transition-all group flex flex-col justify-between"
            >
              <div>
                {/* Image Banner */}
                <div className="h-52 w-full relative overflow-hidden">
                  <img
                    src={prop.imageUrl}
                    alt={prop.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0d121c] via-[#0d121c]/30 to-transparent"></div>
                  
                  {/* Category Pill */}
                  <span className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-black/75 backdrop-blur-md text-[10px] font-bold text-[#e5c98a] border border-[#c5a059]/40 uppercase tracking-wider">
                    {prop.category}
                  </span>

                  {/* Status Pill */}
                  <span className={`absolute top-3 right-3 px-2.5 py-1 rounded-md text-[10px] font-bold border backdrop-blur-md ${
                    prop.status === 'Available'
                      ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700'
                      : 'bg-amber-950/80 text-amber-300 border-amber-700'
                  }`}>
                    {prop.status}
                  </span>

                  {/* Bottom Image Overlay Details */}
                  <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
                    <div>
                      <span className="text-[11px] text-slate-300 flex items-center gap-1 drop-shadow">
                        <MapPin className="w-3.5 h-3.5 text-[#c5a059]" /> {prop.city}
                      </span>
                      <h3 className="font-serif-luxury text-lg font-bold text-white drop-shadow">
                        {prop.title}
                      </h3>
                    </div>
                    <span className="text-xl font-serif-luxury font-bold text-[#e5c98a] drop-shadow">
                      {prop.valuation}
                    </span>
                  </div>
                </div>

                {/* Specs Body */}
                <div className="p-5 space-y-4">
                  <div className="grid grid-cols-3 gap-3 p-3 rounded-lg bg-[#080b12] border border-[#1e2638] text-xs">
                    <div>
                      <span className="text-[10px] text-slate-500 block">Total Area</span>
                      <strong className="text-slate-200">{prop.squareFeet}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">Occupancy</span>
                      <strong className="text-slate-200">{prop.activeOccupancy}%</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">Secure Entry Points</span>
                      <strong className="text-slate-200">{prop.entryPointsCount} Portals</strong>
                    </div>
                  </div>

                  {/* Infrastructure Rating */}
                  <div className="flex items-center justify-between text-xs p-2.5 rounded-lg bg-[#121927] border border-[#22304d]">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-[#c5a059]" />
                      Infrastructure Certification:
                    </span>
                    <strong className="text-[#e5c98a] font-medium">{prop.infrastructureRating}</strong>
                  </div>

                  {/* Associated Leads from Social Scraper */}
                  <div>
                    <div className="flex items-center justify-between text-xs mb-2">
                      <span className="text-slate-400 font-medium flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-[#c5a059]" />
                        Matched Prospects ({matchedLeads.length})
                      </span>
                      <span className="text-[10px] text-[#e5c98a]">AI Matched</span>
                    </div>

                    <div className="space-y-1.5">
                      {matchedLeads.map(l => (
                        <div key={l.id} className="flex items-center justify-between p-2 rounded-md bg-[#080b12] border border-[#182030] text-xs">
                          <div className="flex items-center gap-2">
                            <img src={l.avatar} alt={l.name} className="w-6 h-6 rounded-full object-cover" />
                            <div>
                              <span className="font-semibold text-slate-200 block text-[11px]">{l.name}</span>
                              <span className="text-[10px] text-slate-400">{l.company}</span>
                            </div>
                          </div>
                          <span className="font-bold text-[#e5c98a] text-[11px]">{l.intentScore}% Match</span>
                        </div>
                      ))}
                      {matchedLeads.length === 0 && (
                        <div className="p-2 rounded-md bg-[#080b12] text-center text-[11px] text-slate-500">
                          No active leads matched yet.
                        </div>
                      )}
                    </div>
                  </div>

                </div>
              </div>

              {/* Card Footer */}
              <div className="p-4 border-t border-[#1e2638] flex items-center justify-between bg-[#080c14]">
                <span className="text-[11px] text-slate-400 font-light">
                  {prop.location}
                </span>

                <button
                  onClick={() => onSelectPropertyToMatch(prop)}
                  className="px-3 py-1.5 rounded-lg bg-[#c5a059]/20 hover:bg-[#c5a059]/30 text-[#e5c98a] border border-[#c5a059]/40 text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer"
                >
                  <Sparkles className="w-3 h-3" />
                  Auto-Match Leads
                </button>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
};
