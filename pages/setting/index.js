import { useEffect, useState, useCallback } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

// Mock Utils for demo - replace with your actual Utils import
const Utils = {
  GetRandomNumber: (min, max) => Math.floor(Math.random() * (max - min + 1)) + min
};

// Configuration keys
const QUIZ_CONFIG_KEYS = {
  QUIZ_ENABLE: "COOKIEKID:QUIZ:ENABLE",
  SHOW_ANSWER: "COOKIEKID:QUIZ:SHOW_ANSWER",
  ALLOW_DISMISS: "COOKIEKID:QUIZ:ALLOW_DISMISS",
  CHANGE_QUESTION_ON_WRONG: "COOKIEKID:QUIZ:CHANGE_QUESTION_ON_WRONG"
};

const GENERAL_CONFIG_KEYS = {
  DARK_MODE: "COOKIEKID:GENERAL:DARK_MODE",
  NOTIFICATIONS: "COOKIEKID:GENERAL:NOTIFICATIONS",
  AUTO_SAVE: "COOKIEKID:GENERAL:AUTO_SAVE",
  SOUND_EFFECTS: "COOKIEKID:GENERAL:SOUND_EFFECTS"
};

// Quiz settings configuration
const QUIZ_SETTINGS = [
  {
    key: QUIZ_CONFIG_KEYS.QUIZ_ENABLE,
    label: "Aktifkan quiz?",
    description: "Mengaktifkan atau menonaktifkan fitur quiz"
  },
  {
    key: QUIZ_CONFIG_KEYS.SHOW_ANSWER,
    label: "Tampilkan jawaban setelah diklik 2x?",
    description: "Menampilkan jawaban setelah pengguna salah dua kali"
  },
  {
    key: QUIZ_CONFIG_KEYS.ALLOW_DISMISS,
    label: "Tampilkan tombol tutup quiz?",
    description: "Memungkinkan pengguna untuk menutup quiz"
  },
  {
    key: QUIZ_CONFIG_KEYS.CHANGE_QUESTION_ON_WRONG,
    label: "Ganti soal quiz ketika salah jawab 2x?",
    description: "Mengganti pertanyaan ketika pengguna salah dua kali"
  }
];

// General settings configuration
const GENERAL_SETTINGS = [
  {
    key: GENERAL_CONFIG_KEYS.DARK_MODE,
    label: "Mode gelap",
    description: "Mengaktifkan tampilan mode gelap untuk aplikasi"
  },
  {
    key: GENERAL_CONFIG_KEYS.NOTIFICATIONS,
    label: "Notifikasi",
    description: "Menerima notifikasi dari aplikasi"
  },
  {
    key: GENERAL_CONFIG_KEYS.AUTO_SAVE,
    label: "Simpan otomatis",
    description: "Menyimpan progress secara otomatis"
  },
  {
    key: GENERAL_CONFIG_KEYS.SOUND_EFFECTS,
    label: "Efek suara",
    description: "Memainkan efek suara saat interaksi"
  }
];

// Tab configuration
const TABS = [
  {
    id: "quiz",
    label: "Quiz",
    icon: "❓",
    settings: QUIZ_SETTINGS
  },
  // {
  //   id: "general",
  //   label: "Umum",
  //   icon: "⚙️",
  //   settings: GENERAL_SETTINGS
  // }
];

// Custom hook for localStorage management
function useLocalStorageConfig() {
  const [config, setConfig] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadConfig = () => {
      const newConfig = {};
      const allKeys = { ...QUIZ_CONFIG_KEYS, ...GENERAL_CONFIG_KEYS };
      Object.values(allKeys).forEach(key => {
        let val = localStorage.getItem(key);
        if (val === undefined) {
          val = "on";
          localStorage.setItem(key, val);
        }
        newConfig[key] = val;
      });
      setConfig(newConfig);
      setIsLoading(false);
    };

    loadConfig();
  }, []);

  const updateConfig = useCallback((key, value) => {
    setConfig(prev => ({
      ...prev,
      [key]: value
    }));
    localStorage.setItem(key, value)
  }, []);

  return { config, updateConfig, isLoading };
}

// Setting Item Component with Switch
function SettingItem({ setting, value, onChange, disabled }) {
  const isOn = value === "on";

  const handleSwitchChange = (checked) => {
    onChange(checked ? "on" : "off");
  };

  return (
    <div className="flex items-start justify-between space-y-0 pb-4">
      <div className="space-y-1 pr-4 flex-1">
        <Label
          htmlFor={setting.key}
          className="text-base font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          {setting.label}
        </Label>
        <p className="text-sm text-muted-foreground">
          {setting.description}
        </p>
      </div>
      <div className="flex items-center space-x-2">
        <span className="text-sm text-muted-foreground">
          {isOn ? "Aktif" : "Nonaktif"}
        </span>
        <Switch
          id={setting.key}
          checked={isOn}
          onCheckedChange={handleSwitchChange}
          disabled={disabled}
          aria-describedby={`${setting.key}-description`}
        />
      </div>
    </div>
  );
}

