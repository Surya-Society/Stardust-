// Clients.tsx (version corrigée en Tailwind CSS)
import { useState } from 'react';
import {
  FiUsers, FiPlus, FiSearch, FiMail, FiPhone,
  FiCalendar, FiMoreVertical, FiEdit2, FiTrash2,
  FiUserCheck, FiUserX, FiUserMinus, FiFilter,
  FiRefreshCw, FiStar,
  FiClock, FiCheckCircle, FiXCircle,
  FiAlertCircle, FiEye, FiMessageSquare, FiFileText,
  FiThumbsUp, FiThumbsDown, FiFlag,
  FiInbox, FiSend, FiCheck, FiX, FiMinus
} from 'react-icons/fi';
import {
  HiOutlineBuildingOffice,
  HiOutlineUserGroup,
} from 'react-icons/hi2';
import { HiOutlineViewGrid } from "react-icons/hi";
import { HiOutlineCollection } from "react-icons/hi";
import { MdOutlineWorkOutline } from 'react-icons/md';
import { BsChatDots } from 'react-icons/bs';
import { RiCustomerServiceLine } from 'react-icons/ri';

// Types pour les clients
interface Client {
  id: number;
  name: string;
  role: string;
  school: string;
  email: string;
  phone: string;
  joined: string;
  status: 'active' | 'inactive' | 'suspended' | 'pending';
  avatar?: string;
  lastActive?: string;
  notes?: string;
  requests?: number;
}

// Types pour les demandes
interface ClientRequest {
  id: number;
  clientId: number;
  clientName: string;
  type: 'template' | 'feature' | 'bug' | 'support' | 'complaint' | 'custom';
  title: string;
  description: string;
  status: 'new' | 'in-progress' | 'completed' | 'rejected' | 'urgent';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  createdAt: string;
  updatedAt: string;
  attachments?: string[];
  category?: string;
  templateType?: 'badge' | 'invoice' | 'certificate' | 'report';
  specifications?: string;
  comments?: RequestComment[];
}

interface RequestComment {
  id: number;
  userId: number;
  userName: string;
  content: string;
  createdAt: string;
}

interface StatCardProps {
  label: string;
  value: number;
  icon: React.ElementType;
  color: string;
  change?: {
    value: number;
    positive: boolean;
  };
}

interface ClientsProps {
  onNotify: (message: string, type: 'green' | 'red' | 'amber' | 'blue') => void;
}

// Données mockées pour les clients
const clients: Client[] = [
  {
    id: 1,
    name: "Marie Dupont",
    role: "Directrice",
    school: "Lycée Victor Hugo",
    email: "m.dupont@vh.fr",
    phone: "+33 6 12 34 56 78",
    joined: "12 Jan 2025",
    status: "active",
    lastActive: "Il y a 5 min",
    notes: "Client fidèle depuis 3 ans",
    requests: 3
  },
  {
    id: 2,
    name: "Pierre Lambert",
    role: "Proviseur",
    school: "Collège Jean Moulin",
    email: "p.lambert@jm.fr",
    phone: "+33 6 98 76 54 32",
    joined: "03 Fév 2025",
    status: "active",
    lastActive: "Il y a 2 heures",
    requests: 1
  },
  {
    id: 3,
    name: "Sophie Martin",
    role: "Secrétaire",
    school: "École Primaire Pasteur",
    email: "s.martin@pasteur.fr",
    phone: "+33 6 55 44 33 22",
    joined: "15 Nov 2024",
    status: "inactive",
    lastActive: "Il y a 2 semaines",
    requests: 0
  },
  {
    id: 4,
    name: "Thomas Renard",
    role: "Directeur IT",
    school: "Lycée Technique Rodin",
    email: "t.renard@rodin.fr",
    phone: "+33 6 77 88 99 00",
    joined: "22 Mar 2025",
    status: "suspended",
    lastActive: "Il y a 1 mois",
    requests: 2
  },
  {
    id: 5,
    name: "Claire Fontaine",
    role: "Responsable",
    school: "IUT de Bordeaux",
    email: "c.fontaine@iut-bdx.fr",
    phone: "+33 6 11 22 33 44",
    joined: "01 Avr 2025",
    status: "active",
    lastActive: "Il y a 15 min",
    requests: 4
  }
];

