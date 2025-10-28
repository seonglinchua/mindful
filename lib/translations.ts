import type { Language } from "./customization-types";

export interface Translations {
  // Navigation
  "nav.home": string;
  "nav.mood": string;
  "nav.breathing": string;
  "nav.journal": string;
  "nav.intentions": string;
  "nav.analytics": string;
  "nav.settings": string;

  // Common
  "common.save": string;
  "common.cancel": string;
  "common.delete": string;
  "common.edit": string;
  "common.close": string;
  "common.loading": string;
  "common.error": string;
  "common.success": string;

  // Mood Tracker
  "mood.title": string;
  "mood.today": string;
  "mood.addNote": string;
  "mood.streak": string;
  "mood.veryBad": string;
  "mood.bad": string;
  "mood.okay": string;
  "mood.good": string;
  "mood.veryGood": string;

  // Breathing
  "breathing.title": string;
  "breathing.start": string;
  "breathing.stop": string;
  "breathing.pattern": string;
  "breathing.duration": string;
  "breathing.inhale": string;
  "breathing.hold": string;
  "breathing.exhale": string;

  // Journal
  "journal.title": string;
  "journal.newEntry": string;
  "journal.writeHere": string;
  "journal.tags": string;

  // Settings
  "settings.title": string;
  "settings.appearance": string;
  "settings.colorTheme": string;
  "settings.darkMode": string;
  "settings.fontSize": string;
  "settings.language": string;
  "settings.notifications": string;
  "settings.dashboard": string;
}

