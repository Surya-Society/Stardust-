// Avis.tsx
import { useState } from 'react';
import {
  FiStar, FiMessageCircle, FiThumbsUp,
  FiMoreVertical, FiSearch,
  FiFlag, FiCheckCircle, FiAlertCircle,
  FiMail,
  FiDownload, FiRefreshCw, FiEdit2, FiTrash2,
  FiUsers, FiUserPlus, FiUserCheck, FiActivity,
  FiUpload,
  FiSave, FiImage, FiPhone,
  FiTwitter, FiFacebook, FiLinkedin
} from 'react-icons/fi';

import { BsChatQuote } from 'react-icons/bs';
import { RiTeamLine } from 'react-icons/ri';
import { FaRegCommentDots } from 'react-icons/fa';

interface Comment {
  id: number;
  author: string;
  school: string;
  rating: 1 | 2 | 3 | 4 | 5;
  text: string;
  date: string;
  avatar?: string;
  verified?: boolean;
  response?: string;
  reported?: boolean;
  reportCount?: number;
}

interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'moderator' | 'user';
  status: 'online' | 'offline' | 'away';
  lastActive: string;
  avatar?: string;
  joined: string;
  comments: number;
  likes: number;
}

interface Activity {
  id: number;
  user: string;
  action: string;
  target: string;
  time: string;
  type: 'comment' | 'like' | 'report' | 'login' | 'register';
}

interface TeamMember {
  id: number;
  name: string;
  role: string;
  email: string;
  phone: string;
  avatar: string;
  bio: string;
  social: {
    twitter?: string;
    facebook?: string;
    linkedin?: string;
  };
  order: number;
  visible: boolean;
}

interface AvisProps {
  onNotify?: (message: string, type: 'green' | 'red' | 'amber' | 'blue') => void;
}

// Données mockées enrichies
const comments: Comment[] = [
  {
    id: 1,
    author: "Marie Dupont",
    school: "Lycée Victor Hugo",
    rating: 5,
    text: "Interface remarquable, nos enseignants ont été immédiatement à l'aise. Le support est réactif et professionnel.",
    date: "14 Jan 2026",
    verified: true,
    response: "Merci beaucoup pour votre retour !",
    reported: false
  },
  {
    id: 2,
    author: "Pierre Lambert",
    school: "Collège Jean Moulin",
    rating: 4,
    text: "Excellent logiciel, très complet. Quelques améliorations seraient bienvenues sur l'export PDF.",
    date: "10 Jan 2026",
    verified: true,
    reported: false
  },
  {
    id: 3,
    author: "Sophie Martin",
    school: "École Primaire Pasteur",
    rating: 1,
    text: "Service décevant, beaucoup de bugs et support peu réactif. Je déconseille.",
    date: "20 Déc 2025",
    verified: false,
    reported: true,
    reportCount: 3
  },
  {
    id: 4,
    author: "Claire Fontaine",
    school: "IUT de Bordeaux",
    rating: 5,
    text: "Scolarys a révolutionné notre gestion administrative. On ne reviendrait jamais en arrière.",
    date: "05 Jan 2026",
    verified: true,
    response: "Merci Claire !"
  },
  {
    id: 5,
    author: "Thomas Dubois",
    school: "Lycée Technique",
    rating: 2,
    text: "Difficultés avec l'import des notes. Le format CSV n'est pas toujours bien interprété.",
    date: "01 Déc 2025",
    verified: true,
    reported: true,
    reportCount: 1
  }
];

const users: User[] = [
  { id: 1, name: "Marie Dupont", email: "m.dupont@vh.fr", role: 'user', status: 'online', lastActive: "Maintenant", joined: "12 Jan 2025", comments: 3, likes: 12 },
  { id: 2, name: "Pierre Lambert", email: "p.lambert@jm.fr", role: 'user', status: 'online', lastActive: "Il y a 5 min", joined: "03 Fév 2025", comments: 2, likes: 8 },
  { id: 3, name: "Sophie Martin", email: "s.martin@pasteur.fr", role: 'user', status: 'offline', lastActive: "Il y a 2h", joined: "15 Nov 2024", comments: 1, likes: 3 },
  { id: 4, name: "Claire Fontaine", email: "c.fontaine@iut-bdx.fr", role: 'moderator', status: 'away', lastActive: "Il y a 30 min", joined: "01 Avr 2025", comments: 5, likes: 23 },
  { id: 5, name: "Thomas Renard", email: "t.renard@rodin.fr", role: 'admin', status: 'online', lastActive: "Maintenant", joined: "22 Mar 2025", comments: 8, likes: 45 }
];

