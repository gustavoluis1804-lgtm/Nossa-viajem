# Nossa Viagem — APK Android

Este pacote já está preparado para build automático no GitHub.

## Pelo GitHub Actions

O arquivo `.github/workflows/android-apk.yml`:

1. instala Node 22 e Java 21;
2. instala as dependências do projeto;
3. instala o Capacitor para o build;
4. executa `npm run build` e gera `out/`;
5. cria e sincroniza o projeto Android;
6. executa `./gradlew assembleDebug`;
7. publica o APK no artefato `Nossa-Viagem-APK`.

## Configuração do Capacitor

- App ID: `com.nossaviagem.app`
- Nome: `Nossa Viagem`
- WebDir: `out`

Não é necessário enviar uma pasta `android/` pronta: o workflow cria essa pasta durante cada build.