export const translations: Record<Language, Translations> = {
  en: {
    // Navigation
    "nav.home": "Home",
    "nav.mood": "Mood",
    "nav.breathing": "Breathing",
    "nav.journal": "Journal",
    "nav.intentions": "Intentions",
    "nav.analytics": "Analytics",
    "nav.settings": "Settings",

    // Common
    "common.save": "Save",
    "common.cancel": "Cancel",
    "common.delete": "Delete",
    "common.edit": "Edit",
    "common.close": "Close",
    "common.loading": "Loading...",
    "common.error": "Error",
    "common.success": "Success",

    // Mood Tracker
    "mood.title": "How are you feeling today?",
    "mood.today": "Today",
    "mood.addNote": "Add a note...",
    "mood.streak": "day streak",
    "mood.veryBad": "Very Bad",
    "mood.bad": "Bad",
    "mood.okay": "Okay",
    "mood.good": "Good",
    "mood.veryGood": "Very Good",

    // Breathing
    "breathing.title": "Breathing Exercise",
    "breathing.start": "Start",
    "breathing.stop": "Stop",
    "breathing.pattern": "Pattern",
    "breathing.duration": "Duration",
    "breathing.inhale": "Inhale",
    "breathing.hold": "Hold",
    "breathing.exhale": "Exhale",

    // Journal
    "journal.title": "Journal",
    "journal.newEntry": "New Entry",
    "journal.writeHere": "Write your thoughts here...",
    "journal.tags": "Tags",

    // Settings
    "settings.title": "Settings",
    "settings.appearance": "Appearance",
    "settings.colorTheme": "Color Theme",
    "settings.darkMode": "Dark Mode",
    "settings.fontSize": "Font Size",
    "settings.language": "Language",
    "settings.notifications": "Notifications",
    "settings.dashboard": "Dashboard Layout",
  },
  es: {
    // Navigation
    "nav.home": "Inicio",
    "nav.mood": "Estado de ánimo",
    "nav.breathing": "Respiración",
    "nav.journal": "Diario",
    "nav.intentions": "Intenciones",
    "nav.analytics": "Análisis",
    "nav.settings": "Configuración",

    // Common
    "common.save": "Guardar",
    "common.cancel": "Cancelar",
    "common.delete": "Eliminar",
    "common.edit": "Editar",
    "common.close": "Cerrar",
    "common.loading": "Cargando...",
    "common.error": "Error",
    "common.success": "Éxito",

    // Mood Tracker
    "mood.title": "¿Cómo te sientes hoy?",
    "mood.today": "Hoy",
    "mood.addNote": "Añadir una nota...",
    "mood.streak": "días consecutivos",
    "mood.veryBad": "Muy mal",
    "mood.bad": "Mal",
    "mood.okay": "Regular",
    "mood.good": "Bien",
    "mood.veryGood": "Muy bien",

    // Breathing
    "breathing.title": "Ejercicio de respiración",
    "breathing.start": "Comenzar",
    "breathing.stop": "Detener",
    "breathing.pattern": "Patrón",
    "breathing.duration": "Duración",
    "breathing.inhale": "Inhalar",
    "breathing.hold": "Mantener",
    "breathing.exhale": "Exhalar",

    // Journal
    "journal.title": "Diario",
    "journal.newEntry": "Nueva entrada",
    "journal.writeHere": "Escribe tus pensamientos aquí...",
    "journal.tags": "Etiquetas",

    // Settings
    "settings.title": "Configuración",
    "settings.appearance": "Apariencia",
    "settings.colorTheme": "Tema de color",
    "settings.darkMode": "Modo oscuro",
    "settings.fontSize": "Tamaño de fuente",
    "settings.language": "Idioma",
    "settings.notifications": "Notificaciones",
    "settings.dashboard": "Diseño del panel",
  },
  fr: {
    // Navigation
    "nav.home": "Accueil",
    "nav.mood": "Humeur",
    "nav.breathing": "Respiration",
    "nav.journal": "Journal",
    "nav.intentions": "Intentions",
    "nav.analytics": "Analytique",
    "nav.settings": "Paramètres",

    // Common
    "common.save": "Enregistrer",
    "common.cancel": "Annuler",
    "common.delete": "Supprimer",
    "common.edit": "Modifier",
    "common.close": "Fermer",
    "common.loading": "Chargement...",
    "common.error": "Erreur",
    "common.success": "Succès",

    // Mood Tracker
    "mood.title": "Comment vous sentez-vous aujourd'hui?",
    "mood.today": "Aujourd'hui",
    "mood.addNote": "Ajouter une note...",
    "mood.streak": "jours consécutifs",
    "mood.veryBad": "Très mauvais",
    "mood.bad": "Mauvais",
    "mood.okay": "Correct",
    "mood.good": "Bien",
    "mood.veryGood": "Très bien",

    // Breathing
    "breathing.title": "Exercice de respiration",
    "breathing.start": "Commencer",
    "breathing.stop": "Arrêter",
    "breathing.pattern": "Modèle",
    "breathing.duration": "Durée",
    "breathing.inhale": "Inspirer",
    "breathing.hold": "Retenir",
    "breathing.exhale": "Expirer",

    // Journal
    "journal.title": "Journal",
    "journal.newEntry": "Nouvelle entrée",
    "journal.writeHere": "Écrivez vos pensées ici...",
    "journal.tags": "Étiquettes",

    // Settings
    "settings.title": "Paramètres",
    "settings.appearance": "Apparence",
    "settings.colorTheme": "Thème de couleur",
    "settings.darkMode": "Mode sombre",
    "settings.fontSize": "Taille de police",
    "settings.language": "Langue",
    "settings.notifications": "Notifications",
    "settings.dashboard": "Disposition du tableau de bord",
  },
  zh: {
    // Navigation
    "nav.home": "首页",
    "nav.mood": "心情",
    "nav.breathing": "呼吸",
    "nav.journal": "日记",
    "nav.intentions": "意图",
    "nav.analytics": "分析",
    "nav.settings": "设置",

    // Common
    "common.save": "保存",
    "common.cancel": "取消",
    "common.delete": "删除",
    "common.edit": "编辑",
    "common.close": "关闭",
    "common.loading": "加载中...",
    "common.error": "错误",
    "common.success": "成功",

    // Mood Tracker
    "mood.title": "你今天感觉如何？",
    "mood.today": "今天",
    "mood.addNote": "添加笔记...",
    "mood.streak": "天连续",
    "mood.veryBad": "很糟糕",
    "mood.bad": "糟糕",
    "mood.okay": "还行",
    "mood.good": "良好",
    "mood.veryGood": "非常好",

    // Breathing
    "breathing.title": "呼吸练习",
    "breathing.start": "开始",
    "breathing.stop": "停止",
    "breathing.pattern": "模式",
    "breathing.duration": "持续时间",
    "breathing.inhale": "吸气",
    "breathing.hold": "屏住",
    "breathing.exhale": "呼气",

    // Journal
    "journal.title": "日记",
    "journal.newEntry": "新条目",
    "journal.writeHere": "在此写下你的想法...",
    "journal.tags": "标签",

    // Settings
    "settings.title": "设置",
    "settings.appearance": "外观",
    "settings.colorTheme": "颜色主题",
    "settings.darkMode": "暗黑模式",
    "settings.fontSize": "字体大小",
    "settings.language": "语言",
    "settings.notifications": "通知",
    "settings.dashboard": "仪表板布局",
  },
};
