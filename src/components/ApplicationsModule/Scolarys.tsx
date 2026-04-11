// ScolarysApp.tsx
import { useState, useEffect } from 'react';
import {
  FiBox, FiDownload, FiRefreshCw, FiCheckCircle, FiXCircle,
  FiAlertCircle, FiClock, FiShield, FiHardDrive,
  FiDatabase, FiServer, FiBarChart2,
  FiChevronDown, FiRotateCcw, FiDownload as FiDownloadIcon,
  FiSearch, FiUsers
} from 'react-icons/fi';
import { SiGooglesheets } from 'react-icons/si';
import { HiComputerDesktop } from 'react-icons/hi2';

// ============================================================================
// TYPES
// ============================================================================

interface Module {
  id: string;
  name: string;
  displayName: string;
  description: string;
  version: string;
  status: 'active' | 'inactive' | 'pending' | 'error';
  isPurchased: boolean;
  isLoaded: boolean;
  permissions: string[];
  size: number;
  icon?: React.ElementType;
  price?: number;
  releaseDate?: string;
  author?: string;
  dependencies?: string[];
}

interface ModuleManifest {
  name: string;
  version: string;
  displayName: string;
  description: string;
  permissions: string[];
  buildHash: string;
  entryFile: string;
  dependencies: Record<string, string>;
  minScolarysVersion: string;
}

interface ModuleBundle {
  code: string;
  manifest: ModuleManifest;
  blob?: Blob;
}

interface SchoolLicence {
  keyText: string;
  schoolName: string;
  plan: 'Basic' | 'Premium' | 'Enterprise';
  status: 'active' | 'expired' | 'suspended';
  expiresAt: string;
  modules: string[];
  maxUsers: number;
  currentUsers: number;
  features: string[];
  hwLock: boolean;
  twoFA: boolean;
  ipRestrict: boolean;
  secScore: number;
}

interface Migration {
  version: string;
  name: string;
  applied: boolean;
  appliedAt?: string;
  checksum?: string;
  sql: string;
}

interface UpdateInfo {
  version: string;
  available: boolean;
  downloadUrl: string;
  checksum: string;
  releaseNotes: string;
  mandatory: boolean;
  size: number;
}

// ============================================================================
// COMPOSANTS UI
// ============================================================================