// Données mockées pour les demandes
const clientRequests: ClientRequest[] = [
  {
    id: 1,
    clientId: 1,
    clientName: "Marie Dupont",
    type: "template",
    title: "Création de badge personnalisé",
    description: "Nous aimerions un badge avec notre logo, photo, nom et un QR code pour le pointage.",
    status: "in-progress",
    priority: "high",
    createdAt: "10 Fév 2026",
    updatedAt: "12 Fév 2026",
    templateType: "badge",
    specifications: "Dimensions standards, format paysage",
    comments: [
      {
        id: 1,
        userId: 1,
        userName: "Support",
        content: "Nous avons bien reçu votre demande.",
        createdAt: "11 Fév 2026"
      }
    ]
  },
  {
    id: 2,
    clientId: 5,
    clientName: "Claire Fontaine",
    type: "feature",
    title: "Nouvelle fonctionnalité",
    description: "Nous aurions besoin d'un format d'export PDF spécifique.",
    status: "new",
    priority: "medium",
    createdAt: "14 Fév 2026",
    updatedAt: "14 Fév 2026"
  },
  {
    id: 3,
    clientId: 4,
    clientName: "Thomas Renard",
    type: "complaint",
    title: "Problème de synchronisation",
    description: "L'application ne se synchronise pas correctement.",
    status: "urgent",
    priority: "urgent",
    createdAt: "13 Fév 2026",
    updatedAt: "13 Fév 2026",
    comments: [
      {
        id: 3,
        userId: 1,
        userName: "Support",
        content: "Nous investiguons le problème.",
        createdAt: "13 Fév 2026"
      }
    ]
  },
  {
    id: 4,
    clientId: 2,
    clientName: "Pierre Lambert",
    type: "template",
    title: "Template de facture personnalisé",
    description: "Besoin d'un template de facture avec notre logo.",
    status: "completed",
    priority: "low",
    createdAt: "05 Fév 2026",
    updatedAt: "09 Fév 2026",
    templateType: "invoice"
  },
  {
    id: 5,
    clientId: 5,
    clientName: "Claire Fontaine",
    type: "support",
    title: "Assistance pour l'installation",
    description: "Besoin d'aide pour déployer l'application.",
    status: "in-progress",
    priority: "medium",
    createdAt: "12 Fév 2026",
    updatedAt: "13 Fév 2026"
  }
];

// Composant Badge de statut client
function StatusBadge({ status }: { status: Client['status'] }) {
  const statusConfig = {
    active: { label: 'Actif', icon: FiCheckCircle, bg: 'bg-[rgba(57,211,83,0.15)]', text: 'text-[#39d353]', border: 'border-[rgba(57,211,83,0.3)]' },
    inactive: { label: 'Inactif', icon: FiUserMinus, bg: 'bg-[#1c2330]', text: 'text-[#484f58]', border: 'border-[#21262d]' },
    suspended: { label: 'Suspendu', icon: FiUserX, bg: 'bg-[rgba(248,81,73,0.15)]', text: 'text-[#f85149]', border: 'border-[rgba(248,81,73,0.3)]' },
    pending: { label: 'En attente', icon: FiClock, bg: 'bg-[rgba(227,179,65,0.15)]', text: 'text-[#e3b341]', border: 'border-[rgba(227,179,65,0.3)]' }
  };
  const config = statusConfig[status];
  const Icon = config.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] border ${config.bg} ${config.text} ${config.border}`}>
      <Icon size={12} />
      {config.label}
    </span>
  );
}

// Composant Badge de statut de demande
function RequestStatusBadge({ status }: { status: ClientRequest['status'] }) {
  const statusConfig: Record<string, { label: string; icon: React.ElementType; bg: string; text: string; border: string }> = {
    'new': { label: 'Nouveau', icon: FiAlertCircle, bg: 'bg-[rgba(56,139,253,0.15)]', text: 'text-[#388bfd]', border: 'border-[rgba(56,139,253,0.3)]' },
    'in-progress': { label: 'En cours', icon: FiClock, bg: 'bg-[rgba(227,179,65,0.15)]', text: 'text-[#e3b341]', border: 'border-[rgba(227,179,65,0.3)]' },
    'completed': { label: 'Terminé', icon: FiCheckCircle, bg: 'bg-[rgba(57,211,83,0.15)]', text: 'text-[#39d353]', border: 'border-[rgba(57,211,83,0.3)]' },
    'rejected': { label: 'Rejeté', icon: FiXCircle, bg: 'bg-[rgba(248,81,73,0.15)]', text: 'text-[#f85149]', border: 'border-[rgba(248,81,73,0.3)]' },
    'urgent': { label: 'Urgent', icon: FiAlertCircle, bg: 'bg-[rgba(248,81,73,0.15)]', text: 'text-[#f85149]', border: 'border-[rgba(248,81,73,0.3)]' }
  };
  const config = statusConfig[status];
  const Icon = config.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] border ${config.bg} ${config.text} ${config.border}`}>
      <Icon size={12} />
      {config.label}
    </span>
  );
}