// Tab Button Component
function TabButton({ tab, isActive, onClick }) {
  return (
    <button
      onClick={() => onClick(tab.id)}
      className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 flex items-center gap-3 ${
        isActive
          ? "bg-blue-100 text-blue-700 border border-blue-200 shadow-sm"
          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
      }`}
    >
      <span className="text-lg">{tab.icon}</span>
      <span className="font-medium">{tab.label}</span>
    </button>
  );
}

// Math Challenge Component
function MathChallenge({ onUnlock }) {
  const [val1, setVal1] = useState(0);
  const [val2, setVal2] = useState(0);
  const [answer, setAnswer] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    generateNewProblem();
  }, []);

  const generateNewProblem = useCallback(() => {
    setVal1(Utils.GetRandomNumber(1, 10));
    setVal2(Utils.GetRandomNumber(1, 10));
    setAnswer("");
    setError("");
  }, []);

  const handleSubmit = useCallback(async (e) => {
    if (e) e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const correctAnswer = val1 + val2;
      const userAnswer = parseInt(answer, 10);

      if (isNaN(userAnswer)) {
        setError("Harap masukkan angka yang valid");
        return;
      }

      if (userAnswer === correctAnswer) {
        onUnlock();
      } else {
        setError("Jawaban salah. Coba lagi!");
        generateNewProblem();
      }
    } catch (err) {
      setError("Terjadi kesalahan. Coba lagi!");
    } finally {
      setIsLoading(false);
    }
  }, [val1, val2, answer, onUnlock, generateNewProblem]);

  return (
    <div className="border border-blue-200 rounded-lg p-6 mb-6">
      <h2 className="text-xl font-semibold mb-4">
        Verifikasi Akses Settings
      </h2>
      <p className="mb-4">
        Selesaikan perhitungan di bawah ini untuk mengakses pengaturan:
      </p>

      <div className="space-y-4">
        <div className="flex items-center gap-3 text-lg">
          <span className="px-3 py-2 rounded border font-mono">
            {val1}
          </span>
          <span className="">+</span>
          <span className="px-3 py-2 rounded border font-mono">
            {val2}
          </span>
          <span className="">=</span>
          <input
            type="number"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSubmit(e);
              }
            }}
            className="w-24 px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="?"
            disabled={isLoading}
            aria-label="Masukkan jawaban"
          />
          <button
            onClick={handleSubmit}
            disabled={isLoading || !answer.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? "..." : "Buka Settings"}
          </button>
        </div>

        {error && (
          <div className="text-sm text-red-700 bg-red-50 px-3 py-2 rounded border border-red-200">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}

// Settings Content Component
function SettingsContent({ activeTab, config, onConfigChange, isUnlocked }) {
  const currentTab = TABS.find(tab => tab.id === activeTab);

  if (!currentTab) return null;

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2 flex items-center gap-2">
          <span>{currentTab.icon}</span>
          Pengaturan {currentTab.label}
        </h2>
        <p className="text-muted-foreground">
          {activeTab === 'quiz'
            ? "Kelola konfigurasi quiz dan fitur-fitur terkait"
            : "Kelola pengaturan umum aplikasi"
          }
        </p>
      </div>

      <div className="space-y-4">
        {currentTab.settings.map((setting) => (
          <div key={setting.key} className="border-b border-gray-200 pb-4 last:border-b-0">
            <SettingItem
              setting={setting}
              value={config[setting.key] || "on"}
              onChange={(value) => onConfigChange(setting.key, value)}
              disabled={!isUnlocked}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

// Main Settings Component
export default function Settings() {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [activeTab, setActiveTab] = useState("quiz");
  const { config, updateConfig, isLoading } = useLocalStorageConfig();

  const handleUnlock = useCallback(() => {
    setIsUnlocked(true);
  }, []);

  const handleConfigChange = useCallback((key, value) => {
    updateConfig(key, value);
  }, [updateConfig]);

  const handleTabChange = useCallback((tabId) => {
    setActiveTab(tabId);
  }, []);

  if (isLoading) {
    return (
      <main className="p-6 max-w-6xl mx-auto">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="flex gap-6">
            <div className="w-64 space-y-2">
              {[1, 2].map(i => (
                <div key={i} className="h-12 bg-gray-200 rounded"></div>
              ))}
            </div>
            <div className="flex-1 space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-20 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
          ⚙️ Pengaturan Aplikasi
        </h1>
        <p className="text-muted-foreground">
          Kelola semua pengaturan dan konfigurasi aplikasi
        </p>
      </div>

      {!isUnlocked && <MathChallenge onUnlock={handleUnlock} />}

      <div className={`transition-all duration-300 ${
        !isUnlocked ? "opacity-50 pointer-events-none" : "opacity-100"
      }`}>
        <div className="flex gap-6">
          {/* Left Sidebar - Tabs */}
          <div className="w-64 flex-shrink-0">
            <div className="sticky top-6">
              <div className="border border-gray-200 rounded-lg p-2 shadow-sm">
                <div className="space-y-1">
                  {TABS.map((tab) => (
                    <TabButton
                      key={tab.id}
                      tab={tab}
                      isActive={activeTab === tab.id}
                      onClick={handleTabChange}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Content Area */}
          <div className="flex-1 min-w-0">
            <div className="border border-gray-200 rounded-lg p-6 shadow-sm">
              <SettingsContent
                activeTab={activeTab}
                config={config}
                onConfigChange={handleConfigChange}
                isUnlocked={isUnlocked}
              />
            </div>
          </div>
        </div>

        {isUnlocked && (
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-green-700 font-medium">
                ✅ Pengaturan berhasil dimuat dan siap digunakan
              </span>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}