const activities: Activity[] = [
  { id: 1, user: "Marie Dupont", action: "a posté un", target: "avis 5⭐", time: "Il y a 2 min", type: 'comment' },
  { id: 2, user: "Pierre Lambert", action: "a aimé", target: "l'avis de Claire", time: "Il y a 5 min", type: 'like' },
  { id: 3, user: "Sophie Martin", action: "a signalé", target: "un avis", time: "Il y a 15 min", type: 'report' },
  { id: 4, user: "Thomas Renard", action: "s'est", target: "connecté", time: "Il y a 20 min", type: 'login' },
  { id: 5, user: "Isabelle Petit", action: "s'est", target: "inscrite", time: "Il y a 1h", type: 'register' }
];

const teamMembers: TeamMember[] = [
  {
    id: 1,
    name: "Thomas Renard",
    role: "Directeur Technique",
    email: "t.renard@nova.fr",
    phone: "+33 6 77 88 99 00",
    avatar: "https://i.pravatar.cc/150?u=1",
    bio: "Expert en développement full-stack avec 10 ans d'expérience. Passionné par les nouvelles technologies.",
    social: {
      twitter: "https://twitter.com/thomas",
      linkedin: "https://linkedin.com/in/thomas"
    },
    order: 1,
    visible: true
  },
  {
    id: 2,
    name: "Claire Fontaine",
    role: "Responsable Support",
    email: "c.fontaine@nova.fr",
    phone: "+33 6 11 22 33 44",
    avatar: "https://i.pravatar.cc/150?u=2",
    bio: "À l'écoute des clients depuis 5 ans. Garantit la satisfaction et la qualité du support.",
    social: {
      twitter: "https://twitter.com/claire"
    },
    order: 2,
    visible: true
  },
  {
    id: 3,
    name: "Marc Dubois",
    role: "Développeur Frontend",
    email: "m.dubois@nova.fr",
    phone: "+33 6 33 44 55 66",
    avatar: "https://i.pravatar.cc/150?u=3",
    bio: "Spécialiste React et TypeScript. Crée des interfaces modernes et intuitives.",
    social: {
      linkedin: "https://linkedin.com/in/marc"
    },
    order: 3,
    visible: true
  }
];

// Composant d'étoiles
function Stars({ rating, size = 16 }: { rating: number; size?: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <FiStar
          key={star}
          size={size}
          className={`${star <= rating ? 'text-[#e3b341] fill-[#e3b341]' : 'text-[#484f58]'}`}
        />
      ))}
    </div>
  );
}

