// Avis.tsx
import { useState } from 'react';
import {
  FiStar, FiMessageCircle, FiThumbsUp,
  FiMoreVertical,FiSearch,
  FiFlag, FiCheckCircle, FiAlertCircle,
  FiMail,
  FiDownload, FiRefreshCw, FiEdit2, FiTrash2,
  FiUsers, FiUserPlus, FiUserCheck,FiActivity,
 FiUpload,
  FiSave, FiImage,FiPhone,
  FiTwitter, FiFacebook, FiLinkedin
} from 'react-icons/fi';

import { BsChatQuote } from 'react-icons/bs';
import {RiTeamLine } from 'react-icons/ri';
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
    <div className="stars">
      {[1, 2, 3, 4, 5].map((star) => (
        <FiStar
          key={star}
          size={size}
          className={`star ${star <= rating ? 'filled' : ''}`}
        />
      ))}
      <style>{`
        .stars {
          display: flex;
          gap: 2px;
        }
        .star {
          color: var(--text-muted);
        }
        .star.filled {
          color: var(--accent-amber);
          fill: var(--accent-amber);
        }
      `}</style>
    </div>
  );
}

// Composant de carte d'avis
function CommentCard({ comment, onAction }: { comment: Comment; onAction: (action: string, comment: Comment) => void }) {
  return (
    <div className={`comment-card ${comment.reported ? 'reported' : ''}`}>
      <div className="card-header">
        <div className="user-info">
          <div className="avatar">
            {comment.author.charAt(0)}
          </div>
          <div>
            <h4 className="name">{comment.author}</h4>
            <p className="school">{comment.school}</p>
          </div>
        </div>
        <div className="card-actions">
          {comment.verified && <FiCheckCircle className="verified" size={16} />}
          <button onClick={() => onAction('menu', comment)}>
            <FiMoreVertical size={16} />
          </button>
        </div>
      </div>

      <div className="rating">
        <Stars rating={comment.rating} />
        <span className="date">{comment.date}</span>
      </div>

      <p className="text">{comment.text}</p>

      {comment.response && (
        <div className="response">
          <FiMessageCircle size={14} />
          <span>{comment.response}</span>
        </div>
      )}

      <div className="footer">
        <div className="stats">
          <span><FiThumbsUp size={12} /> 12</span>
          {comment.reported && (
            <span className="reported">
              <FiFlag size={12} /> {comment.reportCount} signalements
            </span>
          )}
        </div>
        <div className="actions">
          <button className="approve" onClick={() => onAction('approve', comment)}>
            <FiCheckCircle size={14} /> Approuver
          </button>
          <button className="delete" onClick={() => onAction('delete', comment)}>
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
    <div className="team-card">
      <div className="card-header">
        <img src={member.avatar} alt={member.name} className="avatar" />
        <div className="info">
          <h4>{member.name}</h4>
          <p className="role">{member.role}</p>
        </div>
        <button className="menu">
          <FiMoreVertical size={16} />
        </button>
      </div>

      <p className="bio">{member.bio}</p>

      <div className="contact">
        <div><FiMail size={14} /> {member.email}</div>
        <div><FiPhone size={14} /> {member.phone}</div>
      </div>

      <div className="social">
        {member.social.twitter && <FiTwitter size={16} />}
        {member.social.facebook && <FiFacebook size={16} />}
        {member.social.linkedin && <FiLinkedin size={16} />}
      </div>

      <div className="footer">
        <label className="visibility">
          <input type="checkbox" checked={member.visible} readOnly />
          Visible sur le site
        </label>
        <div className="actions">
          <button className="edit" onClick={onEdit}>
            <FiEdit2 size={14} />
          </button>
          <button className="delete" onClick={onDelete}>
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
    <div className="activity-item">
      <div className="icon">{getIcon()}</div>
      <div className="content">
        <p>
          <strong>{activity.user}</strong> {activity.action} <strong>{activity.target}</strong>
        </p>
        <span className="time">{activity.time}</span>
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
    <div className="avis-page">
      {/* En-tête */}
      <div className="page-header">
        <h1 className="page-title">
          <BsChatQuote size={24} />
          Avis & Modération
        </h1>
        <div className="header-actions">
          <button className="btn btn-ghost" onClick={() => onNotify('Données actualisées', 'green')}>
            <FiRefreshCw size={14} /> Actualiser
          </button>
          <button className="btn btn-ghost" onClick={() => onNotify('Export en cours', 'blue')}>
            <FiDownload size={14} /> Exporter
          </button>
        </div>
      </div>

      {/* Statistiques globales */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#388bfd20', color: '#388bfd' }}>
            <FaRegCommentDots size={20} />
          </div>
          <div className="stat-content">
            <span className="stat-label">Total avis</span>
            <span className="stat-value">{stats.totalComments}</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#e3b34120', color: '#e3b341' }}>
            <FiStar size={20} />
          </div>
          <div className="stat-content">
            <span className="stat-label">Note moyenne</span>
            <span className="stat-value">{stats.avgRating}/5</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#39d35320', color: '#39d353' }}>
            <FiCheckCircle size={20} />
          </div>
          <div className="stat-content">
            <span className="stat-label">Avis vérifiés</span>
            <span className="stat-value">{stats.verifiedComments}</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#f8514920', color: '#f85149' }}>
            <FiFlag size={20} />
          </div>
          <div className="stat-content">
            <span className="stat-label">Signalements</span>
            <span className="stat-value">{stats.reportedComments}</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#a5a0e820', color: '#a5a0e8' }}>
            <FiUsers size={20} />
          </div>
          <div className="stat-content">
            <span className="stat-label">Utilisateurs</span>
            <span className="stat-value">{stats.totalUsers}</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#39d35320', color: '#39d353' }}>
            <FiUserCheck size={20} />
          </div>
          <div className="stat-content">
            <span className="stat-label">En ligne</span>
            <span className="stat-value">{stats.onlineUsers}</span>
          </div>
        </div>
      </div>

      {/* Onglets */}
      <div className="tabs">
        <button
          className={`tab ${activeTab === 'comments' ? 'active' : ''}`}
          onClick={() => setActiveTab('comments')}
        >
          <FaRegCommentDots size={16} />
          Avis
          {reportedComments.length > 0 && (
            <span className="badge">{reportedComments.length}</span>
          )}
        </button>
        <button
          className={`tab ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          <FiUsers size={16} />
          Utilisateurs
        </button>
        <button
          className={`tab ${activeTab === 'activity' ? 'active' : ''}`}
          onClick={() => setActiveTab('activity')}
        >
          <FiActivity size={16} />
          Activité
        </button>
        <button
          className={`tab ${activeTab === 'team' ? 'active' : ''}`}
          onClick={() => setActiveTab('team')}
        >
          <RiTeamLine size={16} />
          Équipe
        </button>
      </div>

      {/* Barre de recherche */}
      <div className="search-section">
        <div className="search-box">
          <FiSearch size={16} />
          <input
            type="text"
            placeholder="Rechercher..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        {activeTab === 'team' && (
          <button className="btn btn-primary" onClick={() => handleTeamAction('add')}>
            <FiUserPlus size={14} /> Ajouter un membre
          </button>
        )}
      </div>

      {/* Contenu des onglets */}
      <div className="tab-content">
        {/* Onglet Avis */}
        {activeTab === 'comments' && (
          <div className="comments-section">
            <div className="section-header">
              <h3>Gestion des avis</h3>
              <div className="filters">
                <select className="filter-select">
                  <option>Tous les avis</option>
                  <option>Signalés uniquement</option>
                  <option>Non vérifiés</option>
                  <option>Avec réponse</option>
                </select>
              </div>
            </div>

            {/* Avis signalés en alerte */}
            {reportedComments.length > 0 && (
              <div className="alerts">
                <h4>
                  <FiAlertCircle size={16} style={{ color: 'var(--accent-red)' }} />
                  Avis signalés ({reportedComments.length})
                </h4>
                <div className="comments-grid">
                  {reportedComments.map(comment => (
                    <CommentCard
                      key={comment.id}
                      comment={comment}
                      onAction={handleCommentAction}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Tous les avis */}
            <div className="comments-grid">
              {comments.filter(c => !c.reported).map(comment => (
                <CommentCard
                  key={comment.id}
                  comment={comment}
                  onAction={handleCommentAction}
                />
              ))}
            </div>
          </div>
        )}

        {/* Onglet Utilisateurs */}
        {activeTab === 'users' && (
          <div className="users-section">
            <div className="users-grid">
              {users.map(user => (
                <div key={user.id} className="user-card">
                  <div className="user-header">
                    <div className="user-avatar">
                      {user.name.charAt(0)}
                    </div>
                    <div className="user-status">
                      <span className={`status-dot ${user.status}`} />
                      <span>{user.status}</span>
                    </div>
                  </div>
                  <h4 className="user-name">{user.name}</h4>
                  <p className="user-email">{user.email}</p>
                  <div className="user-role">
                    <span className={`role-badge ${user.role}`}>{user.role}</span>
                  </div>
                  <div className="user-stats">
                    <div>
                      <span className="label">Commentaires</span>
                      <span className="value">{user.comments}</span>
                    </div>
                    <div>
                      <span className="label">Likes reçus</span>
                      <span className="value">{user.likes}</span>
                    </div>
                  </div>
                  <div className="user-footer">
                    <span className="joined">Inscrit le {user.joined}</span>
                    <button className="user-menu">
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
          <div className="activity-section">
            <h3>Activités récentes</h3>
            <div className="activity-list">
              {activities.map(activity => (
                <ActivityItem key={activity.id} activity={activity} />
              ))}
            </div>
          </div>
        )}

        {/* Onglet Équipe */}
        {activeTab === 'team' && (
          <div className="team-section">
            <h3>Gestion de l'équipe</h3>
            <p className="section-subtitle">
              Gérez les membres de l'équipe affichés sur la page "Notre équipe"
            </p>

            <div className="team-grid">
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
              <div className="modal">
                <div className="modal-content">
                  <h3>{editingMember.id ? 'Modifier' : 'Ajouter'} un membre</h3>
                  
                  <div className="form-group">
                    <label>Photo</label>
                    <div className="photo-upload">
                      <div className="photo-preview">
                        {editingMember.avatar ? (
                          <img src={editingMember.avatar} alt="Preview" />
                        ) : (
                          <FiImage size={40} />
                        )}
                      </div>
                      <button className="btn btn-ghost">
                        <FiUpload size={14} /> Choisir une image
                      </button>
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Nom complet</label>
                    <input
                      type="text"
                      value={editingMember.name}
                      onChange={(e) => setEditingMember({...editingMember, name: e.target.value})}
                      placeholder="Ex: Jean Dupont"
                    />
                  </div>

                  <div className="form-group">
                    <label>Poste</label>
                    <input
                      type="text"
                      value={editingMember.role}
                      onChange={(e) => setEditingMember({...editingMember, role: e.target.value})}
                      placeholder="Ex: Directeur Technique"
                    />
                  </div>

                  <div className="form-group">
                    <label>Email</label>
                    <input
                      type="email"
                      value={editingMember.email}
                      onChange={(e) => setEditingMember({...editingMember, email: e.target.value})}
                      placeholder="exemple@nova.fr"
                    />
                  </div>

                  <div className="form-group">
                    <label>Téléphone</label>
                    <input
                      type="tel"
                      value={editingMember.phone}
                      onChange={(e) => setEditingMember({...editingMember, phone: e.target.value})}
                      placeholder="+33 6 12 34 56 78"
                    />
                  </div>

                  <div className="form-group">
                    <label>Biographie</label>
                    <textarea
                      value={editingMember.bio}
                      onChange={(e) => setEditingMember({...editingMember, bio: e.target.value})}
                      placeholder="Présentez le membre de l'équipe..."
                      rows={3}
                    />
                  </div>

                  <div className="form-group">
                    <label>Réseaux sociaux</label>
                    <div className="social-inputs">
                      <div className="social-input">
                        <FiTwitter size={14} />
                        <input
                          type="url"
                          placeholder="Twitter"
                          value={editingMember.social.twitter || ''}
                          onChange={(e) => setEditingMember({
                            ...editingMember,
                            social: {...editingMember.social, twitter: e.target.value}
                          })}
                        />
                      </div>
                      <div className="social-input">
                        <FiFacebook size={14} />
                        <input
                          type="url"
                          placeholder="Facebook"
                          value={editingMember.social.facebook || ''}
                          onChange={(e) => setEditingMember({
                            ...editingMember,
                            social: {...editingMember.social, facebook: e.target.value}
                          })}
                        />
                      </div>
                      <div className="social-input">
                        <FiLinkedin size={14} />
                        <input
                          type="url"
                          placeholder="LinkedIn"
                          value={editingMember.social.linkedin || ''}
                          onChange={(e) => setEditingMember({
                            ...editingMember,
                            social: {...editingMember.social, linkedin: e.target.value}
                          })}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="checkbox">
                      <input
                        type="checkbox"
                        checked={editingMember.visible}
                        onChange={(e) => setEditingMember({...editingMember, visible: e.target.checked})}
                      />
                      Afficher sur le site
                    </label>
                  </div>

                  <div className="modal-actions">
                    <button className="btn btn-ghost" onClick={() => setEditingMember(null)}>
                      Annuler
                    </button>
                    <button className="btn btn-primary" onClick={handleSaveMember}>
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
        .avis-page {
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
          grid-template-columns: repeat(6, 1fr);
          gap: 1px;
          background: var(--border);
          border: 1px solid var(--border);
          margin-bottom: 24px;
        }

        .stat-card {
          background: var(--bg-panel);
          padding: 16px;
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .stat-icon {
          width: 48px;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .stat-content {
          flex: 1;
        }

        .stat-label {
          display: block;
          font-size: 11px;
          text-transform: uppercase;
          color: var(--text-muted);
          margin-bottom: 4px;
        }

        .stat-value {
          font-size: 20px;
          font-weight: 500;
          color: var(--text-primary);
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
          transition: all 0.2s ease;
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

        .search-section {
          display: flex;
          gap: 16px;
          margin-bottom: 24px;
        }

        .search-box {
          flex: 1;
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 8px 16px;
          background: var(--bg-surface);
          border: 1px solid var(--border);
        }

        .search-box input {
          flex: 1;
          background: transparent;
          border: none;
          color: var(--text-primary);
          font-size: 13px;
        }

        .search-box input:focus {
          outline: none;
        }

        .comments-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1px;
          background: var(--border);
          border: 1px solid var(--border);
          margin-bottom: 24px;
        }

        .comment-card {
          background: var(--bg-panel);
          padding: 20px;
          border: 1px solid transparent;
          transition: all 0.2s ease;
        }

        .comment-card.reported {
          border-left: 3px solid var(--accent-red);
        }

        .comment-card:hover {
          border-color: var(--border-bright);
        }

        .card-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          margin-bottom: 12px;
        }

        .user-info {
          display: flex;
          gap: 12px;
        }

        .avatar {
          width: 40px;
          height: 40px;
          background: var(--bg-elevated);
          border: 1px solid var(--border);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          color: var(--accent-blue);
        }

        .name {
          font-size: 14px;
          font-weight: 600;
          margin-bottom: 2px;
        }

        .school {
          font-size: 12px;
          color: var(--text-muted);
        }

        .card-actions {
          display: flex;
          gap: 8px;
        }

        .card-actions button {
          background: transparent;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
        }

        .verified {
          color: var(--accent-teal);
        }

        .rating {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 12px;
        }

        .date {
          font-size: 11px;
          color: var(--text-muted);
        }

        .text {
          font-size: 13px;
          color: var(--text-secondary);
          line-height: 1.6;
          margin-bottom: 16px;
        }

        .response {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px;
          background: var(--bg-surface);
          border: 1px solid var(--border);
          margin-bottom: 16px;
          font-size: 12px;
          color: var(--text-secondary);
        }

        .footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .stats {
          display: flex;
          gap: 12px;
          font-size: 11px;
          color: var(--text-muted);
        }

        .stats span {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .reported {
          color: var(--accent-red);
        }

        .actions {
          display: flex;
          gap: 8px;
        }

        .actions button {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 4px 8px;
          border: 1px solid var(--border);
          background: transparent;
          color: var(--text-secondary);
          font-size: 11px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .actions .approve:hover {
          background: var(--accent-teal);
          border-color: var(--accent-teal);
          color: black;
        }

        .actions .delete:hover {
          background: var(--accent-red);
          border-color: var(--accent-red);
          color: white;
        }

        .users-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 1px;
          background: var(--border);
          border: 1px solid var(--border);
        }

        .user-card {
          background: var(--bg-panel);
          padding: 20px;
        }

        .user-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          margin-bottom: 16px;
        }

        .user-avatar {
          width: 48px;
          height: 48px;
          background: var(--bg-elevated);
          border: 1px solid var(--border);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          font-weight: 600;
          color: var(--accent-blue);
        }

        .user-status {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 11px;
          color: var(--text-muted);
        }

        .status-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }

        .status-dot.online {
          background: var(--accent-teal);
        }

        .status-dot.offline {
          background: var(--text-muted);
        }

        .status-dot.away {
          background: var(--accent-amber);
        }

        .user-name {
          font-size: 16px;
          font-weight: 600;
          margin-bottom: 4px;
        }

        .user-email {
          font-size: 12px;
          color: var(--text-muted);
          margin-bottom: 12px;
        }

        .user-role {
          margin-bottom: 16px;
        }

        .role-badge {
          padding: 2px 8px;
          font-size: 11px;
          font-weight: 500;
          border: 1px solid var(--border);
        }

        .role-badge.admin {
          background: rgba(248, 81, 73, 0.15);
          color: var(--accent-red);
          border-color: rgba(248, 81, 73, 0.3);
        }

        .role-badge.moderator {
          background: rgba(227, 179, 65, 0.15);
          color: var(--accent-amber);
          border-color: rgba(227, 179, 65, 0.3);
        }

        .role-badge.user {
          background: var(--bg-elevated);
          color: var(--text-muted);
        }

        .user-stats {
          display: flex;
          gap: 20px;
          padding: 12px 0;
          border-top: 1px solid var(--border);
          border-bottom: 1px solid var(--border);
          margin-bottom: 12px;
        }

        .user-stats div {
          display: flex;
          flex-direction: column;
        }

        .user-stats .label {
          font-size: 10px;
          text-transform: uppercase;
          color: var(--text-muted);
        }

        .user-stats .value {
          font-size: 16px;
          font-weight: 500;
          color: var(--text-primary);
        }

        .user-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .joined {
          font-size: 11px;
          color: var(--text-muted);
        }

        .user-menu {
          background: transparent;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
        }

        .activity-list {
          background: var(--bg-panel);
          border: 1px solid var(--border);
        }

        .activity-item {
          display: flex;
          align-items: flex-start;
          gap: 16px;
          padding: 16px 20px;
          border-bottom: 1px solid var(--border);
        }

        .activity-item:last-child {
          border-bottom: none;
        }

        .icon {
          width: 32px;
          height: 32px;
          background: var(--bg-surface);
          border: 1px solid var(--border);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-muted);
        }

        .content {
          flex: 1;
        }

        .content p {
          font-size: 13px;
          color: var(--text-secondary);
          margin-bottom: 4px;
        }

        .content strong {
          color: var(--text-primary);
          font-weight: 500;
        }

        .time {
          font-size: 11px;
          color: var(--text-muted);
        }

        .team-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 1px;
          background: var(--border);
          border: 1px solid var(--border);
        }

        .team-card {
          background: var(--bg-panel);
          padding: 20px;
        }

        .team-card .card-header {
          margin-bottom: 16px;
        }

        .team-card .avatar {
          width: 60px;
          height: 60px;
          border-radius: 30px;
          object-fit: cover;
        }

        .team-card .info h4 {
          font-size: 16px;
          font-weight: 600;
          margin-bottom: 4px;
        }

        .team-card .role {
          font-size: 12px;
          color: var(--accent-blue);
        }

        .team-card .bio {
          font-size: 13px;
          color: var(--text-secondary);
          line-height: 1.6;
          margin-bottom: 16px;
        }

        .team-card .contact {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-bottom: 16px;
          font-size: 12px;
          color: var(--text-muted);
        }

        .team-card .contact div {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .team-card .social {
          display: flex;
          gap: 12px;
          margin-bottom: 16px;
          color: var(--text-muted);
        }

        .team-card .footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .visibility {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 12px;
          color: var(--text-muted);
        }

        .modal {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .modal-content {
          background: var(--bg-panel);
          border: 1px solid var(--border);
          width: 100%;
          max-width: 500px;
          max-height: 90vh;
          overflow-y: auto;
          padding: 24px;
        }

        .modal-content h3 {
          font-size: 18px;
          font-weight: 600;
          margin-bottom: 24px;
        }

        .form-group {
          margin-bottom: 20px;
        }

        .form-group label {
          display: block;
          font-size: 12px;
          font-weight: 500;
          color: var(--text-secondary);
          margin-bottom: 8px;
        }

        .form-group input,
        .form-group textarea,
        .form-group select {
          width: 100%;
          padding: 8px 12px;
          background: var(--bg-surface);
          border: 1px solid var(--border);
          color: var(--text-primary);
          font-size: 13px;
        }

        .form-group input:focus,
        .form-group textarea:focus,
        .form-group select:focus {
          border-color: var(--accent-blue);
          outline: none;
        }

        .photo-upload {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .photo-preview {
          width: 80px;
          height: 80px;
          background: var(--bg-surface);
          border: 1px solid var(--border);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-muted);
          overflow: hidden;
        }

        .photo-preview img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .social-inputs {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .social-input {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .social-input input {
          flex: 1;
        }

        .checkbox {
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
        }

        .modal-actions {
          display: flex;
          gap: 12px;
          justify-content: flex-end;
          margin-top: 24px;
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
          transform: translateY(-2px);
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

        .alerts {
          margin-bottom: 24px;
        }

        .alerts h4 {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 16px;
          color: var(--accent-red);
        }

        .section-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 16px;
        }

        .section-header h3 {
          font-size: 16px;
          font-weight: 600;
        }

        .filters {
          display: flex;
          gap: 8px;
        }

        .filter-select {
          padding: 6px 12px;
          background: var(--bg-surface);
          border: 1px solid var(--border);
          color: var(--text-primary);
          font-size: 12px;
        }

        .section-subtitle {
          font-size: 13px;
          color: var(--text-muted);
          margin-bottom: 20px;
        }

        @media (max-width: 1100px) {
          .stats-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }

        @media (max-width: 768px) {
          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .comments-grid {
            grid-template-columns: 1fr;
          }

          .tabs {
            overflow-x: auto;
          }

          .search-section {
            flex-direction: column;
          }
        }

        @media (max-width: 480px) {
          .stats-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}