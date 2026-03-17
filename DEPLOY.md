# Deploy: Vercel (frontend) + Railway (backend)

## Prerequisites

- Code pushed to **GitHub** (or GitLab/Bitbucket).
- **MongoDB Atlas** free cluster and connection string ([cloud.mongodb.com](https://cloud.mongodb.com)).
- **Railway** account ([railway.app](https://railway.app)).
- **Vercel** account ([vercel.com](https://vercel.com)).

---

## Part 1: Deploy backend on Railway

1. **Create MongoDB Atlas database (if needed)**  
   - Create a cluster → Connect → get connection string (e.g. `mongodb+srv://user:pass@cluster.mongodb.net/dbname?retryWrites=true&w=majority`).  
   - Network Access → Add IP → allow `0.0.0.0/0` so Railway can connect.

2. **Create a Railway project**  
   - Go to [railway.app](https://railway.app) → **Start a New Project**.  
   - Choose **Deploy from GitHub repo** and select your `Test-project` repo.

3. **Configure the backend service**  
   - After the service is created, open it → **Settings**.  
   - Set **Root Directory** to: `backend`.  
   - Set **Build Command** to: `npm install` (or leave default).  
   - Set **Start Command** to: `npm start` (or `node server.js`).  
   - Save.

4. **Add environment variables**  
   - In the same service, go to **Variables**.  
   - Add:

   | Variable      | Value |
   |---------------|--------|
   | `MONGO_URI`   | Your Atlas connection string (e.g. `mongodb+srv://...`) |
   | `JWT_SECRET`  | A long random string (e.g. generate with `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`) |
   | `CLIENT_URL`  | Leave empty for now; set after frontend is deployed (e.g. `https://your-app.vercel.app`) |

   - Railway sets `PORT` automatically; you don’t need to add it.

5. **Deploy and get the backend URL**  
   - Railway will build and deploy.  
   - In **Settings** → **Networking** → **Generate Domain** (or use the default).  
   - Copy the public URL, e.g. `https://your-backend.up.railway.app`.  
   - Your API base URL is: `https://your-backend.up.railway.app/api`.

6. **Test the backend**  
   - Open `https://your-backend.up.railway.app/api/health` in a browser. You should see `{"status":"ok"}`.

---

## Part 2: Deploy frontend on Vercel

1. **Import the repo on Vercel**  
   - Go to [vercel.com](https://vercel.com) → **Add New** → **Project**.  
   - Import your GitHub repo (e.g. `Test-project`).

2. **Configure the frontend project**  
   - **Root Directory**: click **Edit** and set to `frontend`.  
   - **Framework Preset**: Vite (should be auto-detected).  
   - **Build Command**: `npm run build`.  
   - **Output Directory**: `dist`.  
   - **Install Command**: `npm install`.

3. **Add environment variable**  
   - In **Environment Variables**, add:

   | Name             | Value |
   |------------------|--------|
   | `VITE_API_URL`   | `https://your-backend.up.railway.app/api` |

   Use the **exact** Railway backend URL from Part 1 (with `/api` at the end).  
   - Apply to **Production** (and Preview if you want).

4. **Deploy**  
   - Click **Deploy**.  
   - When it finishes, copy your frontend URL, e.g. `https://your-app.vercel.app`.

---

## Part 3: Connect frontend and backend

1. **Set CORS on the backend**  
   - In **Railway** → your backend service → **Variables**.  
   - Add or update `CLIENT_URL` to your Vercel frontend URL (no trailing slash), e.g. `https://your-app.vercel.app`.  
   - Redeploy the backend if needed (Railway usually redeploys when variables change).

2. **Verify**  
   - Open your Vercel URL in a browser.  
   - Register or log in and use the app; API calls should go to Railway and succeed.

---

## Quick reference

| Where   | Variable       | Example |
|--------|----------------|---------|
| Railway | `MONGO_URI`    | `mongodb+srv://user:pass@cluster.mongodb.net/dbname?retryWrites=true&w=majority` |
| Railway | `JWT_SECRET`   | Long random string (e.g. 32+ chars) |
| Railway | `CLIENT_URL`   | `https://your-app.vercel.app` |
| Vercel  | `VITE_API_URL` | `https://your-backend.up.railway.app/api` |

---

## Troubleshooting

- **CORS errors**: Ensure `CLIENT_URL` on Railway exactly matches your Vercel URL (protocol, domain, no trailing slash).  
- **401 / auth errors**: Ensure `JWT_SECRET` is set on Railway and hasn’t changed after users logged in.  
- **API not reachable**: Check Railway service is deployed and the generated domain is correct; test `/api/health` in a browser.  
- **Blank page or 404 on refresh**: The `frontend/vercel.json` rewrites should send all routes to `index.html`; redeploy the frontend if you added it later.