function StatusBadge({ status }: { status: Module['status'] | SchoolLicence['status'] }) {
  const config: Record<string, { bg: string; text: string; label: string; icon: React.ElementType }> = {
    active: { bg: 'bg-[rgba(57,211,83,0.15)]', text: 'text-[#39d353]', label: 'Actif', icon: FiCheckCircle },
    inactive: { bg: 'bg-[rgba(139,148,158,0.15)]', text: 'text-[#8b949e]', label: 'Inactif', icon: FiXCircle },
    pending: { bg: 'bg-[rgba(227,179,65,0.15)]', text: 'text-[#e3b341]', label: 'En attente', icon: FiClock },
    error: { bg: 'bg-[rgba(248,81,73,0.15)]', text: 'text-[#f85149]', label: 'Erreur', icon: FiAlertCircle },
    expired: { bg: 'bg-[rgba(248,81,73,0.15)]', text: 'text-[#f85149]', label: 'Expirée', icon: FiXCircle },
    suspended: { bg: 'bg-[rgba(227,179,65,0.15)]', text: 'text-[#e3b341]', label: 'Suspendue', icon: FiAlertCircle }
  };
  const style = config[status] || config.inactive;
  const Icon = style.icon;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium ${style.bg} ${style.text} border border-transparent`}>
      <Icon size={10} />
      {style.label}
    </span>
  );
}

function ProgressBar({ value, max, label }: { value: number; max: number; label?: string }) {
  const percentage = Math.min(100, (value / max) * 100);
  return (
    <div className="space-y-1">
      {label && <div className="flex justify-between text-[11px] text-[#484f58]"><span>{label}</span><span>{value}/{max}</span></div>}
      <div className="h-1.5 bg-[#1c2330] rounded-full overflow-hidden">
        <div className="h-full bg-[#388bfd] rounded-full transition-all duration-500" style={{ width: `${percentage}%` }} />
      </div>
    </div>
  );
}

// ============================================================================
// SERVICE DE GESTION DES MODULES (SYSTÈME DE BUNDLES COMME VS CODE)
// ============================================================================

class ModuleManager {
  private loadedModules: Map<string, any> = new Map();
  private moduleCache: Map<string, ModuleManifest> = new Map();
  private schoolId: string;

  constructor(schoolId: string) {
    this.schoolId = schoolId;
  }

  async initialize(): Promise<void> {
    // Charger les modules depuis le cache local
    const cached = localStorage.getItem(`nova_modules_${this.schoolId}`);
    if (cached) {
      const manifests = JSON.parse(cached);
      for (const manifest of manifests) {
        this.moduleCache.set(manifest.name, manifest);
      }
    }
  }

  async fetchAvailableModules(): Promise<Module[]> {
    // Appel API Nova pour récupérer les modules disponibles
    const response = await fetch(`https://api.nova.com/v1/modules?school=${this.schoolId}`, {
      headers: { 'X-API-Key': this.getApiKey() }
    });
    const data = await response.json();
    return data.modules;
  }

  async downloadModule(moduleName: string, version: string): Promise<ModuleBundle> {
    // 1. Récupérer le manifeste
    const manifestResponse = await fetch(
      `https://cdn.nova.com/modules/${moduleName}/${version}/manifest.json`
    );
    const manifest: ModuleManifest = await manifestResponse.json();

    // 2. Vérifier la compatibilité avec la version de Scolarys
    const currentVersion = this.getScolarysVersion();
    if (this.compareVersions(currentVersion, manifest.minScolarysVersion) < 0) {
      throw new Error(`Module requires Scolarys v${manifest.minScolarysVersion} or higher`);
    }

    // 3. Télécharger le bundle
    const bundleResponse = await fetch(
      `https://cdn.nova.com/modules/${moduleName}/${version}/${manifest.entryFile}`
    );
    const code = await bundleResponse.text();

    // 4. Vérifier l'intégrité du bundle
    const checksum = await this.computeSHA256(code);
    if (checksum !== manifest.buildHash) {
      throw new Error('Bundle integrity check failed');
    }

    // 5. Télécharger les dépendances si nécessaire
    for (const [depName, depVersion] of Object.entries(manifest.dependencies)) {
      if (!this.moduleCache.has(depName)) {
        await this.downloadModule(depName, depVersion);
      }
    }

    // 6. Mettre en cache
    this.moduleCache.set(moduleName, manifest);
    this.saveCache();

    return { code, manifest };
  }

  async loadModule(moduleName: string, version: string): Promise<any> {
    // Vérifier si déjà chargé
    if (this.loadedModules.has(moduleName)) {
      return this.loadedModules.get(moduleName);
    }

    // Télécharger si pas en cache
    let bundle = this.moduleCache.get(moduleName);
    if (!bundle) {
      const downloaded = await this.downloadModule(moduleName, version);
      bundle = downloaded.manifest;
    }

    // Télécharger le code du bundle
    const codeResponse = await fetch(
      `https://cdn.nova.com/modules/${moduleName}/${version}/${bundle.entryFile}`
    );
    const code = await codeResponse.text();

    // Exécuter dans un sandbox sécurisé
    const moduleExports = await this.executeInSandbox(code, bundle.permissions);

    // Enregistrer
    this.loadedModules.set(moduleName, moduleExports);

    return moduleExports;
  }

  private async executeInSandbox(code: string, permissions: string[]): Promise<any> {
    // Créer un environnement sandboxé
    const sandbox = {
      React: (window as any).React,
      ReactDOM: (window as any).ReactDOM,
      
      // APIs Scolarys exposées au module
      scolarys: {
        db: this.createDatabaseProxy(permissions.includes('database:read'), permissions.includes('database:write')),
        ui: this.createUIProxy(),
        storage: this.createStorageProxy(),
        events: this.createEventsProxy(),
        notifications: this.createNotificationsProxy(),
        schoolId: this.schoolId
      },
      
      // APIs standard limitées
      fetch: window.fetch.bind(window),
      console: {
        log: (...args: any[]) => console.log(`[Module]`, ...args),
        error: (...args: any[]) => console.error(`[Module]`, ...args),
        warn: (...args: any[]) => console.warn(`[Module]`, ...args)
      },
      
      // APIs bloquées
      localStorage: null,
      sessionStorage: null,
      document: null,
      window: { ...window, eval: null, Function: null }
    };

    // Exécuter le module
    const moduleFunction = new Function(
      ...Object.keys(sandbox),
      `return (function() { ${code}; return window.NovaModule; })()`
    );

    const moduleExport = moduleFunction(...Object.values(sandbox));
    return moduleExport;
  }

  private createDatabaseProxy(canRead: boolean, canWrite: boolean) {
    if (!canRead && !canWrite) return null;
    
    return new Proxy({}, {
      get: (target: any, prop: string | symbol) => {
        return async (...args: any[]) => {
          if (prop === 'query' && canRead) {
            return await this.callDB('query', args);
          }
          if (prop === 'execute' && canWrite) {
            return await this.callDB('execute', args);
          }
          throw new Error(`Permission denied: ${String(prop)}`);
        };
      }
    });
  }

  private createUIProxy() {
    return {
      showToast: (message: string, type: string) => {
        // Émettre un événement pour afficher une notification
        window.dispatchEvent(new CustomEvent('nova:toast', { detail: { message, type } }));
      },
      openModal: (component: string, props: any) => {
        window.dispatchEvent(new CustomEvent('nova:modal', { detail: { component, props } }));
      },
      navigate: (path: string) => {
        window.dispatchEvent(new CustomEvent('nova:navigate', { detail: { path } }));
      }
    };
  }

  private createStorageProxy() {
    return {
      get: (key: string) => {
        const value = localStorage.getItem(`module_${key}`);
        return value ? JSON.parse(value) : null;
      },
      set: (key: string, value: any) => {
        localStorage.setItem(`module_${key}`, JSON.stringify(value));
      },
      remove: (key: string) => {
        localStorage.removeItem(`module_${key}`);
      }
    };
  }

  private createEventsProxy() {
    return {
      on: (event: string, callback: Function) => {
        window.addEventListener(`nova:${event}`, callback as EventListener);
      },
      emit: (event: string, data: any) => {
        window.dispatchEvent(new CustomEvent(`nova:${event}`, { detail: data }));
      },
      off: (event: string, callback: Function) => {
        window.removeEventListener(`nova:${event}`, callback as EventListener);
      }
    };
  }

  private createNotificationsProxy() {
    return {
      send: (title: string, body: string, icon?: string) => {
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification(title, { body, icon });
        }
      }
    };
  }

  private async callDB(method: string, args: any[]): Promise<any> {
    // Appel à l'API Tauri pour exécuter la requête
    const response = await fetch('http://localhost:3000/api/db', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-School-Id': this.schoolId },
      body: JSON.stringify({ method, args })
    });
    return response.json();
  }

  private async computeSHA256(text: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  private compareVersions(v1: string, v2: string): number {
    const parts1 = v1.split('.').map(Number);
    const parts2 = v2.split('.').map(Number);
    for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
      const p1 = parts1[i] || 0;
      const p2 = parts2[i] || 0;
      if (p1 !== p2) return p1 - p2;
    }
    return 0;
  }

  private getApiKey(): string {
    return localStorage.getItem('nova_api_key') || '';
  }

  private getScolarysVersion(): string {
    return '3.2.1';
  }

  private saveCache(): void {
    const manifests = Array.from(this.moduleCache.values());
    localStorage.setItem(`nova_modules_${this.schoolId}`, JSON.stringify(manifests));
  }
}

