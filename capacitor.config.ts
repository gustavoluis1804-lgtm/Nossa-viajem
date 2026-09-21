/**
 * Configuração para empacotar como app Android (APK/AAB) via Capacitor.
 * Tipagem local para não exigir @capacitor/cli no build web.
 * Ao instalar o Capacitor, este arquivo já é compatível com `npx cap sync`.
 * Veja o passo a passo em MOBILE.md.
 */
interface CapacitorConfigLocal {
  appId: string;
  appName: string;
  webDir: string;
  backgroundColor?: string;
  android?: {
    backgroundColor?: string;
    allowMixedContent?: boolean;
  };
}

const config: CapacitorConfigLocal = {
  appId: "com.nossaviagem.app",
  appName: "Nossa Viagem",
  webDir: "out",
  backgroundColor: "#07060c",
  android: {
    backgroundColor: "#07060c",
    allowMixedContent: false,
  },
};

export default config;
