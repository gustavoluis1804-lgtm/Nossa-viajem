# Nossa Viagem — Android

Projeto do app **Nossa Viagem**, preparado para ser enviado ao GitHub e gerar um APK automaticamente com GitHub Actions.

## Gerar o APK pelo GitHub

1. Crie um repositório no GitHub.
2. Envie **todo o conteúdo deste ZIP** para a raiz do repositório.
3. Abra a aba **Actions**.
4. Entre no workflow **Gerar APK Android**.
5. Clique em **Run workflow**.
6. Quando terminar, abra a execução e baixe o artefato **Nossa-Viagem-APK**.
7. Dentro do artefato estará o arquivo `app-debug.apk`.

O workflow também roda automaticamente quando houver `push` para `main` ou `master`.

## Estrutura mobile

- Next.js gera a versão estática em `out/`.
- Capacitor usa `out/` como conteúdo do aplicativo.
- O projeto Android é criado automaticamente no GitHub Actions.
- O APK é compilado pelo Gradle e publicado como artefato da execução.

## Rodar localmente

```bash
npm install
npm run dev
```

Para testar o build web estático:

```bash
npm run build
```