// ============================================================================
// SERVICE DE GESTION DES MISES À JOUR
// ============================================================================

class UpdateManager {
  private currentVersion: string;

  constructor() {
    this.currentVersion = '3.2.1';
  }

  async checkForUpdates(): Promise<UpdateInfo | null> {
    try {
      const response = await fetch(`https://api.nova.com/v1/updates/scolarys/latest?version=${this.currentVersion}`);
      const data = await response.json();
      
      if (data.up_to_date) return null;
      
      return {
        version: data.version,
        available: true,
        downloadUrl: data.download_url,
        checksum: data.checksum,
        releaseNotes: data.release_notes,
        mandatory: data.mandatory,
        size: data.size
      };
    } catch (error) {
      console.error('Failed to check for updates:', error);
      return null;
    }
  }

  async downloadUpdate(update: UpdateInfo): Promise<Blob> {
    const response = await fetch(update.downloadUrl);
    const blob = await response.blob();
    
    // Vérifier l'intégrité
    const checksum = await this.computeSHA256Blob(blob);
    if (checksum !== update.checksum) {
      throw new Error('Update integrity check failed');
    }
    
    return blob;
  }

  async applyUpdate(blob: Blob): Promise<void> {
    // Sauvegarder l'installateur
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Scolarys-Setup-${this.currentVersion}.exe`;
    a.click();
    URL.revokeObjectURL(url);
    
    // Notification pour l'utilisateur
    alert('La mise à jour a été téléchargée. Veuillez fermer l\'application et lancer l\'installateur.');
  }

  private async computeSHA256Blob(blob: Blob): Promise<string> {
    const buffer = await blob.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }
}

// ============================================================================
// SERVICE DE GESTION DES MIGRATIONS
// ============================================================================

class MigrationManager {
  private migrations: Migration[] = [];
  private appliedMigrations: Set<string> = new Set();

  constructor() {
    this.loadMigrations();
  }

  private loadMigrations(): void {
    // Les migrations sont intégrées dans le bundle Scolarys
    // Simulées ici pour l'exemple
    this.migrations = [
      { version: '20240101000001', name: 'create_etablissement', applied: false, sql: 'CREATE TABLE...' },
      { version: '20240101000002', name: 'create_cycle', applied: false, sql: 'CREATE TABLE...' },
      { version: '20240101000003', name: 'create_serie', applied: false, sql: 'CREATE TABLE...' },
      { version: '20240101000004', name: 'create_filiere', applied: false, sql: 'CREATE TABLE...' },
      { version: '20240101000005', name: 'create_classe', applied: false, sql: 'CREATE TABLE...' },
      { version: '20240101000006', name: 'create_niveau', applied: false, sql: 'CREATE TABLE...' },
      { version: '20240101000007', name: 'create_programme', applied: false, sql: 'CREATE TABLE...' },
      { version: '20240101000008', name: 'create_campus', applied: false, sql: 'CREATE TABLE...' },
      { version: '20240101000009', name: 'create_personnel', applied: false, sql: 'CREATE TABLE...' }
    ];
  }

  async loadAppliedMigrations(): Promise<void> {
    // Charger depuis la base de données locale
    const applied = await this.getAppliedMigrationsFromDB();
    for (const version of applied) {
      this.appliedMigrations.add(version);
      const migration = this.migrations.find(m => m.version === version);
      if (migration) migration.applied = true;
    }
  }

  async getPendingMigrations(): Promise<Migration[]> {
    return this.migrations.filter(m => !this.appliedMigrations.has(m.version));
  }

  async applyMigration(migration: Migration): Promise<void> {
    try {
      // Exécuter la migration dans la base de données
      await this.executeSQL(migration.sql);
      
      // Enregistrer dans schema_migrations
      await this.recordMigration(migration);
      
      migration.applied = true;
      this.appliedMigrations.add(migration.version);
      
      console.log(`✅ Migration ${migration.version} applied successfully`);
    } catch (error) {
      console.error(`❌ Migration ${migration.version} failed:`, error);
      throw error;
    }
  }

  async applyAllPendingMigrations(onProgress?: (current: number, total: number, migration: Migration) => void): Promise<void> {
    const pending = await this.getPendingMigrations();
    
    for (let i = 0; i < pending.length; i++) {
      const migration = pending[i];
      onProgress?.(i + 1, pending.length, migration);
      await this.applyMigration(migration);
    }
  }

  private async getAppliedMigrationsFromDB(): Promise<string[]> {
    // Simulation - dans la vraie vie, requête PostgreSQL
    const stored = localStorage.getItem('applied_migrations');
    return stored ? JSON.parse(stored) : [];
  }

  private async executeSQL(sql: string): Promise<void> {
    // Simulation - dans la vraie vie, exécution via Tauri
    console.log('Executing SQL:', sql.substring(0, 100));
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  private async recordMigration(migration: Migration): Promise<void> {
    const applied = await this.getAppliedMigrationsFromDB();
    applied.push(migration.version);
    localStorage.setItem('applied_migrations', JSON.stringify(applied));
  }
}

// ============================================================================
// SERVICE DE LICENCE
// ============================================================================

class LicenceManager {
  private licence: SchoolLicence | null = null;

  async loadLicence(licenceKey: string): Promise<SchoolLicence | null> {
    try {
      const response = await fetch(`https://api.nova.com/v1/licences/${licenceKey}`);
      const data = await response.json();
      
      this.licence = {
        keyText: data.key_text,
        schoolName: data.school_name,
        plan: data.plan,
        status: data.status,
        expiresAt: data.expires_at,
        modules: data.modules || [],
        maxUsers: data.max_users,
        currentUsers: data.current_users,
        features: data.features || [],
        hwLock: data.hw_lock,
        twoFA: data.two_fa,
        ipRestrict: data.ip_restrict,
        secScore: data.sec_score
      };
      
      return this.licence;
    } catch (error) {
      console.error('Failed to load licence:', error);
      return null;
    }
  }

  getLicence(): SchoolLicence | null {
    return this.licence;
  }

  isModuleAllowed(moduleId: string): boolean {
    return this.licence?.modules.includes(moduleId) || false;
  }

  getRemainingDays(): number {
    if (!this.licence) return 0;
    const expires = new Date(this.licence.expiresAt);
    const now = new Date();
    const diff = expires.getTime() - now.getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }

  getSecurityLevel(): 'high' | 'medium' | 'low' {
    const score = this.licence?.secScore || 0;
    if (score >= 80) return 'high';
    if (score >= 50) return 'medium';
    return 'low';
  }
}