// Composant Badge de priorité
function PriorityBadge({ priority }: { priority: ClientRequest['priority'] }) {
  const priorityConfig = {
    'low': { label: 'Basse', icon: FiThumbsDown, bg: 'bg-[#1c2330]', text: 'text-[#484f58]', border: 'border-[#21262d]' },
    'medium': { label: 'Moyenne', icon: FiMinus, bg: 'bg-[rgba(227,179,65,0.15)]', text: 'text-[#e3b341]', border: 'border-[rgba(227,179,65,0.3)]' },
    'high': { label: 'Haute', icon: FiThumbsUp, bg: 'bg-[rgba(248,81,73,0.15)]', text: 'text-[#f85149]', border: 'border-[rgba(248,81,73,0.3)]' },
    'urgent': { label: 'Urgent', icon: FiAlertCircle, bg: 'bg-[rgba(248,81,73,0.15)]', text: 'text-[#f85149]', border: 'border-[rgba(248,81,73,0.3)]' }
  };
  const config = priorityConfig[priority];
  const Icon = config.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] border ${config.bg} ${config.text} ${config.border}`}>
      <Icon size={12} />
      {config.label}
    </span>
  );
}

// Composant Carte statistique
function StatCard({ label, value, icon: Icon, color, change }: StatCardProps) {
  return (
    <div className="bg-[#0d1117] p-5 relative overflow-hidden transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(0,0,0,0.3)] animate-[statSlide_0.4s_ease]">
      <div className="flex items-center justify-between mb-4">
        <span className="text-[11px] font-semibold tracking-[0.8px] uppercase text-[#484f58]">{label}</span>
        <div className="w-9 h-9 flex items-center justify-center transition-transform duration-300 group-hover:rotate-5 group-hover:scale-110" style={{ background: `${color}20` }}>
          <Icon size={18} color={color} />
        </div>
      </div>
      <div className="flex items-baseline justify-between mb-3">
        <span className="text-[28px] font-light text-[#e6edf3] leading-none">{value}</span>
        {change && (
          <span className={`flex items-center gap-1 text-xs ${change.positive ? 'text-[#39d353]' : 'text-[#f85149]'}`}>
            <FiAlertCircle size={12} />
            {change.value}%
          </span>
        )}
      </div>
      <div className="h-0.5 w-full opacity-30" style={{ background: `linear-gradient(90deg, ${color} ${(value/10)*100}%, transparent ${(value/10)*100}%)` }} />
    </div>
  );
}

// Composant Carte Client
function ClientCard({ client, onAction, onClick, index }: { client: Client; onAction: (action: string, client: Client) => void; onClick: () => void; index: number }) {
  const initials = client.name.split(' ').map(n => n[0]).join('');
  const colors = ['#388bfd', '#39d353', '#e3b341', '#f85149', '#a5a0e8'];
  const avatarColor = colors[client.id % colors.length];

  return (
    <div
      className="bg-[#0d1117] border border-[#21262d] p-5 transition-all duration-300 animate-[cardAppear_0.3s_ease_forwards] opacity-0 cursor-pointer hover:-translate-y-0.5 hover:border-[#30363d] hover:shadow-[0_8px_20px_rgba(0,0,0,0.2)]"
      style={{ animationDelay: `${index * 0.05}s` }}
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="w-12 h-12 bg-[#1c2330] border border-[#21262d] flex items-center justify-center font-semibold text-base transition-all duration-200 group-hover:scale-105 group-hover:border-[#388bfd]" style={{ background: `${avatarColor}20`, color: avatarColor }}>
          {initials}
        </div>
        <button className="bg-transparent border border-[#21262d] w-8 h-8 flex items-center justify-center text-[#8b949e] cursor-pointer transition-all duration-200 hover:bg-[#161b22] hover:border-[#30363d] hover:text-[#e6edf3]" onClick={(e) => { e.stopPropagation(); onAction('menu', client); }}>
          <FiMoreVertical size={16} />
        </button>
      </div>

      <div className="mb-4">
        <h3 className="text-base font-semibold mb-2">{client.name}</h3>
        <div className="flex items-center gap-1.5 text-xs text-[#8b949e] mb-1">
          <MdOutlineWorkOutline size={12} />
          <span>{client.role}</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-[#8b949e] mb-3">
          <HiOutlineBuildingOffice size={12} />
          <span>{client.school}</span>
        </div>

        <div className="my-4 py-3 border-t border-b border-[#21262d]">
          <div className="flex items-center gap-2 text-xs text-[#8b949e] py-1.5">
            <FiMail size={12} />
            <span>{client.email}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-[#8b949e] py-1.5">
            <FiPhone size={12} />
            <span>{client.phone}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-[#8b949e] py-1.5">
            <FiCalendar size={12} />
            <span>Inscrit le {client.joined}</span>
          </div>
        </div>

        {client.lastActive && (
          <div className="flex items-center gap-1.5 text-[11px] text-[#484f58] mt-3">
            <FiClock size={12} />
            <span>Dernière activité : {client.lastActive}</span>
          </div>
        )}

        {client.requests !== undefined && client.requests > 0 && (
          <div className="flex items-center gap-1.5 text-[11px] text-[#388bfd] mt-2">
            <FiMessageSquare size={12} />
            <span>{client.requests} demande(s) en cours</span>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between mt-4 pt-4 border-t border-[#21262d]">
        <StatusBadge status={client.status} />
        <div className="flex gap-2">
          <button className="w-[30px] h-[30px] flex items-center justify-center bg-transparent border border-[#21262d] text-[#8b949e] cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#388bfd] hover:border-[#388bfd] hover:text-white" onClick={(e) => { e.stopPropagation(); onAction('view', client); }} title="Voir détails">
            <FiEye size={14} />
          </button>
          <button className="w-[30px] h-[30px] flex items-center justify-center bg-transparent border border-[#21262d] text-[#8b949e] cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#388bfd] hover:border-[#388bfd] hover:text-white" onClick={(e) => { e.stopPropagation(); onAction('edit', client); }} title="Modifier">
            <FiEdit2 size={14} />
          </button>
          <button className="w-[30px] h-[30px] flex items-center justify-center bg-transparent border border-[#21262d] text-[#8b949e] cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#f85149] hover:border-[#f85149] hover:text-white" onClick={(e) => { e.stopPropagation(); onAction('delete', client); }} title="Supprimer">
            <FiTrash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

// Composant Carte de Demande
function RequestCard({ request, onAction }: { request: ClientRequest; onAction: (action: string, request: ClientRequest) => void }) {
  const getTypeIcon = () => {
    switch (request.type) {
      case 'template': return <HiOutlineViewGrid size={16} />;
      case 'feature': return <FiStar size={16} />;
      case 'bug': return <FiAlertCircle size={16} />;
      case 'support': return <RiCustomerServiceLine size={16} />;
      case 'complaint': return <FiFlag size={16} />;
      default: return <FiMessageSquare size={16} />;
    }
  };

  return (
    <div className={`bg-[#0d1117] p-5 border-l-[3px] border-l-transparent ${request.priority === 'urgent' ? 'border-l-[#f85149]' : request.priority === 'high' ? 'border-l-[#f85149]' : request.priority === 'medium' ? 'border-l-[#e3b341]' : ''}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[#161b22] border border-[#21262d] text-[11px] capitalize">
          {getTypeIcon()}
          <span>{request.type}</span>
        </div>
        <RequestStatusBadge status={request.status} />
      </div>

      <h3 className="text-[15px] font-semibold mb-2">{request.title}</h3>
      <p className="text-xs text-[#8b949e] leading-relaxed mb-3">{request.description}</p>

      {request.templateType && (
        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[rgba(56,139,253,0.08)] border border-[rgba(56,139,253,0.25)] text-[11px] text-[#388bfd] mb-3">
          <HiOutlineCollection size={12} />
          <span>Template de {request.templateType}</span>
        </div>
      )}

      <div className="flex flex-wrap gap-3 mb-3 text-[11px] text-[#484f58]">
        <span className="flex items-center gap-1"><FiUsers size={12} />{request.clientName}</span>
        <span className="flex items-center gap-1"><FiCalendar size={12} />{request.createdAt}</span>
        <PriorityBadge priority={request.priority} />
      </div>

      {request.comments && request.comments.length > 0 && (
        <div className="flex items-center gap-1.5 text-[11px] text-[#388bfd] mb-4">
          <BsChatDots size={12} />
          <span>{request.comments.length} commentaire(s)</span>
        </div>
      )}

      <div className="flex gap-2 flex-wrap mt-4 pt-4 border-t border-[#21262d]">
        <button className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-[#21262d] bg-transparent text-[#8b949e] text-[11px] cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#388bfd] hover:border-[#388bfd] hover:text-white" onClick={() => onAction('view', request)}>
          <FiEye size={14} /> Détails
        </button>
        <button className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-[#21262d] bg-transparent text-[#8b949e] text-[11px] cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#e3b341] hover:border-[#e3b341] hover:text-black" onClick={() => onAction('respond', request)}>
          <FiMessageSquare size={14} /> Répondre
        </button>
        {request.status === 'new' && (
          <button className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-[#21262d] bg-transparent text-[#8b949e] text-[11px] cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#39d353] hover:border-[#39d353] hover:text-black" onClick={() => onAction('accept', request)}>
            <FiCheck size={14} /> Accepter
          </button>
        )}
        {request.status === 'in-progress' && (
          <button className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-[#21262d] bg-transparent text-[#8b949e] text-[11px] cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#39d353] hover:border-[#39d353] hover:text-black" onClick={() => onAction('complete', request)}>
            <FiCheckCircle size={14} /> Terminer
          </button>
        )}
      </div>
    </div>
  );
}

// Composant de chat pour les demandes
function RequestChat({ request, onClose, onSendMessage }: { request: ClientRequest; onClose: () => void; onSendMessage: (message: string) => void }) {
  const [newMessage, setNewMessage] = useState('');

  const handleSend = () => {
    if (newMessage.trim()) {
      onSendMessage(newMessage);
      setNewMessage('');
    }
  };

  return (
    <div className="w-[500px] max-w-[90%] bg-[#0d1117] border border-[#21262d] flex flex-col max-h-[80vh]">
      <div className="flex items-center justify-between p-4 border-b border-[#21262d]">
        <h3 className="text-[15px] font-semibold">{request.title}</h3>
        <button className="bg-transparent border border-[#21262d] w-8 h-8 flex items-center justify-center text-[#8b949e] cursor-pointer hover:bg-[#161b22] hover:text-[#e6edf3]" onClick={onClose}>
          <FiX size={18} />
        </button>
      </div>

      <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-3 max-h-[400px]">
        {request.comments?.map(comment => (
          <div key={comment.id} className={`p-3 border ${comment.userName === 'Support' ? 'bg-[rgba(56,139,253,0.08)] border-[rgba(56,139,253,0.25)] ml-5' : 'bg-[#161b22] border-[#21262d] mr-5'}`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold">{comment.userName}</span>
              <span className="text-[10px] text-[#484f58]">{comment.createdAt}</span>
            </div>
            <p className="text-xs text-[#8b949e] leading-relaxed">{comment.content}</p>
          </div>
        ))}
        {(!request.comments || request.comments.length === 0) && (
          <div className="text-center p-10 text-[#484f58]">
            <BsChatDots size={24} className="mx-auto mb-4" />
            <p>Aucun message pour le moment</p>
          </div>
        )}
      </div>

      <div className="flex gap-2 p-4 border-t border-[#21262d]">
        <input
          type="text"
          placeholder="Écrivez votre message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          className="flex-1 px-3 py-2 bg-[#161b22] border border-[#21262d] text-[#e6edf3] text-[13px] focus:border-[#388bfd] focus:outline-none"
        />
        <button className="w-10 h-10 flex items-center justify-center bg-[#388bfd] border-none text-white cursor-pointer hover:bg-[#58a6ff]" onClick={handleSend}>
          <FiSend size={16} />
        </button>
      </div>
    </div>
  );
}

// Composant principal
export default function Clients({ onNotify }: ClientsProps) {
  const [activeTab, setActiveTab] = useState<'clients' | 'requests'>('clients');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<ClientRequest | null>(null);
  const [showChat, setShowChat] = useState(false);

  // Statistiques
  const stats = {
    total: clients.length,
    active: clients.filter(c => c.status === 'active').length,
    inactive: clients.filter(c => c.status === 'inactive').length,
    suspended: clients.filter(c => c.status === 'suspended').length,
    pending: clients.filter(c => c.status === 'pending').length,
    newRequests: clientRequests.filter(r => r.status === 'new').length,
    urgentRequests: clientRequests.filter(r => r.priority === 'urgent').length,
    totalRequests: clientRequests.length
  };

  // Filtrage des clients
  const filteredClients = clients.filter(client => {
    const matchesSearch =
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.school.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || client.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // Filtrage des demandes
  const filteredRequests = clientRequests.filter(request => {
    const matchesSearch =
      request.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.clientName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || request.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleClientAction = (action: string, client: Client) => {
    const messages = {
      view: `Affichage des détails de ${client.name}`,
      edit: `Modification de ${client.name}`,
      delete: `${client.name} a été supprimé`,
      menu: `Menu ouvert pour ${client.name}`
    };
    onNotify(messages[action as keyof typeof messages] || 'Action effectuée', 'blue');
  };

  const handleRequestAction = (action: string, request: ClientRequest) => {
    const messages = {
      view: `Consultation de la demande "${request.title}"`,
      respond: `Réponse à la demande "${request.title}"`,
      accept: `Demande "${request.title}" acceptée`,
      complete: `Demande "${request.title}" terminée`,
      reject: `Demande "${request.title}" rejetée`
    };
    onNotify(messages[action as keyof typeof messages] || 'Action effectuée',
      action === 'reject' ? 'red' : action === 'accept' || action === 'complete' ? 'green' : 'blue'
    );

    if (action === 'respond') {
      setSelectedRequest(request);
      setShowChat(true);
    }
  };

  const handleSendMessage = () => {
    onNotify('Message envoyé', 'green');
  };

  return (
    <div className="animate-[fadeIn_0.4s_ease]">
      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes statSlide { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes cardAppear { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .group\\:hover\\:rotate-5:hover { transform: rotate(5deg); }
        .group\\:hover\\:scale-110:hover { transform: scale(1.1); }
        .group\\:hover\\:scale-105:hover { transform: scale(1.05); }
        .group\\:hover\\:border-\\[\\#388bfd\\]:hover { border-color: #388bfd; }
      `}</style>

      {/* En-tête */}
      <div className="flex items-center justify-between mb-6 max-[768px]:flex-col max-[768px]:items-start">
        <h1 className="flex items-center gap-3 text-2xl font-semibold">
          <FiUsers size={24} />
          Clients & Demandes
        </h1>
        <div className="flex gap-2 max-[768px]:w-full max-[768px]:mt-3">
          <button className="inline-flex items-center gap-2 px-4 py-2 text-[13px] font-medium cursor-pointer transition-all duration-200 bg-transparent border border-[#21262d] text-[#8b949e] hover:border-[#30363d] hover:text-[#e6edf3]" onClick={() => onNotify('Données actualisées', 'green')}>
            <FiRefreshCw size={14} /> Actualiser
          </button>
          <button className="inline-flex items-center gap-2 px-4 py-2 text-[13px] font-medium cursor-pointer transition-all duration-200 bg-[#388bfd] text-white hover:bg-[#58a6ff]" onClick={() => onNotify('Nouveau client', 'blue')}>
            <FiPlus size={14} /> Ajouter un client
          </button>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-5 gap-px bg-[#21262d] border border-[#21262d] mb-6 max-[1200px]:grid-cols-3 max-[768px]:grid-cols-2">
        <StatCard label="Total clients" value={stats.total} icon={HiOutlineUserGroup} color="#388bfd" />
        <StatCard label="Actifs" value={stats.active} icon={FiUserCheck} color="#39d353" change={{ value: 12, positive: true }} />
        <StatCard label="Demandes" value={stats.totalRequests} icon={FiMessageSquare} color="#e3b341" />
        <StatCard label="Nouvelles demandes" value={stats.newRequests} icon={FiAlertCircle} color="#f85149" />
        <StatCard label="Urgentes" value={stats.urgentRequests} icon={FiFlag} color="#f85149" />
      </div>

      {/* Onglets */}
      <div className="flex gap-1 mb-6 border-b border-[#21262d] overflow-x-auto">
        <button
          className={`flex items-center gap-2 px-5 py-3 bg-transparent border-none border-b-2 border-transparent text-[#8b949e] cursor-pointer text-[13px] font-medium transition-all duration-200 hover:text-[#e6edf3] hover:bg-[#161b22] ${activeTab === 'clients' ? '!text-[#388bfd] !border-b-[#388bfd] !bg-[#1c2330]' : ''}`}
          onClick={() => setActiveTab('clients')}
        >
          <FiUsers size={16} />
          Clients ({clients.length})
        </button>
        <button
          className={`flex items-center gap-2 px-5 py-3 bg-transparent border-none border-b-2 border-transparent text-[#8b949e] cursor-pointer text-[13px] font-medium transition-all duration-200 hover:text-[#e6edf3] hover:bg-[#161b22] ${activeTab === 'requests' ? '!text-[#388bfd] !border-b-[#388bfd] !bg-[#1c2330]' : ''}`}
          onClick={() => setActiveTab('requests')}
        >
          <FiMessageSquare size={16} />
          Demandes ({clientRequests.length})
          {stats.newRequests > 0 && (
            <span className="bg-[#f85149] text-white text-[10px] px-1.5 py-0.5 ml-1">{stats.newRequests}</span>
          )}
        </button>
      </div>

      {/* Barre de recherche et filtres */}
      <div className="flex gap-4 mb-6 max-[768px]:flex-col">
        <div className="flex-1 relative">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[#484f58]" size={16} />
          <input
            type="text"
            placeholder="Rechercher..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-10 pl-10 pr-3 bg-[#161b22] border border-[#21262d] text-[#e6edf3] text-[13px] transition-all duration-200 focus:border-[#388bfd] focus:shadow-[0_0_0_3px_rgba(56,139,253,0.1)] focus:outline-none"
          />
        </div>
        <div className="relative min-w-[160px] max-[768px]:w-full">
          <FiFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-[#484f58] pointer-events-none" size={14} />
          <select
            className="w-full h-10 pl-9 pr-3 bg-[#161b22] border border-[#21262d] text-[#e6edf3] text-[13px] cursor-pointer appearance-none transition-all duration-200 focus:border-[#388bfd] focus:outline-none"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">Tous</option>
            {activeTab === 'clients' ? (
              <>
                <option value="active">Actifs</option>
                <option value="inactive">Inactifs</option>
                <option value="suspended">Suspendus</option>
                <option value="pending">En attente</option>
              </>
            ) : (
              <>
                <option value="new">Nouvelles</option>
                <option value="in-progress">En cours</option>
                <option value="completed">Terminées</option>
                <option value="rejected">Rejetées</option>
                <option value="urgent">Urgentes</option>
              </>
            )}
          </select>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-px bg-[#21262d] border border-[#21262d]">
        {/* Liste des clients ou demandes */}
        <div className="bg-[#0d1117] p-6 max-h-[calc(100vh-300px)] overflow-y-auto">
          {activeTab === 'clients' ? (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-4">
              {filteredClients.map((client, index) => (
                <ClientCard
                  key={client.id}
                  client={client}
                  onAction={handleClientAction}
                  onClick={() => setSelectedClient(client)}
                  index={index}
                />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-px bg-[#21262d] border border-[#21262d]">
              {filteredRequests.map(request => (
                <RequestCard
                  key={request.id}
                  request={request}
                  onAction={handleRequestAction}
                />
              ))}
            </div>
          )}

          {((activeTab === 'clients' && filteredClients.length === 0) ||
            (activeTab === 'requests' && filteredRequests.length === 0)) && (
            <div className="text-center p-12 text-[#484f58]">
              <FiInbox size={48} className="mx-auto mb-4 opacity-50" />
              <h3 className="text-base font-medium mb-2 text-[#8b949e]">Aucun élément trouvé</h3>
              <p className="text-xs">Essayez de modifier vos filtres de recherche</p>
            </div>
          )}
        </div>

        {/* Panneau de détails */}
        {activeTab === 'clients' && selectedClient && (
          <div className="bg-[#0d1117] p-5 border-l border-[#21262d] max-h-[calc(100vh-300px)] overflow-y-auto max-[768px]:border-l-0 max-[768px]:border-t max-[768px]:border-t-[#21262d]">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-semibold">Détails du client</h2>
              <button className="bg-transparent border border-[#21262d] w-8 h-8 flex items-center justify-center text-[#8b949e] cursor-pointer hover:bg-[#161b22] hover:text-[#e6edf3]" onClick={() => setSelectedClient(null)}>
                <FiX size={18} />
              </button>
            </div>

            <div className="flex flex-col gap-4">
              <div className="w-20 h-20 bg-[#1c2330] border border-[#21262d] flex items-center justify-center text-[32px] font-semibold text-[#388bfd] mb-2">
                {selectedClient.name.split(' ').map(n => n[0]).join('')}
              </div>
              <h3 className="text-xl font-semibold">{selectedClient.name}</h3>
              <p className="text-[13px] text-[#8b949e]">{selectedClient.role}</p>
              <p className="text-[13px] text-[#8b949e]">{selectedClient.school}</p>

              <div className="flex flex-col gap-3 py-4 border-t border-b border-[#21262d] text-[13px] text-[#8b949e]">
                <div className="flex items-center gap-2"><FiMail size={14} /> {selectedClient.email}</div>
                <div className="flex items-center gap-2"><FiPhone size={14} /> {selectedClient.phone}</div>
                <div className="flex items-center gap-2"><FiCalendar size={14} /> Inscrit le {selectedClient.joined}</div>
                {selectedClient.lastActive && (
                  <div className="flex items-center gap-2"><FiClock size={14} /> Dernière activité : {selectedClient.lastActive}</div>
                )}
              </div>

              <div className="mt-2">
                <StatusBadge status={selectedClient.status} />
              </div>

              {selectedClient.notes && (
                <div className="py-4 border-b border-[#21262d]">
                  <h4 className="text-[13px] font-semibold mb-2">Notes</h4>
                  <p className="text-xs text-[#8b949e]">{selectedClient.notes}</p>
                </div>
              )}

              <h4 className="text-[13px] font-semibold">Demandes récentes</h4>
              <div className="flex flex-col gap-2 mt-2">
                {clientRequests.filter(r => r.clientId === selectedClient.id).map(request => (
                  <div
                    key={request.id}
                    className="p-3 bg-[#161b22] border border-[#21262d] cursor-pointer transition-all duration-200 hover:border-[#388bfd]"
                    onClick={() => {
                      setSelectedRequest(request);
                      setShowChat(true);
                    }}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium">{request.title}</span>
                      <RequestStatusBadge status={request.status} />
                    </div>
                    <p className="text-[11px] text-[#484f58]">{request.description.substring(0, 60)}...</p>
                  </div>
                ))}
                {clientRequests.filter(r => r.clientId === selectedClient.id).length === 0 && (
                  <p className="text-xs text-[#484f58] text-center py-5">Aucune demande pour ce client</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal de chat */}
      {showChat && selectedRequest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1000]">
          <RequestChat
            request={selectedRequest}
            onClose={() => {
              setShowChat(false);
              setSelectedRequest(null);
            }}
            onSendMessage={handleSendMessage}
          />
        </div>
      )}
    </div>
  );
}