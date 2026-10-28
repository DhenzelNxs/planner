# planner

Aplicativo mobile para organizar viagens em grupo: criação de viagens com período definido, roteiro de atividades por dia, convite e confirmação de participantes e compartilhamento de links importantes (reservas, hospedagem, etc).

O projeto é full stack: um app em React Native/Expo no front-end e uma API em Flask (Python) como back-end, com persistência em SQLite.

## Funcionalidades

- Cadastro de viagem com destino e período (data de início e fim).
- Convite de participantes por e-mail, com confirmação de presença individual.
- Confirmação da viagem pelo organizador.
- Roteiro de atividades organizado por dia, dentro do período da viagem.
- Cadastro de links importantes relacionados à viagem (hospedagem, passagens, reservas etc).
- Persistência local da viagem ativa no dispositivo (AsyncStorage), permitindo retomar o planejamento ao reabrir o app.

## Tecnologias

**Mobile (front-end)**

- [Expo](https://expo.dev/) / [React Native](https://reactnative.dev/) 0.74
- [Expo Router](https://docs.expo.dev/router/introduction/) para navegação baseada em arquivos
- [TypeScript](https://www.typescriptlang.org/)
- [NativeWind](https://www.nativewind.dev/) (Tailwind CSS para React Native)
- [Axios](https://axios-http.com/) para consumo da API
- [Zod](https://zod.dev/) para validação de formulários
- [day.js](https://day.js.org/) e [react-native-calendars](https://github.com/wix/react-native-calendars) para datas e calendário
- [AsyncStorage](https://react-native-async-storage.github.io/async-storage/) para persistência local

**Backend (API)**

- [Flask](https://flask.palletsprojects.com/)
- [Flask-SQLAlchemy](https://flask-sqlalchemy.palletsprojects.com/) com SQLite
- [Flask-CORS](https://flask-cors.readthedocs.io/)

## Estrutura do projeto

```text
.
├── server/          # API em Flask (modelos, rotas e configuração)
├── src/
│   ├── app/         # Telas e rotas (Expo Router)
│   ├── components/  # Componentes de UI reutilizáveis
│   ├── server/      # Cliente HTTP (axios) e chamadas à API
│   ├── storage/     # Persistência local da viagem (AsyncStorage)
│   ├── styles/      # Cores e tipografia
│   └── utils/       # Utilitários (calendário, locale, validação)
└── android/         # Projeto nativo Android (gerado pelo Expo)
```

## Como rodar o projeto

O app depende da API local rodando na mesma rede do dispositivo/emulador, então é preciso subir o backend antes do app.

### 1. Backend (Flask)

Pré-requisitos: Python 3.

```bash
cd server
pip install flask flask-sqlalchemy flask-cors
python app.py
```

A API sobe em `http://0.0.0.0:3333`, com as rotas disponíveis em `/api` (ex.: `/api/trips`). O banco SQLite (`app.db`) é criado automaticamente na primeira execução.

### 2. Configurar o endereço da API

Em `src/server/api.ts`, ajuste a `baseURL` para o IP da máquina onde o backend está rodando na sua rede local:

```ts
export const api = axios.create({
    baseURL: "http://SEU_IP_LOCAL:3333/api"
})
```

### 3. App (Expo)

Pré-requisitos: Node.js e um emulador Android/iOS ou o app Expo Go no celular.

```bash
npm install
npm run start
```

Outros comandos disponíveis:

```bash
npm run android   # builda e abre no emulador/dispositivo Android
npm run ios       # builda e abre no simulador iOS
npm run web       # abre a versão web
npm run test      # roda os testes com Jest
```
