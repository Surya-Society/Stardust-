// Clients.tsx (version corrigée)
import { useState } from 'react';
import {
  FiUsers, FiPlus, FiSearch, FiMail, FiPhone,
  FiCalendar, FiMoreVertical, FiEdit2, FiTrash2,
  FiUserCheck, FiUserX, FiUserMinus, FiFilter,
  FiDownload, FiRefreshCw, FiStar, FiBriefcase,
  FiMapPin, FiClock, FiCheckCircle, FiXCircle,
  FiAlertCircle, FiEye, FiMessageSquare, FiFileText,
  FiCreditCard, FiImage, FiLayout, FiPrinter,
  FiHelpCircle, FiThumbsUp, FiThumbsDown, FiFlag,
  FiArchive, FiInbox, FiSend, FiCheck, FiX , FiMinus
} from 'react-icons/fi';
import {
  HiOutlineBuildingOffice,
  HiOutlineUserGroup,
  HiOutlineDocumentText
} from 'react-icons/hi2';
import { HiOutlineViewGrid } from "react-icons/hi";
import { HiOutlineCollection } from "react-icons/hi";
import { MdOutlineWorkOutline, MdOutlineFeedback } from 'react-icons/md';
import { BsEnvelopePaper, BsChatDots, BsFileEarmarkText } from 'react-icons/bs';
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
  status: 'new' | 'in-progress' | 'completed' | 'rejected' | 'urgent'; // Ajout de 'urgent'
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

interface StatusBadgeProps {
  status: Client['status'];
}

interface RequestStatusBadgeProps {
  status: ClientRequest['status'];
}