// ============================================================================
// COMPOSANT PRINCIPAL
// ============================================================================

interface ScolarysAppProps {
  onNotify: (message: string, type: 'green' | 'red' | 'amber' | 'blue') => void;
  onNavigate?: (path: string) => void;
}

export default function ScolarysApp({ onNotify }: ScolarysAppProps) {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'modules' | 'updates' | 'database'>('dashboard');
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(false);
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(null);
  const [downloadingUpdate, setDownloadingUpdate] = useState(false);
  const [migrations, setMigrations] = useState<Migration[]>([]);
  const [migrating, setMigrating] = useState(false);
  const [migrationProgress, setMigrationProgress] = useState({ current: 0, total: 0 });
  const [licence, setLicence] = useState<SchoolLicence | null>(null);
  const [licenceKey, setLicenceKey] = useState('');
  const [isLicenceValid, setIsLicenceValid] = useState(false);
  const [searchModule, setSearchModule] = useState('');
  const [showModuleDetails, setShowModuleDetails] = useState<string | null>(null);
  const [installingModule, setInstallingModule] = useState<string | null>(null);

  // Initialisation des services
  const moduleManager = new ModuleManager(localStorage.getItem('school_id') || 'default');
  const updateManager = new UpdateManager();
  const migrationManager = new MigrationManager();
  const licenceManager = new LicenceManager();

  // Chargement initial
  useEffect(() => {
    const init = async () => {
      // Vérifier la licence
      const savedKey = localStorage.getItem('licence_key');
      if (savedKey) {
        await loadLicence(savedKey);
      }
      
      // Charger les modules
      await loadModules();
      
      // Vérifier les mises à jour
      const update = await updateManager.checkForUpdates();
      if (update) setUpdateInfo(update);
      
      // Charger les migrations
      await migrationManager.loadAppliedMigrations();
      const pending = await migrationManager.getPendingMigrations();
      setMigrations(pending);
    };
    
    init();
  }, []);

  const loadLicence = async (key: string) => {
    const licenceData = await licenceManager.loadLicence(key);
    if (licenceData && licenceData.status === 'active') {
      setLicence(licenceData);
      setIsLicenceValid(true);
      localStorage.setItem('licence_key', key);
      onNotify('Licence validée avec succès', 'green');
    } else {
      onNotify('Licence invalide ou expirée', 'red');
    }
  };

  const loadModules = async () => {
    setLoading(true);
    try {
      const availableModules = await moduleManager.fetchAvailableModules();
      setModules(availableModules);
    } catch (error) {
      onNotify('Erreur lors du chargement des modules', 'red');
    } finally {
      setLoading(false);
    }
  };

  const installModule = async (module: Module) => {
    setInstallingModule(module.id);
    try {
      // Vérifier si le module est acheté
      if (!module.isPurchased && module.price && module.price > 0) {
        onNotify(`Le module ${module.displayName} coûte ${module.price} FCFA. Veuillez l'acheter d'abord.`, 'amber');
        return;
      }
      
      // Télécharger et installer le module
      await moduleManager.downloadModule(module.name, module.version);
      await moduleManager.loadModule(module.name, module.version);
      
      // Mettre à jour le statut
      setModules(prev => prev.map(m => 
        m.id === module.id ? { ...m, isLoaded: true, status: 'active' } : m
      ));
      
      onNotify(`Module ${module.displayName} installé avec succès`, 'green');
    } catch (error) {
      onNotify(`Erreur lors de l'installation de ${module.displayName}`, 'red');
    } finally {
      setInstallingModule(null);
    }
  };

  const applyUpdates = async () => {
    if (!updateInfo) return;
    
    setDownloadingUpdate(true);
    try {
      const blob = await updateManager.downloadUpdate(updateInfo);
      await updateManager.applyUpdate(blob);
      onNotify('Mise à jour téléchargée. L\'installation va démarrer.', 'green');
    } catch (error) {
      onNotify('Erreur lors du téléchargement de la mise à jour', 'red');
    } finally {
      setDownloadingUpdate(false);
    }
  };

  const applyMigrations = async () => {
    setMigrating(true);
    try {
      await migrationManager.applyAllPendingMigrations((current, total, migration) => {
        setMigrationProgress({ current, total });
        onNotify(`Migration ${migration.name} en cours...`, 'blue');
      });
      
      onNotify('Toutes les migrations ont été appliquées avec succès', 'green');
      setMigrations([]);
    } catch (error) {
      onNotify('Erreur lors de l\'application des migrations', 'red');
    } finally {
      setMigrating(false);
      setMigrationProgress({ current: 0, total: 0 });
    }
  };

  const filteredModules = modules.filter(m =>
    m.displayName.toLowerCase().includes(searchModule.toLowerCase()) ||
    m.description.toLowerCase().includes(searchModule.toLowerCase())
  );

  // Rendu du composant
  return (
    <div className="animate-[fadeIn_0.4s_ease]">
      {/* En-tête */}
      <div className="flex items-center justify-between mb-6 max-[768px]:flex-col max-[768px]:items-start max-[768px]:gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#1c2330] border border-[#21262d] flex items-center justify-center text-[#388bfd] rounded-lg">
            < HiComputerDesktop size={22} />
          </div>
          <div>
            <h1 className="text-xl font-semibold">Scolarys</h1>
            <p className="text-xs text-[#8b949e]">Logiciel de gestion d'école</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button 
            className="inline-flex items-center gap-2 px-3 py-1.5 text-[12px] font-medium border border-[#21262d] bg-transparent text-[#8b949e] cursor-pointer transition-all duration-200 hover:border-[#30363d] hover:text-[#e6edf3]"
            onClick={() => loadModules()}
          >
            <FiRefreshCw size={12} /> Actualiser
          </button>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex gap-1 mb-6 border-b border-[#21262d] overflow-x-auto">
        <button
          className={`flex items-center gap-2 px-4 py-2.5 text-[12px] font-medium transition-all duration-200 whitespace-nowrap ${
            activeTab === 'dashboard' 
              ? 'text-[#388bfd] border-b-2 border-[#388bfd]' 
              : 'text-[#8b949e] hover:text-[#e6edf3]'
          }`}
          onClick={() => setActiveTab('dashboard')}
        >
          <FiBarChart2 size={14} /> Tableau de bord
        </button>
        <button
          className={`flex items-center gap-2 px-4 py-2.5 text-[12px] font-medium transition-all duration-200 whitespace-nowrap ${
            activeTab === 'modules' 
              ? 'text-[#388bfd] border-b-2 border-[#388bfd]' 
              : 'text-[#8b949e] hover:text-[#e6edf3]'
          }`}
          onClick={() => setActiveTab('modules')}
        >
          <FiBox size={14} /> Modules
          {modules.filter(m => !m.isLoaded).length > 0 && (
            <span className="ml-1 px-1.5 py-0.5 text-[9px] bg-[#388bfd] text-white rounded-full">
              {modules.filter(m => !m.isLoaded).length}
            </span>
          )}
        </button>
        <button
          className={`flex items-center gap-2 px-4 py-2.5 text-[12px] font-medium transition-all duration-200 whitespace-nowrap ${
            activeTab === 'updates' 
              ? 'text-[#388bfd] border-b-2 border-[#388bfd]' 
              : 'text-[#8b949e] hover:text-[#e6edf3]'
          }`}
          onClick={() => setActiveTab('updates')}
        >
          <FiDownload size={14} /> Mises à jour
          {updateInfo && <span className="ml-1 w-2 h-2 bg-[#f85149] rounded-full" />}
        </button>
        <button
          className={`flex items-center gap-2 px-4 py-2.5 text-[12px] font-medium transition-all duration-200 whitespace-nowrap ${
            activeTab === 'database' 
              ? 'text-[#388bfd] border-b-2 border-[#388bfd]' 
              : 'text-[#8b949e] hover:text-[#e6edf3]'
          }`}
          onClick={() => setActiveTab('database')}
        >
          <FiDatabase size={14} /> Base de données
          {migrations.length > 0 && <span className="ml-1 px-1.5 py-0.5 text-[9px] bg-[#e3b341] text-black rounded-full">{migrations.length}</span>}
        </button>
      </div>

      {/* Contenu */}
      <div className="space-y-6">
        {/* Onglet Dashboard */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Licence Status */}
            <div className="bg-[#0d1117] border border-[#21262d] p-5">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <h3 className="text-sm font-semibold mb-1">État de la licence</h3>
                  <p className="text-xs text-[#8b949e]">
                    {licence ? `${licence.schoolName} - Plan ${licence.plan}` : 'Aucune licence chargée'}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {licence && (
                    <>
                      <StatusBadge status={licence.status} />
                      <div className="flex items-center gap-1 text-xs">
                        <FiClock size={12} className="text-[#484f58]" />
                        <span className="text-[#e6edf3]">{licenceManager.getRemainingDays()} jours restants</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
              
              {!isLicenceValid && (
                <div className="mt-4 p-4 bg-[#161b22] border border-[#21262d]">
                  <div className="flex flex-col gap-3">
                    <input
                      type="text"
                      placeholder="Entrez votre clé de licence"
                      value={licenceKey}
                      onChange={(e) => setLicenceKey(e.target.value)}
                      className="px-3 py-2 bg-[#0d1117] border border-[#21262d] text-[#e6edf3] text-sm focus:outline-none focus:border-[#388bfd]"
                    />
                    <button
                      onClick={() => loadLicence(licenceKey)}
                      className="px-4 py-2 bg-[#388bfd] text-white text-sm font-medium hover:bg-[#58a6ff] transition-colors"
                    >
                      Activer la licence
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Statistiques */}
            {licence && (
              <div className="grid grid-cols-4 gap-4 max-[900px]:grid-cols-2 max-[500px]:grid-cols-1">
                <div className="bg-[#0d1117] border border-[#21262d] p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <FiUsers size={16} className="text-[#484f58]" />
                    <span className="text-xs text-[#484f58] uppercase">Utilisateurs</span>
                  </div>
                  <span className="text-2xl font-semibold">{licence.currentUsers}</span>
                  <span className="text-xs text-[#484f58] ml-1">/ {licence.maxUsers}</span>
                  <ProgressBar value={licence.currentUsers} max={licence.maxUsers} />
                </div>
                <div className="bg-[#0d1117] border border-[#21262d] p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <FiBox size={16} className="text-[#484f58]" />
                    <span className="text-xs text-[#484f58] uppercase">Modules actifs</span>
                  </div>
                  <span className="text-2xl font-semibold">{modules.filter(m => m.isLoaded).length}</span>
                  <span className="text-xs text-[#484f58] ml-1">/ {modules.length}</span>
                </div>
                <div className="bg-[#0d1117] border border-[#21262d] p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <FiShield size={16} className="text-[#484f58]" />
                    <span className="text-xs text-[#484f58] uppercase">Score sécurité</span>
                  </div>
                  <span className="text-2xl font-semibold">{licence.secScore}</span>
                  <span className="text-xs text-[#484f58] ml-1">/ 100</span>
                  <div className="mt-2">
                    <StatusBadge status={licenceManager.getSecurityLevel() === 'high' ? 'active' : licenceManager.getSecurityLevel() === 'medium' ? 'pending' : 'error'} />
                  </div>
                </div>
                <div className="bg-[#0d1117] border border-[#21262d] p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <FiHardDrive size={16} className="text-[#484f58]" />
                    <span className="text-xs text-[#484f58] uppercase">Sauvegarde</span>
                  </div>
                  <span className="text-2xl font-semibold">24h</span>
                  <span className="text-xs text-[#484f58] ml-1">Dernière sauvegarde</span>
                </div>
              </div>
            )}

            {/* Features du plan */}
            {licence && licence.features.length > 0 && (
              <div className="bg-[#0d1117] border border-[#21262d] p-5">
                <h3 className="text-sm font-semibold mb-3">Fonctionnalités incluses</h3>
                <div className="flex flex-wrap gap-2">
                  {licence.features.map((feature, idx) => (
                    <span key={idx} className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] bg-[#1c2330] text-[#8b949e] border border-[#21262d]">
                      <FiCheckCircle size={10} className="text-[#39d353]" />
                      {feature}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Onglet Modules */}
        {activeTab === 'modules' && (
          <div className="space-y-4">
            {/* Barre de recherche */}
            <div className="flex items-center gap-3 px-4 py-2 bg-[#161b22] border border-[#21262d]">
              <FiSearch size={14} className="text-[#484f58]" />
              <input
                type="text"
                placeholder="Rechercher un module..."
                value={searchModule}
                onChange={(e) => setSearchModule(e.target.value)}
                className="flex-1 bg-transparent border-none text-[#e6edf3] text-[12px] placeholder:text-[#484f58] focus:outline-none"
              />
            </div>

            {/* Liste des modules */}
            <div className="space-y-3">
              {loading ? (
                <div className="text-center py-12">
                  <FiRefreshCw size={24} className="mx-auto text-[#484f58] animate-spin mb-3" />
                  <p className="text-[#8b949e] text-sm">Chargement des modules...</p>
                </div>
              ) : filteredModules.length === 0 ? (
                <div className="text-center py-12 bg-[#0d1117] border border-[#21262d]">
                  <FiBox size={32} className="mx-auto text-[#21262d] mb-3" />
                  <p className="text-[#8b949e] text-sm">Aucun module trouvé</p>
                </div>
              ) : (
                filteredModules.map((module) => (
                  <div key={module.id} className="bg-[#0d1117] border border-[#21262d] overflow-hidden">
                    <div className="p-4">
                      <div className="flex items-start justify-between flex-wrap gap-3">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 bg-[#1c2330] border border-[#21262d] flex items-center justify-center text-[#388bfd] rounded-lg shrink-0">
                            {module.icon ? <module.icon size={20} /> : <FiBox size={20} />}
                          </div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                              <h3 className="text-base font-semibold">{module.displayName}</h3>
                              <span className="text-[10px] text-[#484f58] font-mono">v{module.version}</span>
                              <StatusBadge status={module.status} />
                            </div>
                            <p className="text-xs text-[#8b949e] max-w-lg">{module.description}</p>
                            {module.permissions.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {module.permissions.slice(0, 3).map((perm, idx) => (
                                  <span key={idx} className="text-[9px] px-1.5 py-0.5 bg-[#1c2330] text-[#484f58]">{perm}</span>
                                ))}
                                {module.permissions.length > 3 && (
                                  <span className="text-[9px] px-1.5 py-0.5 bg-[#1c2330] text-[#484f58]">+{module.permissions.length - 3}</span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {!module.isPurchased && module.price && (
                            <span className="text-sm font-semibold text-[#e3b341]">{module.price.toLocaleString()} FCFA</span>
                          )}
                          <button
                            onClick={() => installModule(module)}
                            disabled={installingModule === module.id || module.isLoaded}
                            className={`inline-flex items-center gap-2 px-4 py-2 text-[12px] font-medium transition-all duration-200 ${
                              module.isLoaded
                                ? 'bg-[#1c2330] border border-[#21262d] text-[#8b949e] cursor-default'
                                : installingModule === module.id
                                ? 'bg-[#1c2330] border border-[#21262d] text-[#8b949e] cursor-wait'
                                : 'bg-[#388bfd] text-white hover:bg-[#58a6ff]'
                            }`}
                          >
                            {module.isLoaded ? (
                              <>
                                <FiCheckCircle size={12} /> Installé
                              </>
                            ) : installingModule === module.id ? (
                              <>
                                <FiRefreshCw size={12} className="animate-spin" /> Installation...
                              </>
                            ) : (
                              <>
                                <FiDownloadIcon size={12} /> Installer
                              </>
                            )}
                          </button>
                          <button
                            onClick={() => setShowModuleDetails(showModuleDetails === module.id ? null : module.id)}
                            className="w-8 h-8 flex items-center justify-center border border-[#21262d] bg-transparent text-[#8b949e] hover:text-[#e6edf3] transition-colors"
                          >
                            <FiChevronDown size={14} className={`transition-transform duration-200 ${showModuleDetails === module.id ? 'rotate-180' : ''}`} />
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    {/* Détails du module */}
                    {showModuleDetails === module.id && (
                      <div className="border-t border-[#21262d] p-4 bg-[#161b22]">
                        <div className="grid grid-cols-2 gap-4 text-sm max-[500px]:grid-cols-1">
                          <div>
                            <span className="text-[11px] text-[#484f58] uppercase block mb-1">Informations</span>
                            <div className="space-y-1 text-xs">
                              <p><span className="text-[#484f58]">ID:</span> <span className="text-[#e6edf3] font-mono">{module.id}</span></p>
                              <p><span className="text-[#484f58]">Nom technique:</span> <span className="text-[#e6edf3] font-mono">{module.name}</span></p>
                              <p><span className="text-[#484f58]">Auteur:</span> <span className="text-[#e6edf3]">{module.author || 'Nova Team'}</span></p>
                              <p><span className="text-[#484f58]">Date de sortie:</span> <span className="text-[#e6edf3]">{module.releaseDate || 'Non spécifiée'}</span></p>
                            </div>
                          </div>
                          <div>
                            <span className="text-[11px] text-[#484f58] uppercase block mb-1">Permissions</span>
                            <div className="flex flex-wrap gap-1">
                              {module.permissions.map((perm, idx) => (
                                <span key={idx} className="text-[10px] px-2 py-1 bg-[#0d1117] border border-[#21262d] text-[#8b949e] font-mono">{perm}</span>
                              ))}
                            </div>
                            {module.dependencies && module.dependencies.length > 0 && (
                              <>
                                <span className="text-[11px] text-[#484f58] uppercase block mt-3 mb-1">Dépendances</span>
                                <div className="flex flex-wrap gap-1">
                                  {module.dependencies.map((dep, idx) => (
                                    <span key={idx} className="text-[10px] px-2 py-1 bg-[#0d1117] border border-[#21262d] text-[#e3b341] font-mono">{dep}</span>
                                  ))}
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Onglet Mises à jour */}
        {activeTab === 'updates' && (
          <div className="space-y-4">
            {updateInfo ? (
              <div className="bg-[#0d1117] border border-[#21262d] p-5">
                <div className="flex items-start justify-between flex-wrap gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <FiDownload size={18} className="text-[#388bfd]" />
                      <h3 className="text-base font-semibold">Nouvelle version disponible !</h3>
                      <span className="px-2 py-0.5 text-[10px] bg-[#388bfd] text-white rounded">v{updateInfo.version}</span>
                    </div>
                    <p className="text-sm text-[#8b949e] mb-3">Une nouvelle version de Scolarys est disponible au téléchargement.</p>
                    <div className="text-xs text-[#484f58] space-y-1 mb-4">
                      <p>Taille: {(updateInfo.size / (1024 * 1024)).toFixed(1)} MB</p>
                      <p>Version actuelle: 3.2.1</p>
                      {updateInfo.mandatory && <p className="text-[#f85149]">⚠️ Cette mise à jour est obligatoire</p>}
                    </div>
                    <div className="bg-[#161b22] p-3 border border-[#21262d] mb-4">
                      <p className="text-xs text-[#8b949e]">{updateInfo.releaseNotes}</p>
                    </div>
                  </div>
                  <button
                    onClick={applyUpdates}
                    disabled={downloadingUpdate}
                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#388bfd] text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#58a6ff] transition-colors"
                  >
                    {downloadingUpdate ? (
                      <><FiRefreshCw size={14} className="animate-spin" /> Téléchargement...</>
                    ) : (
                      <><FiDownload size={14} /> Télécharger la mise à jour</>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-[#0d1117] border border-[#21262d] p-5 text-center">
                <FiCheckCircle size={32} className="mx-auto text-[#39d353] mb-3" />
                <h3 className="text-base font-semibold mb-1">Scolarys est à jour</h3>
                <p className="text-sm text-[#8b949e]">Vous utilisez la dernière version (3.2.1)</p>
              </div>
            )}
          </div>
        )}

        {/* Onglet Base de données */}
        {activeTab === 'database' && (
          <div className="space-y-4">
            {/* Statut des migrations */}
            <div className="bg-[#0d1117] border border-[#21262d] p-5">
              <div className="flex items-center justify-between flex-wrap gap-4 mb-4">
                <div>
                  <h3 className="text-sm font-semibold mb-1">Migrations de la base de données</h3>
                  <p className="text-xs text-[#8b949e]">
                    {migrations.length === 0 
                      ? 'Toutes les migrations sont à jour' 
                      : `${migrations.length} migration(s) en attente d'application`}
                  </p>
                </div>
                {migrations.length > 0 && !migrating && (
                  <button
                    onClick={applyMigrations}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-[#388bfd] text-white text-sm font-medium hover:bg-[#58a6ff] transition-colors"
                  >
                    <FiRotateCcw size={14} /> Appliquer les migrations
                  </button>
                )}
              </div>

              {/* Progression des migrations */}
              {migrating && migrationProgress.total > 0 && (
                <div className="mb-4 p-3 bg-[#161b22] border border-[#21262d]">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-[#8b949e]">Application des migrations...</span>
                    <span className="text-[#e6edf3]">{migrationProgress.current} / {migrationProgress.total}</span>
                  </div>
                  <div className="h-1.5 bg-[#1c2330] rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-[#388bfd] rounded-full transition-all duration-300"
                      style={{ width: `${(migrationProgress.current / migrationProgress.total) * 100}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Liste des migrations */}
              {migrations.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs text-[#484f58] uppercase">Migrations en attente</p>
                  {migrations.map((migration) => (
                    <div key={migration.version} className="flex items-center justify-between p-3 bg-[#161b22] border border-[#21262d]">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-mono text-[#388bfd]">{migration.version}</span>
                          <span className="text-xs text-[#e6edf3]">{migration.name}</span>
                        </div>
                        <p className="text-[10px] text-[#484f58]">Migration de la structure de la base de données</p>
                      </div>
                      <FiClock size={14} className="text-[#e3b341]" />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Informations de la base */}
            <div className="bg-[#0d1117] border border-[#21262d] p-5">
              <h3 className="text-sm font-semibold mb-3">Informations de connexion</h3>
              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2">
                  <FiServer size={12} className="text-[#484f58]" />
                  <span className="text-[#484f58]">Hôte:</span>
                  <span className="text-[#e6edf3] font-mono">localhost</span>
                </div>
                <div className="flex items-center gap-2">
                  <FiDatabase size={12} className="text-[#484f58]" />
                  <span className="text-[#484f58]">Base:</span>
                  <span className="text-[#e6edf3] font-mono">scolarys_db</span>
                </div>
                <div className="flex items-center gap-2">
                  <FiHardDrive size={12} className="text-[#484f58]" />
                  <span className="text-[#484f58]">Taille:</span>
                  <span className="text-[#e6edf3] font-mono">156 MB</span>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-[#21262d]">
                <div className="flex gap-2">
                  <button className="inline-flex items-center gap-2 px-3 py-1.5 text-[11px] border border-[#21262d] bg-transparent text-[#8b949e] hover:text-[#e6edf3] transition-colors">
                    <SiGooglesheets size={12} /> Exporter (Excel)
                  </button>
                  <button className="inline-flex items-center gap-2 px-3 py-1.5 text-[11px] border border-[#21262d] bg-transparent text-[#8b949e] hover:text-[#e6edf3] transition-colors">
                    <SiGooglesheets size={12} /> Exporter (CSV)
                  </button>
                </div>
              </div>
            </div>
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