// Composant de carte d'avis
function CommentCard({ comment, onAction }: { comment: Comment; onAction: (action: string, comment: Comment) => void }) {
  return (
    <div className={`bg-[#0d1117] p-5 border border-transparent transition-all duration-200 hover:border-[#30363d] ${comment.reported ? 'border-l-[3px] border-l-[#f85149]' : ''}`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex gap-3">
          <div className="w-10 h-10 bg-[#1c2330] border border-[#21262d] flex items-center justify-center font-semibold text-[#388bfd]">
            {comment.author.charAt(0)}
          </div>
          <div>
            <h4 className="text-sm font-semibold mb-0.5">{comment.author}</h4>
            <p className="text-xs text-[#484f58]">{comment.school}</p>
          </div>
        </div>
        <div className="flex gap-2">
          {comment.verified && <FiCheckCircle size={16} className="text-[#39d353]" />}
          <button className="bg-transparent border-none text-[#484f58] cursor-pointer" onClick={() => onAction('menu', comment)}>
            <FiMoreVertical size={16} />
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between mb-3">
        <Stars rating={comment.rating} />
        <span className="text-[11px] text-[#484f58]">{comment.date}</span>
      </div>

      <p className="text-[13px] text-[#8b949e] leading-relaxed mb-4">{comment.text}</p>

      {comment.response && (
        <div className="flex items-center gap-2 p-3 bg-[#161b22] border border-[#21262d] mb-4 text-xs text-[#8b949e]">
          <FiMessageCircle size={14} />
          <span>{comment.response}</span>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="flex gap-3 text-[11px] text-[#484f58]">
          <span className="flex items-center gap-1"><FiThumbsUp size={12} /> 12</span>
          {comment.reported && (
            <span className="flex items-center gap-1 text-[#f85149]"><FiFlag size={12} /> {comment.reportCount} signalements</span>
          )}
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-1 px-2 py-1 border border-[#21262d] bg-transparent text-[#8b949e] text-[11px] cursor-pointer transition-all duration-200 hover:bg-[#39d353] hover:border-[#39d353] hover:text-black" onClick={() => onAction('approve', comment)}>
            <FiCheckCircle size={14} /> Approuver
          </button>
          <button className="flex items-center gap-1 px-2 py-1 border border-[#21262d] bg-transparent text-[#8b949e] text-[11px] cursor-pointer transition-all duration-200 hover:bg-[#f85149] hover:border-[#f85149] hover:text-white" onClick={() => onAction('delete', comment)}>
            <FiTrash2 size={14} /> Supprimer
          </button>
        </div>
      </div>
    </div>
  );
}

// Composant de carte membre d'équipe
function TeamMemberCard({ member, onEdit, onDelete }: { member: TeamMember; onEdit: () => void; onDelete: () => void }) {
  return (
    <div className="bg-[#0d1117] p-5">
      <div className="flex items-start justify-between mb-4">
        <div className="flex gap-3">
          <img src={member.avatar} alt={member.name} className="w-15 h-15 object-cover" />
          <div>
            <h4 className="text-base font-semibold mb-1">{member.name}</h4>
            <p className="text-xs text-[#388bfd]">{member.role}</p>
          </div>
        </div>
        <button className="bg-transparent border-none text-[#484f58] cursor-pointer">
          <FiMoreVertical size={16} />
        </button>
      </div>

      <p className="text-[13px] text-[#8b949e] leading-relaxed mb-4">{member.bio}</p>

      <div className="flex flex-col gap-2 mb-4 text-xs text-[#484f58]">
        <div className="flex items-center gap-2"><FiMail size={14} /> {member.email}</div>
        <div className="flex items-center gap-2"><FiPhone size={14} /> {member.phone}</div>
      </div>

      <div className="flex gap-3 mb-4 text-[#484f58]">
        {member.social.twitter && <FiTwitter size={16} />}
        {member.social.facebook && <FiFacebook size={16} />}
        {member.social.linkedin && <FiLinkedin size={16} />}
      </div>

      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 text-xs text-[#484f58] cursor-pointer">
          <input type="checkbox" checked={member.visible} readOnly className="w-4 h-4" />
          Visible sur le site
        </label>
        <div className="flex gap-2">
          <button className="px-2 py-1 border border-[#21262d] bg-transparent text-[#8b949e] text-[11px] cursor-pointer transition-all duration-200 hover:bg-[#388bfd] hover:border-[#388bfd] hover:text-white" onClick={onEdit}>
            <FiEdit2 size={14} />
          </button>
          <button className="px-2 py-1 border border-[#21262d] bg-transparent text-[#8b949e] text-[11px] cursor-pointer transition-all duration-200 hover:bg-[#f85149] hover:border-[#f85149] hover:text-white" onClick={onDelete}>
            <FiTrash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

// Composant d'activité
function ActivityItem({ activity }: { activity: Activity }) {
  const getIcon = () => {
    switch (activity.type) {
      case 'comment': return <FaRegCommentDots size={14} />;
      case 'like': return <FiThumbsUp size={14} />;
      case 'report': return <FiFlag size={14} />;
      case 'login': return <FiUserCheck size={14} />;
      case 'register': return <FiUserPlus size={14} />;
      default: return <FiActivity size={14} />;
    }
  };

  return (
    <div className="flex items-start gap-4 p-4 border-b border-[#21262d] last:border-b-0">
      <div className="w-8 h-8 bg-[#161b22] border border-[#21262d] flex items-center justify-center text-[#484f58]">
        {getIcon()}
      </div>
      <div className="flex-1">
        <p className="text-[13px] text-[#8b949e] mb-1">
          <strong className="text-[#e6edf3] font-medium">{activity.user}</strong> {activity.action} <strong className="text-[#e6edf3] font-medium">{activity.target}</strong>
        </p>
        <span className="text-[11px] text-[#484f58]">{activity.time}</span>
      </div>
    </div>
  );
}

// Composant principal
export default function Avis({ onNotify = () => {} }: AvisProps) {
  const [activeTab, setActiveTab] = useState<'comments' | 'users' | 'activity' | 'team'>('comments');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);

  // Statistiques
  const stats = {
    totalComments: comments.length,
    avgRating: (comments.reduce((acc, c) => acc + c.rating, 0) / comments.length).toFixed(1),
    verifiedComments: comments.filter(c => c.verified).length,
    reportedComments: comments.filter(c => c.reported).length,
    onlineUsers: users.filter(u => u.status === 'online').length,
    totalUsers: users.length,
    totalActivities: activities.length
  };

  // Filtrer les commentaires signalés
  const reportedComments = comments.filter(c => c.reported);

  // Gestion des actions
  const handleCommentAction = (action: string, comment: Comment) => {
    switch (action) {
      case 'approve':
        onNotify(`Commentaire de ${comment.author} approuvé`, 'green');
        break;
      case 'delete':
        onNotify(`Commentaire de ${comment.author} supprimé`, 'red');
        break;
      case 'menu':
        onNotify(`Menu ouvert`, 'blue');
        break;
    }
  };

  const handleTeamAction = (action: string, member?: TeamMember) => {
    if (action === 'add') {
      setEditingMember({
        id: Date.now(),
        name: '',
        role: '',
        email: '',
        phone: '',
        avatar: '',
        bio: '',
        social: {},
        order: teamMembers.length + 1,
        visible: true
      });
    } else if (action === 'edit' && member) {
      setEditingMember(member);
    } else if (action === 'delete') {
      onNotify('Membre supprimé', 'red');
    }
  };

  const handleSaveMember = () => {
    onNotify('Membre enregistré', 'green');
    setEditingMember(null);
  };

  return (
    <div className="animate-[fadeIn_0.4s_ease]">
      {/* En-tête */}
      <div className="flex items-center justify-between mb-6 max-[768px]:flex-col max-[768px]:items-start">
        <h1 className="flex items-center gap-3 text-2xl font-semibold">
          <BsChatQuote size={24} />
          Avis & Modération
        </h1>
        <div className="flex gap-2 max-[768px]:w-full max-[768px]:mt-3">
          <button className="inline-flex items-center gap-2 px-4 py-2 text-[13px] font-medium cursor-pointer transition-all duration-200 border border-transparent bg-transparent border-[#21262d] text-[#8b949e] hover:border-[#30363d] hover:text-[#e6edf3]" onClick={() => onNotify('Données actualisées', 'green')}>
            <FiRefreshCw size={14} /> Actualiser
          </button>
          <button className="inline-flex items-center gap-2 px-4 py-2 text-[13px] font-medium cursor-pointer transition-all duration-200 border border-transparent bg-transparent border-[#21262d] text-[#8b949e] hover:border-[#30363d] hover:text-[#e6edf3]" onClick={() => onNotify('Export en cours', 'blue')}>
            <FiDownload size={14} /> Exporter
          </button>
        </div>
      </div>

      {/* Statistiques globales */}
      <div className="grid grid-cols-6 gap-px bg-[#21262d] border border-[#21262d] mb-6 max-[1100px]:grid-cols-3 max-[768px]:grid-cols-2 max-[480px]:grid-cols-1">
        <div className="bg-[#0d1117] p-4 flex items-center gap-4">
          <div className="w-12 h-12 flex items-center justify-center bg-[rgba(56,139,253,0.125)] text-[#388bfd]"><FaRegCommentDots size={20} /></div>
          <div className="flex-1">
            <span className="block text-[11px] uppercase text-[#484f58] mb-1">Total avis</span>
            <span className="text-xl font-medium text-[#e6edf3]">{stats.totalComments}</span>
          </div>
        </div>
        <div className="bg-[#0d1117] p-4 flex items-center gap-4">
          <div className="w-12 h-12 flex items-center justify-center bg-[rgba(227,179,65,0.125)] text-[#e3b341]"><FiStar size={20} /></div>
          <div className="flex-1">
            <span className="block text-[11px] uppercase text-[#484f58] mb-1">Note moyenne</span>
            <span className="text-xl font-medium text-[#e6edf3]">{stats.avgRating}/5</span>
          </div>
        </div>
        <div className="bg-[#0d1117] p-4 flex items-center gap-4">
          <div className="w-12 h-12 flex items-center justify-center bg-[rgba(57,211,83,0.125)] text-[#39d353]"><FiCheckCircle size={20} /></div>
          <div className="flex-1">
            <span className="block text-[11px] uppercase text-[#484f58] mb-1">Avis vérifiés</span>
            <span className="text-xl font-medium text-[#e6edf3]">{stats.verifiedComments}</span>
          </div>
        </div>
        <div className="bg-[#0d1117] p-4 flex items-center gap-4">
          <div className="w-12 h-12 flex items-center justify-center bg-[rgba(248,81,73,0.125)] text-[#f85149]"><FiFlag size={20} /></div>
          <div className="flex-1">
            <span className="block text-[11px] uppercase text-[#484f58] mb-1">Signalements</span>
            <span className="text-xl font-medium text-[#e6edf3]">{stats.reportedComments}</span>
          </div>
        </div>
        <div className="bg-[#0d1117] p-4 flex items-center gap-4">
          <div className="w-12 h-12 flex items-center justify-center bg-[rgba(165,160,232,0.125)] text-[#a5a0e8]"><FiUsers size={20} /></div>
          <div className="flex-1">
            <span className="block text-[11px] uppercase text-[#484f58] mb-1">Utilisateurs</span>
            <span className="text-xl font-medium text-[#e6edf3]">{stats.totalUsers}</span>
          </div>
        </div>
        <div className="bg-[#0d1117] p-4 flex items-center gap-4">
          <div className="w-12 h-12 flex items-center justify-center bg-[rgba(57,211,83,0.125)] text-[#39d353]"><FiUserCheck size={20} /></div>
          <div className="flex-1">
            <span className="block text-[11px] uppercase text-[#484f58] mb-1">En ligne</span>
            <span className="text-xl font-medium text-[#e6edf3]">{stats.onlineUsers}</span>
          </div>
        </div>
      </div>

      {/* Onglets */}
      <div className="flex gap-1 mb-6 border-b border-[#21262d] overflow-x-auto">
        <button
          className={`flex items-center gap-2 px-5 py-3 bg-transparent border-none border-b-2 border-transparent text-[#8b949e] cursor-pointer text-[13px] font-medium transition-all duration-200 hover:text-[#e6edf3] hover:bg-[#161b22] ${activeTab === 'comments' ? '!text-[#388bfd] !border-b-[#388bfd] !bg-[#1c2330]' : ''}`}
          onClick={() => setActiveTab('comments')}
        >
          <FaRegCommentDots size={16} />
          Avis
          {reportedComments.length > 0 && (
            <span className="bg-[#f85149] text-white text-[10px] px-1.5 py-0.5 ml-1">{reportedComments.length}</span>
          )}
        </button>
        <button
          className={`flex items-center gap-2 px-5 py-3 bg-transparent border-none border-b-2 border-transparent text-[#8b949e] cursor-pointer text-[13px] font-medium transition-all duration-200 hover:text-[#e6edf3] hover:bg-[#161b22] ${activeTab === 'users' ? '!text-[#388bfd] !border-b-[#388bfd] !bg-[#1c2330]' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          <FiUsers size={16} />
          Utilisateurs
        </button>
        <button
          className={`flex items-center gap-2 px-5 py-3 bg-transparent border-none border-b-2 border-transparent text-[#8b949e] cursor-pointer text-[13px] font-medium transition-all duration-200 hover:text-[#e6edf3] hover:bg-[#161b22] ${activeTab === 'activity' ? '!text-[#388bfd] !border-b-[#388bfd] !bg-[#1c2330]' : ''}`}
          onClick={() => setActiveTab('activity')}
        >
          <FiActivity size={16} />
          Activité
        </button>
        <button
          className={`flex items-center gap-2 px-5 py-3 bg-transparent border-none border-b-2 border-transparent text-[#8b949e] cursor-pointer text-[13px] font-medium transition-all duration-200 hover:text-[#e6edf3] hover:bg-[#161b22] ${activeTab === 'team' ? '!text-[#388bfd] !border-b-[#388bfd] !bg-[#1c2330]' : ''}`}
          onClick={() => setActiveTab('team')}
        >
          <RiTeamLine size={16} />
          Équipe
        </button>
      </div>

      {/* Barre de recherche */}
      <div className="flex gap-4 mb-6 max-[768px]:flex-col">
        <div className="flex-1 flex items-center gap-3 px-4 py-2 bg-[#161b22] border border-[#21262d]">
          <FiSearch size={16} />
          <input
            type="text"
            placeholder="Rechercher..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 bg-transparent border-none text-[#e6edf3] text-[13px] focus:outline-none"
          />
        </div>
        {activeTab === 'team' && (
          <button className="inline-flex items-center gap-2 px-4 py-2 text-[13px] font-medium cursor-pointer transition-all duration-200 border border-transparent bg-[#388bfd] text-white hover:bg-[#58a6ff]" onClick={() => handleTeamAction('add')}>
            <FiUserPlus size={14} /> Ajouter un membre
          </button>
        )}
      </div>

      {/* Contenu des onglets */}
      <div className="tab-content">
        {/* Onglet Avis */}
        {activeTab === 'comments' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold">Gestion des avis</h3>
              <div className="flex gap-2">
                <select className="px-3 py-1.5 bg-[#161b22] border border-[#21262d] text-[#e6edf3] text-xs">
                  <option>Tous les avis</option>
                  <option>Signalés uniquement</option>
                  <option>Non vérifiés</option>
                  <option>Avec réponse</option>
                </select>
              </div>
            </div>

            {/* Avis signalés en alerte */}
            {reportedComments.length > 0 && (
              <div className="mb-6">
                <h4 className="flex items-center gap-2 mb-4 text-[#f85149]">
                  <FiAlertCircle size={16} />
                  Avis signalés ({reportedComments.length})
                </h4>
                <div className="grid grid-cols-2 gap-px bg-[#21262d] border border-[#21262d] mb-6 max-[768px]:grid-cols-1">
                  {reportedComments.map(comment => (
                    <CommentCard key={comment.id} comment={comment} onAction={handleCommentAction} />
                  ))}
                </div>
              </div>
            )}

            {/* Tous les avis */}
            <div className="grid grid-cols-2 gap-px bg-[#21262d] border border-[#21262d] max-[768px]:grid-cols-1">
              {comments.filter(c => !c.reported).map(comment => (
                <CommentCard key={comment.id} comment={comment} onAction={handleCommentAction} />
              ))}
            </div>
          </div>
        )}

        {/* Onglet Utilisateurs */}
        {activeTab === 'users' && (
          <div>
            <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-px bg-[#21262d] border border-[#21262d]">
              {users.map(user => (
                <div key={user.id} className="bg-[#0d1117] p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 bg-[#1c2330] border border-[#21262d] flex items-center justify-center text-xl font-semibold text-[#388bfd]">
                      {user.name.charAt(0)}
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] text-[#484f58]">
                      <span className={`w-2 h-2 ${user.status === 'online' ? 'bg-[#39d353]' : user.status === 'offline' ? 'bg-[#484f58]' : 'bg-[#e3b341]'}`} />
                      <span>{user.status}</span>
                    </div>
                  </div>
                  <h4 className="text-base font-semibold mb-1">{user.name}</h4>
                  <p className="text-xs text-[#484f58] mb-3">{user.email}</p>
                  <div className="mb-4">
                    <span className={`px-2 py-0.5 text-[11px] font-medium border border-[#21262d] ${
                      user.role === 'admin' ? 'bg-[rgba(248,81,73,0.15)] text-[#f85149] border-[rgba(248,81,73,0.3)]' :
                      user.role === 'moderator' ? 'bg-[rgba(227,179,65,0.15)] text-[#e3b341] border-[rgba(227,179,65,0.3)]' :
                      'bg-[#1c2330] text-[#484f58]'
                    }`}>{user.role}</span>
                  </div>
                  <div className="flex gap-5 py-3 border-t border-b border-[#21262d] mb-3">
                    <div className="flex flex-col">
                      <span className="text-[10px] uppercase text-[#484f58]">Commentaires</span>
                      <span className="text-base font-medium text-[#e6edf3]">{user.comments}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] uppercase text-[#484f58]">Likes reçus</span>
                      <span className="text-base font-medium text-[#e6edf3]">{user.likes}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-[#484f58]">Inscrit le {user.joined}</span>
                    <button className="bg-transparent border-none text-[#484f58] cursor-pointer">
                      <FiMoreVertical size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Onglet Activité */}
        {activeTab === 'activity' && (
          <div>
            <h3 className="text-base font-semibold mb-4">Activités récentes</h3>
            <div className="bg-[#0d1117] border border-[#21262d]">
              {activities.map(activity => (
                <ActivityItem key={activity.id} activity={activity} />
              ))}
            </div>
          </div>
        )}

        {/* Onglet Équipe */}
        {activeTab === 'team' && (
          <div>
            <h3 className="text-base font-semibold mb-1">Gestion de l'équipe</h3>
            <p className="text-[13px] text-[#484f58] mb-5">
              Gérez les membres de l'équipe affichés sur la page "Notre équipe"
            </p>

            <div className="grid grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-px bg-[#21262d] border border-[#21262d]">
              {teamMembers.map(member => (
                <TeamMemberCard
                  key={member.id}
                  member={member}
                  onEdit={() => handleTeamAction('edit', member)}
                  onDelete={() => handleTeamAction('delete')}
                />
              ))}
            </div>

            {/* Modal d'édition */}
            {editingMember && (
              <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[1000]">
                <div className="bg-[#0d1117] border border-[#21262d] w-full max-w-[500px] max-h-[90vh] overflow-y-auto p-6">
                  <h3 className="text-lg font-semibold mb-6">{editingMember.id ? 'Modifier' : 'Ajouter'} un membre</h3>
                  
                  <div className="mb-5">
                    <label className="block text-xs font-medium text-[#8b949e] mb-2">Photo</label>
                    <div className="flex items-center gap-4">
                      <div className="w-20 h-20 bg-[#161b22] border border-[#21262d] flex items-center justify-center text-[#484f58] overflow-hidden">
                        {editingMember.avatar ? (
                          <img src={editingMember.avatar} alt="Preview" className="w-full h-full object-cover" />
                        ) : (
                          <FiImage size={40} />
                        )}
                      </div>
                      <button className="inline-flex items-center gap-2 px-4 py-2 text-[13px] font-medium cursor-pointer transition-all duration-200 border border-transparent bg-transparent border-[#21262d] text-[#8b949e] hover:border-[#30363d] hover:text-[#e6edf3]">
                        <FiUpload size={14} /> Choisir une image
                      </button>
                    </div>
                  </div>

                  <div className="mb-5">
                    <label className="block text-xs font-medium text-[#8b949e] mb-2">Nom complet</label>
                    <input
                      type="text"
                      value={editingMember.name}
                      onChange={(e) => setEditingMember({...editingMember, name: e.target.value})}
                      placeholder="Ex: Jean Dupont"
                      className="w-full px-3 py-2 bg-[#161b22] border border-[#21262d] text-[#e6edf3] text-[13px] focus:border-[#388bfd] focus:outline-none"
                    />
                  </div>

                  <div className="mb-5">
                    <label className="block text-xs font-medium text-[#8b949e] mb-2">Poste</label>
                    <input
                      type="text"
                      value={editingMember.role}
                      onChange={(e) => setEditingMember({...editingMember, role: e.target.value})}
                      placeholder="Ex: Directeur Technique"
                      className="w-full px-3 py-2 bg-[#161b22] border border-[#21262d] text-[#e6edf3] text-[13px] focus:border-[#388bfd] focus:outline-none"
                    />
                  </div>

                  <div className="mb-5">
                    <label className="block text-xs font-medium text-[#8b949e] mb-2">Email</label>
                    <input
                      type="email"
                      value={editingMember.email}
                      onChange={(e) => setEditingMember({...editingMember, email: e.target.value})}
                      placeholder="exemple@nova.fr"
                      className="w-full px-3 py-2 bg-[#161b22] border border-[#21262d] text-[#e6edf3] text-[13px] focus:border-[#388bfd] focus:outline-none"
                    />
                  </div>

                  <div className="mb-5">
                    <label className="block text-xs font-medium text-[#8b949e] mb-2">Téléphone</label>
                    <input
                      type="tel"
                      value={editingMember.phone}
                      onChange={(e) => setEditingMember({...editingMember, phone: e.target.value})}
                      placeholder="+33 6 12 34 56 78"
                      className="w-full px-3 py-2 bg-[#161b22] border border-[#21262d] text-[#e6edf3] text-[13px] focus:border-[#388bfd] focus:outline-none"
                    />
                  </div>

                  <div className="mb-5">
                    <label className="block text-xs font-medium text-[#8b949e] mb-2">Biographie</label>
                    <textarea
                      value={editingMember.bio}
                      onChange={(e) => setEditingMember({...editingMember, bio: e.target.value})}
                      placeholder="Présentez le membre de l'équipe..."
                      rows={3}
                      className="w-full px-3 py-2 bg-[#161b22] border border-[#21262d] text-[#e6edf3] text-[13px] focus:border-[#388bfd] focus:outline-none resize-vertical"
                    />
                  </div>

                  <div className="mb-5">
                    <label className="block text-xs font-medium text-[#8b949e] mb-2">Réseaux sociaux</label>
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <FiTwitter size={14} className="text-[#484f58]" />
                        <input
                          type="url"
                          placeholder="Twitter"
                          value={editingMember.social.twitter || ''}
                          onChange={(e) => setEditingMember({
                            ...editingMember,
                            social: {...editingMember.social, twitter: e.target.value}
                          })}
                          className="flex-1 px-3 py-2 bg-[#161b22] border border-[#21262d] text-[#e6edf3] text-[13px] focus:border-[#388bfd] focus:outline-none"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <FiFacebook size={14} className="text-[#484f58]" />
                        <input
                          type="url"
                          placeholder="Facebook"
                          value={editingMember.social.facebook || ''}
                          onChange={(e) => setEditingMember({
                            ...editingMember,
                            social: {...editingMember.social, facebook: e.target.value}
                          })}
                          className="flex-1 px-3 py-2 bg-[#161b22] border border-[#21262d] text-[#e6edf3] text-[13px] focus:border-[#388bfd] focus:outline-none"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <FiLinkedin size={14} className="text-[#484f58]" />
                        <input
                          type="url"
                          placeholder="LinkedIn"
                          value={editingMember.social.linkedin || ''}
                          onChange={(e) => setEditingMember({
                            ...editingMember,
                            social: {...editingMember.social, linkedin: e.target.value}
                          })}
                          className="flex-1 px-3 py-2 bg-[#161b22] border border-[#21262d] text-[#e6edf3] text-[13px] focus:border-[#388bfd] focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mb-5">
                    <label className="flex items-center gap-2 text-xs text-[#8b949e] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editingMember.visible}
                        onChange={(e) => setEditingMember({...editingMember, visible: e.target.checked})}
                        className="w-4 h-4"
                      />
                      Afficher sur le site
                    </label>
                  </div>

                  <div className="flex gap-3 justify-end mt-6">
                    <button className="inline-flex items-center gap-2 px-4 py-2 text-[13px] font-medium cursor-pointer transition-all duration-200 border border-transparent bg-transparent border-[#21262d] text-[#8b949e] hover:border-[#30363d] hover:text-[#e6edf3]" onClick={() => setEditingMember(null)}>
                      Annuler
                    </button>
                    <button className="inline-flex items-center gap-2 px-4 py-2 text-[13px] font-medium cursor-pointer transition-all duration-200 border border-transparent bg-[#388bfd] text-white hover:bg-[#58a6ff]" onClick={handleSaveMember}>
                      <FiSave size={14} /> Enregistrer
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
}