interface PriorityBadgeProps {
  priority: ClientRequest['priority'];
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

interface ClientCardProps {
  client: Client;
  onAction: (action: string, client: Client) => void;
  onClick: () => void;
  index: number;
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

// Données mockées pour les demandes (corrigées)
const clientRequests: ClientRequest[] = [
  {
    id: 1,
    clientId: 1,
    clientName: "Marie Dupont",
    type: "template",
    title: "Création de badge personnalisé",
    description: "Nous aimerions un badge avec notre logo, photo, nom et un QR code pour le pointage. Le badge doit inclure les couleurs de l'école (bleu et blanc).",
    status: "in-progress",
    priority: "high",
    createdAt: "10 Fév 2026",
    updatedAt: "12 Fév 2026",
    templateType: "badge",
    specifications: "Dimensions standards, format paysage, QR code en bas à droite",
    comments: [
      {
        id: 1,
        userId: 1,
        userName: "Support",
        content: "Nous avons bien reçu votre demande. Pouvez-vous nous fournir votre logo en haute résolution ?",
        createdAt: "11 Fév 2026"
      },
      {
        id: 2,
        userId: 1,
        userName: "Marie Dupont",
        content: "Je vous envoie le logo par email.",
        createdAt: "11 Fév 2026"
      }
    ]
  },
  {
    id: 2,
    clientId: 5,
    clientName: "Claire Fontaine",
    type: "feature",
    title: "Nouvelle fonctionnalité pour les relevés de notes",
    description: "Nous aurions besoin d'un format d'export PDF spécifique pour nos relevés de notes avec un en-tête personnalisé.",
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
    description: "L'application ne se synchronise pas correctement depuis 2 jours. Les notes des élèves ne sont pas à jour.",
    status: "urgent", // Gardé comme urgent
    priority: "urgent",
    createdAt: "13 Fév 2026",
    updatedAt: "13 Fév 2026",
    comments: [
      {
        id: 3,
        userId: 1,
        userName: "Support",
        content: "Nous investiguons le problème. Pouvez-vous nous donner plus de détails ?",
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
    description: "Besoin d'un template de facture avec notre logo, numéro de TVA et conditions de paiement spécifiques.",
    status: "completed",
    priority: "low",
    createdAt: "05 Fév 2026",
    updatedAt: "09 Fév 2026",
    templateType: "invoice",
    specifications: "Format A4, avec tableau détaillé"
  },
  {
    id: 5,
    clientId: 5,
    clientName: "Claire Fontaine",
    type: "support",
    title: "Assistance pour l'installation",
    description: "Nous avons besoin d'aide pour déployer l'application sur nos nouveaux ordinateurs.",
    status: "in-progress",
    priority: "medium",
    createdAt: "12 Fév 2026",
    updatedAt: "13 Fév 2026"
  }
];

// Composant Badge de statut client
function StatusBadge({ status }: StatusBadgeProps) {
  const statusConfig = {
    active: { class: 'status-active', label: 'Actif', icon: FiCheckCircle, color: '#39d353' },
    inactive: { class: 'status-inactive', label: 'Inactif', icon: FiUserMinus, color: '#8b949e' },
    suspended: { class: 'status-suspended', label: 'Suspendu', icon: FiUserX, color: '#f85149' },
    pending: { class: 'status-pending', label: 'En attente', icon: FiClock, color: '#e3b341' }
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <span className={`status-badge ${config.class}`}>
      <Icon size={12} />
      {config.label}
    </span>
  );
}

// Composant Badge de statut de demande (corrigé)
function RequestStatusBadge({ status }: RequestStatusBadgeProps) {
  const statusConfig = {
    'new': { class: 'request-status-new', label: 'Nouveau', icon: FiAlertCircle, color: '#388bfd' },
    'in-progress': { class: 'request-status-progress', label: 'En cours', icon: FiClock, color: '#e3b341' },
    'completed': { class: 'request-status-completed', label: 'Terminé', icon: FiCheckCircle, color: '#39d353' },
    'rejected': { class: 'request-status-rejected', label: 'Rejeté', icon: FiXCircle, color: '#f85149' },
    'urgent': { class: 'request-status-urgent', label: 'Urgent', icon: FiAlertCircle, color: '#f85149' } // Ajout du statut urgent
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <span className={`request-status-badge ${config.class}`}>
      <Icon size={12} />
      {config.label}
    </span>
  );
}

// Composant Badge de priorité
function PriorityBadge({ priority }: PriorityBadgeProps) {
  const priorityConfig = {
    'low': { class: 'priority-low', label: 'Basse', icon: FiThumbsDown, color: '#8b949e' },
    'medium': { class: 'priority-medium', label: 'Moyenne', icon: FiMinus, color: '#e3b341' },
    'high': { class: 'priority-high', label: 'Haute', icon: FiThumbsUp, color: '#f85149' },
    'urgent': { class: 'priority-urgent', label: 'Urgent', icon: FiAlertCircle, color: '#f85149' }
  };

  const config = priorityConfig[priority];
  const Icon = config.icon;

  return (
    <span className={`priority-badge ${config.class}`}>
      <Icon size={12} />
      {config.label}
    </span>
  );
}

// Composant Carte statistique
function StatCard({ label, value, icon: Icon, color, change }: StatCardProps) {
  return (
    <div className="stat-card">
      <div className="stat-header">
        <span className="stat-label">{label}</span>
        <div className="stat-icon-wrapper" style={{ background: `${color}20` }}>
          <Icon size={18} color={color} />
        </div>
      </div>
      <div className="stat-content">
        <span className="stat-value">{value}</span>
        {change && (
          <span className={`stat-change ${change.positive ? 'positive' : 'negative'}`}>
            <FiAlertCircle size={12} />
            {change.value}%
          </span>
        )}
      </div>
      <div className="stat-progress" style={{ background: `linear-gradient(90deg, ${color} ${(value/10)*100}%, transparent ${(value/10)*100}%)` }} />
    </div>
  );
}

// Composant Carte Client
function ClientCard({ client, onAction, onClick, index }: ClientCardProps) {
  const initials = client.name.split(' ').map(n => n[0]).join('');
  const colors = ['#388bfd', '#39d353', '#e3b341', '#f85149', '#a5a0e8'];
  const avatarColor = colors[client.id % colors.length];

  return (
    <div
      className="client-card"
      style={{ animationDelay: `${index * 0.05}s` }}
      onClick={onClick}
    >
      <div className="card-header">
        <div className="card-avatar" style={{ background: `${avatarColor}20`, color: avatarColor }}>
          {initials}
        </div>
        <button className="card-menu" onClick={(e) => { e.stopPropagation(); onAction('menu', client); }}>
          <FiMoreVertical size={16} />
        </button>
      </div>

      <div className="card-body">
        <h3 className="client-name">{client.name}</h3>
        <div className="client-role">
          <MdOutlineWorkOutline size={12} />
          <span>{client.role}</span>
        </div>
        <div className="client-school">
          <HiOutlineBuildingOffice size={12} />
          <span>{client.school}</span>
        </div>

        <div className="client-contact">
          <div className="contact-item">
            <FiMail size={12} />
            <span>{client.email}</span>
          </div>
          <div className="contact-item">
            <FiPhone size={12} />
            <span>{client.phone}</span>
          </div>
          <div className="contact-item">
            <FiCalendar size={12} />
            <span>Inscrit le {client.joined}</span>
          </div>
        </div>

        {client.lastActive && (
          <div className="last-active">
            <FiClock size={12} />
            <span>Dernière activité : {client.lastActive}</span>
          </div>
        )}

        {client.requests !== undefined && client.requests > 0 && (
          <div className="request-count">
            <FiMessageSquare size={12} />
            <span>{client.requests} demande(s) en cours</span>
          </div>
        )}
      </div>

      <div className="card-footer">
        <StatusBadge status={client.status} />
        <div className="card-actions">
          <button className="action-icon" onClick={(e) => { e.stopPropagation(); onAction('view', client); }} title="Voir détails">
            <FiEye size={14} />
          </button>
          <button className="action-icon" onClick={(e) => { e.stopPropagation(); onAction('edit', client); }} title="Modifier">
            <FiEdit2 size={14} />
          </button>
          <button className="action-icon delete" onClick={(e) => { e.stopPropagation(); onAction('delete', client); }} title="Supprimer">
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
      case 'custom': return <FiFileText size={16} />;
      default: return <FiMessageSquare size={16} />;
    }
  };

  return (
    <div className={`request-card priority-${request.priority}`}>
      <div className="card-header">
        <div className="request-type">
          {getTypeIcon()}
          <span className="type-label">{request.type}</span>
        </div>
        <RequestStatusBadge status={request.status} />
      </div>

      <h3 className="request-title">{request.title}</h3>
      <p className="request-description">{request.description}</p>

      {request.templateType && (
        <div className="template-info">
          <HiOutlineCollection size={12} />
          <span>Template de {request.templateType}</span>
        </div>
      )}

      <div className="request-meta">
        <span className="client">
          <FiUsers size={12} />
          {request.clientName}
        </span>
        <span className="date">
          <FiCalendar size={12} />
          {request.createdAt}
        </span>
        <PriorityBadge priority={request.priority} />
      </div>

      {request.comments && request.comments.length > 0 && (
        <div className="comment-indicator">
          <BsChatDots size={12} />
          <span>{request.comments.length} commentaire(s)</span>
        </div>
      )}

      <div className="card-footer">
        <button className="action-btn view" onClick={() => onAction('view', request)}>
          <FiEye size={14} /> Détails
        </button>
        <button className="action-btn respond" onClick={() => onAction('respond', request)}>
          <FiMessageSquare size={14} /> Répondre
        </button>
        {request.status === 'new' && (
          <button className="action-btn accept" onClick={() => onAction('accept', request)}>
            <FiCheck size={14} /> Accepter
          </button>
        )}
        {request.status === 'in-progress' && (
          <button className="action-btn complete" onClick={() => onAction('complete', request)}>
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
    <div className="request-chat">
      <div className="chat-header">
        <h3>{request.title}</h3>
        <button className="close-btn" onClick={onClose}>
          <FiX size={18} />
        </button>
      </div>

      <div className="chat-messages">
        {request.comments?.map(comment => (
          <div key={comment.id} className={`message ${comment.userName === 'Support' ? 'support' : 'client'}`}>
            <div className="message-header">
              <span className="author">{comment.userName}</span>
              <span className="time">{comment.createdAt}</span>
            </div>
            <p className="content">{comment.content}</p>
          </div>
        ))}
        {(!request.comments || request.comments.length === 0) && (
          <div className="no-messages">
            <BsChatDots size={24} />
            <p>Aucun message pour le moment</p>
          </div>
        )}
      </div>

      <div className="chat-input">
        <input
          type="text"
          placeholder="Écrivez votre message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
        />
        <button onClick={handleSend}>
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

  const handleSendMessage = (message: string) => {
    onNotify('Message envoyé', 'green');
    // Ici vous ajouteriez la logique pour sauvegarder le message
  };

  return (
    <div className="clients-page">
      {/* En-tête */}
      <div className="page-header">
        <h1 className="page-title">
          <FiUsers size={24} />
          Clients & Demandes
        </h1>
        <div className="header-actions">
          <button className="btn btn-ghost" onClick={() => onNotify('Données actualisées', 'green')}>
            <FiRefreshCw size={14} /> Actualiser
          </button>
          <button className="btn btn-primary" onClick={() => onNotify('Nouveau client', 'blue')}>
            <FiPlus size={14} /> Ajouter un client
          </button>
        </div>
      </div>

      {/* Statistiques */}
      <div className="stats-grid">
        <StatCard
          label="Total clients"
          value={stats.total}
          icon={HiOutlineUserGroup}
          color="#388bfd"
        />
        <StatCard
          label="Actifs"
          value={stats.active}
          icon={FiUserCheck}
          color="#39d353"
          change={{ value: 12, positive: true }}
        />
        <StatCard
          label="Demandes"
          value={stats.totalRequests}
          icon={FiMessageSquare}
          color="#e3b341"
        />
        <StatCard
          label="Nouvelles demandes"
          value={stats.newRequests}
          icon={FiAlertCircle}
          color="#f85149"
        />
        <StatCard
          label="Urgentes"
          value={stats.urgentRequests}
          icon={FiFlag}
          color="#f85149"
        />
      </div>

      {/* Onglets */}
      <div className="tabs">
        <button
          className={`tab ${activeTab === 'clients' ? 'active' : ''}`}
          onClick={() => setActiveTab('clients')}
        >
          <FiUsers size={16} />
          Clients ({clients.length})
        </button>
        <button
          className={`tab ${activeTab === 'requests' ? 'active' : ''}`}
          onClick={() => setActiveTab('requests')}
        >
          <FiMessageSquare size={16} />
          Demandes ({clientRequests.length})
          {stats.newRequests > 0 && (
            <span className="badge">{stats.newRequests}</span>
          )}
        </button>
      </div>

      {/* Barre de recherche et filtres */}
      <div className="filters-bar">
        <div className="search-wrapper">
          <FiSearch className="search-icon" size={16} />
          <input
            type="text"
            placeholder="Rechercher..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filter-select-wrapper">
          <FiFilter className="filter-icon" size={14} />
          <select
            className="filter-select"
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
      <div className="content-grid">
        {/* Liste des clients ou demandes */}
        <div className="items-list">
          {activeTab === 'clients' ? (
            <div className="clients-grid">
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
            <div className="requests-grid">
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
            <div className="empty-state">
              <FiInbox size={48} />
              <h3>Aucun élément trouvé</h3>
              <p>Essayez de modifier vos filtres de recherche</p>
            </div>
          )}
        </div>

        {/* Panneau de détails */}
        {activeTab === 'clients' && selectedClient && (
          <div className="detail-panel">
            <div className="detail-header">
              <h2>Détails du client</h2>
              <button className="close-btn" onClick={() => setSelectedClient(null)}>
                <FiX size={18} />
              </button>
            </div>

            <div className="client-detail">
              <div className="detail-avatar">
                {selectedClient.name.split(' ').map(n => n[0]).join('')}
              </div>
              <h3>{selectedClient.name}</h3>
              <p className="detail-role">{selectedClient.role}</p>
              <p className="detail-school">{selectedClient.school}</p>

              <div className="detail-info">
                <div><FiMail size={14} /> {selectedClient.email}</div>
                <div><FiPhone size={14} /> {selectedClient.phone}</div>
                <div><FiCalendar size={14} /> Inscrit le {selectedClient.joined}</div>
                {selectedClient.lastActive && (
                  <div><FiClock size={14} /> Dernière activité : {selectedClient.lastActive}</div>
                )}
              </div>

              <div className="detail-status">
                <StatusBadge status={selectedClient.status} />
              </div>

              {selectedClient.notes && (
                <div className="detail-notes">
                  <h4>Notes</h4>
                  <p>{selectedClient.notes}</p>
                </div>
              )}

              <h4>Demandes récentes</h4>
              <div className="client-requests">
                {clientRequests
                  .filter(r => r.clientId === selectedClient.id)
                  .map(request => (
                    <div
                      key={request.id}
                      className="request-item"
                      onClick={() => {
                        setSelectedRequest(request);
                        setShowChat(true);
                      }}
                    >
                      <div className="request-item-header">
                        <span className="request-item-title">{request.title}</span>
                        <RequestStatusBadge status={request.status} />
                      </div>
                      <p className="request-item-desc">{request.description.substring(0, 60)}...</p>
                    </div>
                  ))}
                {clientRequests.filter(r => r.clientId === selectedClient.id).length === 0 && (
                  <p className="no-requests">Aucune demande pour ce client</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal de chat */}
      {showChat && selectedRequest && (
        <div className="chat-modal">
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

      <style>{`
        .clients-page {
          animation: fadeIn 0.4s ease;
        }

        .page-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 24px;
        }

        .page-title {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 24px;
          font-weight: 600;
        }

        .header-actions {
          display: flex;
          gap: 8px;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 1px;
          background: var(--border);
          border: 1px solid var(--border);
          margin-bottom: 24px;
        }

        .stat-card {
          background: var(--bg-panel);
          padding: 20px;
          position: relative;
          overflow: hidden;
          transition: all 0.3s ease;
          animation: statSlide 0.4s ease;
        }

        .stat-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
        }

        .stat-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 16px;
        }

        .stat-label {
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.8px;
          text-transform: uppercase;
          color: var(--text-muted);
        }

        .stat-icon-wrapper {
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.3s ease;
        }

        .stat-card:hover .stat-icon-wrapper {
          transform: rotate(5deg) scale(1.1);
        }

        .stat-content {
          display: flex;
          align-items: baseline;
          justify-content: space-between;
          margin-bottom: 12px;
        }

        .stat-value {
          font-size: 28px;
          font-weight: 300;
          color: var(--text-primary);
          line-height: 1;
        }

        .stat-change {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 12px;
        }

        .stat-change.positive { color: var(--accent-teal); }
        .stat-change.negative { color: var(--accent-red); }

        .stat-progress {
          height: 2px;
          width: 100%;
          opacity: 0.3;
        }

        .tabs {
          display: flex;
          gap: 4px;
          margin-bottom: 24px;
          border-bottom: 1px solid var(--border);
        }

        .tab {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 20px;
          background: transparent;
          border: none;
          border-bottom: 2px solid transparent;
          color: var(--text-secondary);
          cursor: pointer;
          font-size: 13px;
          font-weight: 500;
          position: relative;
        }

        .tab:hover {
          color: var(--text-primary);
          background: var(--bg-surface);
        }

        .tab.active {
          color: var(--accent-blue);
          border-bottom-color: var(--accent-blue);
          background: var(--bg-elevated);
        }

        .tab .badge {
          background: var(--accent-red);
          color: white;
          font-size: 10px;
          padding: 2px 6px;
          margin-left: 4px;
        }

        .filters-bar {
          display: flex;
          gap: 16px;
          margin-bottom: 24px;
        }

        .search-wrapper {
          flex: 1;
          position: relative;
        }

        .search-icon {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-muted);
        }

        .search-input {
          width: 100%;
          height: 40px;
          padding: 0 12px 0 40px;
          background: var(--bg-surface);
          border: 1px solid var(--border);
          color: var(--text-primary);
          font-size: 13px;
          transition: all 0.2s ease;
        }

        .search-input:focus {
          border-color: var(--accent-blue);
          box-shadow: 0 0 0 3px rgba(56, 139, 253, 0.1);
          outline: none;
        }

        .filter-select-wrapper {
          position: relative;
          min-width: 160px;
        }

        .filter-icon {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-muted);
          pointer-events: none;
        }

        .filter-select {
          width: 100%;
          height: 40px;
          padding: 0 12px 0 36px;
          background: var(--bg-surface);
          border: 1px solid var(--border);
          color: var(--text-primary);
          font-size: 13px;
          cursor: pointer;
          appearance: none;
          transition: all 0.2s ease;
        }

        .filter-select:focus {
          border-color: var(--accent-blue);
          outline: none;
        }

        .content-grid {
          display: grid;
          grid-template-columns: 1fr 350px;
          gap: 1px;
          background: var(--border);
          border: 1px solid var(--border);
        }

        .items-list {
          background: var(--bg-panel);
          padding: 24px;
          max-height: calc(100vh - 300px);
          overflow-y: auto;
        }

        .clients-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 16px;
        }

        .client-card {
          background: var(--bg-panel);
          border: 1px solid var(--border);
          padding: 20px;
          transition: all 0.3s ease;
          animation: cardAppear 0.3s ease forwards;
          opacity: 0;
          cursor: pointer;
        }

        .client-card:hover {
          transform: translateY(-2px);
          border-color: var(--border-bright);
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
        }

        .card-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          margin-bottom: 16px;
        }

        .card-avatar {
          width: 48px;
          height: 48px;
          background: var(--bg-elevated);
          border: 1px solid var(--border);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          font-size: 16px;
          transition: all 0.2s ease;
        }

        .client-card:hover .card-avatar {
          transform: scale(1.05);
          border-color: var(--accent-blue);
        }

        .card-menu {
          background: transparent;
          border: 1px solid var(--border);
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-secondary);
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .card-menu:hover {
          background: var(--bg-surface);
          border-color: var(--border-bright);
          color: var(--text-primary);
        }

        .client-name {
          font-size: 16px;
          font-weight: 600;
          margin-bottom: 8px;
        }

        .client-role, .client-school {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          color: var(--text-secondary);
          margin-bottom: 4px;
        }

        .client-contact {
          margin: 16px 0;
          padding: 12px 0;
          border-top: 1px solid var(--border);
          border-bottom: 1px solid var(--border);
        }

        .contact-item {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 12px;
          color: var(--text-secondary);
          padding: 6px 0;
        }

        .last-active, .request-count {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 11px;
          color: var(--text-muted);
          margin-top: 12px;
        }

        .request-count {
          color: var(--accent-blue);
        }

        .card-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-top: 16px;
          padding-top: 16px;
          border-top: 1px solid var(--border);
        }

        .card-actions {
          display: flex;
          gap: 8px;
        }

        .action-icon {
          width: 30px;
          height: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: transparent;
          border: 1px solid var(--border);
          color: var(--text-secondary);
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .action-icon:hover {
          transform: translateY(-2px);
        }

        .action-icon:not(.delete):hover {
          background: var(--accent-blue);
          border-color: var(--accent-blue);
          color: white;
        }

        .action-icon.delete:hover {
          background: var(--accent-red);
          border-color: var(--accent-red);
          color: white;
        }

        .requests-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1px;
          background: var(--border);
          border: 1px solid var(--border);
        }

        .request-card {
          background: var(--bg-panel);
          padding: 20px;
          border-left: 3px solid transparent;
        }

        .request-card.priority-urgent {
          border-left-color: var(--accent-red);
        }

        .request-card.priority-high {
          border-left-color: #f85149;
        }

        .request-card.priority-medium {
          border-left-color: var(--accent-amber);
        }

        .request-card .card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 12px;
        }

        .request-type {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 4px 10px;
          background: var(--bg-surface);
          border: 1px solid var(--border);
          font-size: 11px;
          text-transform: capitalize;
        }

        .request-title {
          font-size: 15px;
          font-weight: 600;
          margin-bottom: 8px;
        }

        .request-description {
          font-size: 12px;
          color: var(--text-secondary);
          line-height: 1.5;
          margin-bottom: 12px;
        }

        .template-info {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 4px 10px;
          background: rgba(56, 139, 253, 0.1);
          border: 1px solid rgba(56, 139, 253, 0.3);
          font-size: 11px;
          color: var(--accent-blue);
          margin-bottom: 12px;
        }

        .request-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          margin-bottom: 12px;
          font-size: 11px;
          color: var(--text-muted);
        }

        .request-meta span {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .comment-indicator {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 11px;
          color: var(--accent-blue);
          margin-bottom: 16px;
        }

        .request-card .card-footer {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          margin-top: 16px;
          padding-top: 16px;
          border-top: 1px solid var(--border);
        }

        .action-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          border: 1px solid var(--border);
          background: transparent;
          color: var(--text-secondary);
          font-size: 11px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .action-btn:hover {
          transform: translateY(-2px);
        }

        .action-btn.view:hover {
          background: var(--accent-blue);
          border-color: var(--accent-blue);
          color: white;
        }

        .action-btn.respond:hover {
          background: var(--accent-amber);
          border-color: var(--accent-amber);
          color: black;
        }

        .action-btn.accept:hover,
        .action-btn.complete:hover {
          background: var(--accent-teal);
          border-color: var(--accent-teal);
          color: black;
        }

        .detail-panel {
          background: var(--bg-panel);
          padding: 20px;
          border-left: 1px solid var(--border);
          max-height: calc(100vh - 300px);
          overflow-y: auto;
        }

        .detail-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 20px;
        }

        .detail-header h2 {
          font-size: 16px;
          font-weight: 600;
        }

        .close-btn {
          background: transparent;
          border: 1px solid var(--border);
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-secondary);
          cursor: pointer;
        }

        .close-btn:hover {
          background: var(--bg-surface);
          color: var(--text-primary);
        }

        .client-detail {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .detail-avatar {
          width: 80px;
          height: 80px;
          background: var(--bg-elevated);
          border: 1px solid var(--border);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 32px;
          font-weight: 600;
          color: var(--accent-blue);
          margin-bottom: 8px;
        }

        .client-detail h3 {
          font-size: 20px;
          font-weight: 600;
        }

        .detail-role, .detail-school {
          font-size: 13px;
          color: var(--text-secondary);
        }

        .detail-info {
          display: flex;
          flex-direction: column;
          gap: 12px;
          padding: 16px 0;
          border-top: 1px solid var(--border);
          border-bottom: 1px solid var(--border);
          font-size: 13px;
          color: var(--text-secondary);
        }

        .detail-info div {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .detail-notes {
          padding: 16px 0;
          border-bottom: 1px solid var(--border);
        }

        .detail-notes h4 {
          font-size: 13px;
          font-weight: 600;
          margin-bottom: 8px;
        }

        .detail-notes p {
          font-size: 12px;
          color: var(--text-secondary);
        }

        .client-requests {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-top: 8px;
        }

        .request-item {
          padding: 12px;
          background: var(--bg-surface);
          border: 1px solid var(--border);
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .request-item:hover {
          border-color: var(--accent-blue);
        }

        .request-item-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 4px;
        }

        .request-item-title {
          font-size: 12px;
          font-weight: 500;
        }

        .request-item-desc {
          font-size: 11px;
          color: var(--text-muted);
        }

        .no-requests {
          font-size: 12px;
          color: var(--text-muted);
          text-align: center;
          padding: 20px;
        }

        .chat-modal {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .request-chat {
          width: 500px;
          max-width: 90%;
          background: var(--bg-panel);
          border: 1px solid var(--border);
          display: flex;
          flex-direction: column;
          max-height: 80vh;
        }

        .chat-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px;
          border-bottom: 1px solid var(--border);
        }

        .chat-header h3 {
          font-size: 15px;
          font-weight: 600;
        }

        .chat-messages {
          flex: 1;
          padding: 16px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 12px;
          max-height: 400px;
        }

        .message {
          padding: 12px;
          background: var(--bg-surface);
          border: 1px solid var(--border);
        }

        .message.support {
          background: rgba(56, 139, 253, 0.1);
          border-color: rgba(56, 139, 253, 0.3);
          margin-left: 20px;
        }

        .message.client {
          margin-right: 20px;
        }

        .message-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 8px;
        }

        .message-header .author {
          font-size: 12px;
          font-weight: 600;
        }

        .message-header .time {
          font-size: 10px;
          color: var(--text-muted);
        }

        .message .content {
          font-size: 12px;
          color: var(--text-secondary);
          line-height: 1.5;
        }

        .no-messages {
          text-align: center;
          padding: 40px;
          color: var(--text-muted);
        }

        .no-messages svg {
          margin-bottom: 16px;
        }

        .chat-input {
          display: flex;
          gap: 8px;
          padding: 16px;
          border-top: 1px solid var(--border);
        }

        .chat-input input {
          flex: 1;
          padding: 8px 12px;
          background: var(--bg-surface);
          border: 1px solid var(--border);
          color: var(--text-primary);
          font-size: 13px;
        }

        .chat-input input:focus {
          border-color: var(--accent-blue);
          outline: none;
        }

        .chat-input button {
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--accent-blue);
          border: none;
          color: white;
          cursor: pointer;
        }

        .chat-input button:hover {
          background: #58a6ff;
        }

        .status-badge,
        .request-status-badge,
        .priority-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 2px 8px;
          font-size: 10px;
          border: 1px solid;
          background: transparent;
        }

        .status-active {
          background: rgba(57, 211, 83, 0.15);
          color: var(--accent-teal);
          border-color: rgba(57, 211, 83, 0.3);
        }

        .status-inactive {
          background: var(--bg-elevated);
          color: var(--text-muted);
          border-color: var(--border);
        }

        .status-suspended {
          background: rgba(248, 81, 73, 0.15);
          color: var(--accent-red);
          border-color: rgba(248, 81, 73, 0.3);
        }

        .status-pending {
          background: rgba(227, 179, 65, 0.15);
          color: var(--accent-amber);
          border-color: rgba(227, 179, 65, 0.3);
        }

        .request-status-new {
          background: rgba(56, 139, 253, 0.15);
          color: var(--accent-blue);
          border-color: rgba(56, 139, 253, 0.3);
        }

        .request-status-progress {
          background: rgba(227, 179, 65, 0.15);
          color: var(--accent-amber);
          border-color: rgba(227, 179, 65, 0.3);
        }

        .request-status-completed {
          background: rgba(57, 211, 83, 0.15);
          color: var(--accent-teal);
          border-color: rgba(57, 211, 83, 0.3);
        }

        .request-status-rejected {
          background: rgba(248, 81, 73, 0.15);
          color: var(--accent-red);
          border-color: rgba(248, 81, 73, 0.3);
        }

        .request-status-urgent {
          background: rgba(248, 81, 73, 0.15);
          color: var(--accent-red);
          border-color: rgba(248, 81, 73, 0.3);
        }

        .priority-low {
          background: var(--bg-elevated);
          color: var(--text-muted);
          border-color: var(--border);
        }

        .priority-medium {
          background: rgba(227, 179, 65, 0.15);
          color: var(--accent-amber);
          border-color: rgba(227, 179, 65, 0.3);
        }

        .priority-high,
        .priority-urgent {
          background: rgba(248, 81, 73, 0.15);
          color: var(--accent-red);
          border-color: rgba(248, 81, 73, 0.3);
        }

        .empty-state {
          text-align: center;
          padding: 48px;
          color: var(--text-muted);
        }

        .empty-state svg {
          margin-bottom: 16px;
          opacity: 0.5;
        }

        .empty-state h3 {
          font-size: 16px;
          font-weight: 500;
          margin-bottom: 8px;
          color: var(--text-secondary);
        }

        .btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          border: 1px solid transparent;
        }

        .btn-primary {
          background: var(--accent-blue);
          color: white;
        }

        .btn-primary:hover {
          background: #58a6ff;
        }

        .btn-ghost {
          background: transparent;
          border: 1px solid var(--border);
          color: var(--text-secondary);
        }

        .btn-ghost:hover {
          border-color: var(--border-bright);
          color: var(--text-primary);
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes statSlide {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes cardAppear {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (max-width: 1200px) {
          .stats-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }

        @media (max-width: 768px) {
          .content-grid {
            grid-template-columns: 1fr;
          }

          .detail-panel {
            border-left: none;
            border-top: 1px solid var(--border);
          }

          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .filters-bar {
            flex-direction: column;
          }

          .filter-select-wrapper {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}